define(function(require, exports, module) {
	var baseController = require('baseController');
	var template = require('template');
	var bC = new baseController();
	var ResourceService = require('ResourceService');
	var Helper = require("helper");
	var Pagination = require('lib.Pagination');

	// 文件上传插件
	var uploader = require("scripts/public/uploader");

	require("plugins/zeroclipboard/ZeroClipboard");

	var orgId, skip, limit;

	var controller = function() {
		var _controller = this;
		_controller.namespace = "file.list";
		_controller.actions = {
			// 删除文件
			remove: function() {
				var _btn = this;
				var sourceId = _btn.attr("data-value");
				Helper.confirm("确定删除该文件？", {}, function() {
					Helper.begin(_btn);
					ResourceService.remove(orgId, sourceId).done(function(data) {
						Helper.successToast("删除成功！");
						render();
					}).fail(function(error) {
						Helper.alert(error);
					}).always(function() {
						Helper.end(_btn);
					});
				});
			}
		}
	};


	bC.extend(controller);
	controller.prototype.init = function(templateName, fn) {
		tmp = templateName;
		orgId = App.organization.info.id;
		page = +Helper.param.search('page') || 1;
		limit = +Helper.param.search('limit') || 10;
		skip = (page - 1) * limit;
		render(fn);
	};

	function render(callback) {
		ResourceService.getList(orgId, skip, limit, 'FILE').done(function(data) {
			var total = data.result.total;
			var resources = data.result.data;
			Helper.globalRender(template(tmp, {
				resources: resources,
				count: total,
				pagination: Helper.pagination(total, limit, page)
			}));
			uploadListenser();
			copyBoardListenser();

			Pagination(total, limit, page, {
				switchPage: function(pageIndex) {
					page = pageIndex;
					Application.loader.begin();
					controller.render(function() {
						Application.loader.end();
					});
				}
			});
			
		}).fail(function(error) {
			Helper.alert(error);
		}).always(function() {
			Helper.execute(callback);
		});
	};


	// 上传文件事件绑定
	function uploadListenser() {
		var session = App.getSession();
		var $input = $("#FileUploadInput");
		var timer;
		uploader.file($input, orgId, session, {
			cancelBtn: $("#BtnUploadCancel"),
			onUploadStart: function() {
				$input.uploadify("disable", true);
				$("#BtnUploadCancel").removeClass("hide");
				$input.uploadify("settings", "buttonText", "正在上传...");

				var i = 0;

				// 由于插件本身问题，进度显示不流畅，故此在start事件中模拟进度
				timer = setInterval(run, 300);

				function run() {
					if (i < 98) {
						$input.uploadify("settings", "buttonText", "已上传" + (i++) + "%");
					}
				};
			},
			onUploadProgress: function(file, bytesUploaded, bytesTotal, totalBytesUploaded, totalBytesTotal) {
				// 由于插件本身问题，进度显示不流畅，故此在start事件中模拟进度
				// var progress = bytesUploaded / bytesTotal;
			},
			onUploadSuccess: function() {
				$input.uploadify("settings", "buttonText", "继续上传");
				Helper.successToast("上传成功！");
				setTimeout(function() {
					render();
				}, 200);
			},
			onUploadError: function(file, errorCode, errorMsg, errorString) {
				$input.uploadify("settings", "buttonText", "重新上传");
				Helper.alert(errorMsg);
			},
			onUploadComplete: function(file) {
				$("#BtnUploadCancel").addClass("hide");
				$input.uploadify("disable", false);
				clearInterval(timer);
			},
			onCancel: function() {
				$("#BtnUploadCancel").addClass("hide");
				$input.uploadify("settings", "buttonText", "已取消上传");
				setTimeout(function() {
					$input.uploadify("disable", false);
					$input.uploadify("settings", "buttonText", "重新上传");
				}, 500);
			}
		});
	};

	// 复制按钮
	function copyBoardListenser() {
		$(".btn-clipboard").each(function(idx, item) {
			Helper.copyClientboard(item);
		});
	};

	module.exports = controller;

});
