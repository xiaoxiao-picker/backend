define(function(require, exports, module) {
	var baseController = require('baseController');
	var bC = new baseController();
	var template = require('template');
	var Helper = require("helper");

	var WechatResourceService = require('WechatResourceService');

	var page, limit = 12;
	var organizationId = Application.organization.id;

	var panelBodySelector = ".resource-weixin-image-content .panel-body";

	var uploader = require("scripts/public/uploader");
	var Pagination = require('lib.Pagination');

	var Controller = function() {
		var controller = this;
		controller.namespace = "resource.weixin.image";
		controller.actions = {
			// 同步微信素材
			update: function() {
				var $btn = this;
				Helper.begin($btn);
				WechatResourceService.image.synchronize(organizationId).done(function(data) {
					skip = 0;
					Application.loader.begin();
					controller.render(function() {
						Application.loader.end();
						$(".btn-delete-selected-image").attr("disabled", "disabled");
						$("#Checkbox_All_Select").prop("checked", false);
					});
				}).fail(function(error) {
					Helper.alert(error);
				}).always(function() {
					Helper.end($btn);
				});
			},
			// 全选/全不选
			makeAllSelectRange: function() {
				var checked = this.get(0).checked;
				$(panelBodySelector).find("input.image-checkbox").prop("checked", checked);

				var $selectedRange = $(panelBodySelector).find("input.image-checkbox:checked");
				var $btnRemove = $(".btn-delete-selected-image");
				if ($selectedRange.length > 0) {
					$btnRemove.removeAttr("disabled");
				} else {
					$btnRemove.attr("disabled", "disabled");
				}
			},
			// 删除所选图片
			removeSelectedImages: function() {
				var $btn = this;
				var $selectedRange = $(panelBodySelector).find("input.image-checkbox:checked");
				if ($selectedRange.length == 0) return Helper.errorToast('请至少选中一张图片！');

				var selectedImageIds = [];
				$selectedRange.each(function(idx, item) {
					selectedImageIds.push($(item).parents(".image-containner").attr("data-image-id"));
				});

				Helper.confirm("删除后微信图片素材中也将被删除，仍然删除这 " + selectedImageIds.length + " 张图片？", function() {
					var $imageBoxes = $selectedRange.parents(".image-containner");
					var $removeBtns = $imageBoxes.find(".btn-remove");
					Helper.begin($removeBtns);
					// 一次性删除多张图片
					WechatResourceService.image.remove("", selectedImageIds.join(',')).done(function(data) {
						// 渐变消失
						$imageBoxes.animate({
							opacity: 0
						}, 500, function() {
							this.remove();
						});
					}).fail(function(error) {
						Helper.alert(error);
					}).always(function() {
						Helper.end($removeBtns);
					})
				});
			},
			// 选中/不选中
			makeSelectRange: function() {
				var $allRange = $(panelBodySelector).find("input.image-checkbox");
				var $selectedRange = $(panelBodySelector).find("input.image-checkbox:checked");

				var $btnRemove = $(".btn-delete-selected-image");

				if ($selectedRange.length > 0) {
					$btnRemove.removeAttr("disabled");
				} else {
					$btnRemove.attr("disabled", "disabled");
				}

				if ($allRange.length && $allRange.length == $selectedRange.length) {
					$("input[name=weixin-image-select-all]").prop("checked", true);
				} else {
					$("input[name=weixin-image-select-all]").prop("checked", false);
				}
			},
			remove: function() {
				var $btn = this;
				var $imageBox = $btn.parents(".image-containner");
				var imageId = $imageBox.attr("data-image-id");
				Helper.confirm("删除后微信图片素材中也将被删除，仍然删除这张图片？", function() {
					Helper.begin($btn);
					WechatResourceService.image.remove(imageId).done(function(data) {
						// 渐变消失
						$imageBox.animate({
							opacity: 0
						}, 500, function() {
							this.remove();
						});
					}).fail(function(error) {
						Helper.alert(error);
					}).always(function() {
						Helper.end($btn);
					});
				});
			},
			checkImage: function() {
				var imageURL = this.attr("data-image-src");

				require.async("ImageBrowser", function(ImageBrowser) {
					ImageBrowser([{
						url: imageURL
					}], {
						currenIndex: 0
					});
				});
			}
		};
	};

	bC.extend(Controller);
	Controller.prototype.init = function() {
		page = 1;
		Helper.globalRender(template('app/templates/resource/weixin/image/list', {}));
		uploadListenser(this.render);
		this.render();
	};

	Controller.prototype.render = function(callback) {
		var controller = this;
		var skip = (page - 1) * limit;
		callback || (callback = this.callback);
		WechatResourceService.image.getList(organizationId, skip, limit).done(function(data) {
			var images = data.result.data;
			var total = data.result.total;
			$(panelBodySelector).html(template("app/templates/resource/weixin/image/images", {
				images: images,
				total: total,
				pagination: Helper.pagination(total, limit, page)
			}));
			Pagination(total, limit, page, {
				theme: 'SIMPLE',
				switchPage: function(pageIndex) {
					page = pageIndex;
					Application.loader.begin();
					controller.render(Application.loader.end);
				}
			});
		}).fail(function(error) {
			Helper.alert(error);
		}).always(function() {
			Helper.execute(callback);
		});
	};


	function uploadListenser(callback) {
		var $input = $("#UploadInput");
		var buttonText = "上传图片";

		var fileCount;
		uploader.image($input, organizationId, '', Application.getSession(), {
			height: 23,
			width: 70,
			buttonText: buttonText,
			onDialogClose: function(queueData) {
				fileCount = queueData.filesSelected;
			},
			onUploadStart: function(file) {
				//设置上传按钮禁用
				$input.uploadify("disable", true);
				$input.uploadify("settings", 'buttonText', '上传中...');
			},
			onUploadProgress: function(file, bytesUploaded, bytesTotal, totalBytesUploaded, totalBytesTotal) {

			},
			onUploadSuccess: function(file, data, response) {
				data = $.parseJSON(data);
				if (data.status != "OK") return Helper.alert(data.message);

				$input.uploadify("settings", 'buttonText', "解析中...");
				WechatResourceService.image.add(organizationId, file.name, data.result).done(function(data) {
					Helper.execute(callback);
				}).fail(function(error) {
					Helper.alert(error);
				}).always(function() {
					$input.uploadify("disable", false);
					$input.uploadify("settings", 'buttonText', buttonText);
				});
			},
			onUploadError: function(file, errorCode, errorMsg, errorString) {
				Helper.alert("图片 " + file.name + " 上传失败：" + errorString);
			},
			onQueueComplete: function(queueData) {
				//设置上传按钮可用
			}
		});
	}


	module.exports = Controller;

});