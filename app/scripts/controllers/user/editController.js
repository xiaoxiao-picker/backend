define(function(require, exports, module) {
	require("datetimepicker");

	var baseController = require('baseController');
	var bC = new baseController();
	var template = require('template');
	var UserService = require('UserService');
	var PublicService = require("PublicService");
	var Helper = require("helper");

	var UserInfo, userId;

	var Controller = function() {
		var _controller = this;
		_controller.namespace = "user.edit";
		_controller.actions = {
			update: function() {
				var _btn = this;
				var form = _btn.parents("form");
				var data = Helper.getFormData(form);
				if (!data) return;

				data.portraitUrl = UserInfo.portraitUrl;
				data.grade = new Date(data.grade).getTime();

				Helper.begin(_btn);
				UserService.update(userId, data).done(function(_data) {
					$(".user-name-" + userId).text(data.nickname);
					$(".user-avatar-" + userId).attr("src", UserInfo.portraitUrl);
					Helper.successToast("保存成功");
					Helper.go("index");
				}).fail(function(error) {
					Helper.alert(error);
				}).always(function() {
					Helper.end(_btn);
				});
			},
			// 图片库选择器
			openImageSelector: function() {
				require.async("ImageSelector", function(ImageSelector) {
					ImageSelector({
						title: '选择用户头像',
						crop: {
							preview: true,
							borderRadius: true,
							aspectRatio: 1,
							previewWidth: 100,
							previewHeight: 100
						},
						cut: function(imageUrl) {
							updatePic(this, imageUrl);
						},
						choose: function(imageUrls) {
							updatePic(this, imageUrls[0]);
						}
					});
				});
			},
			// 图片截取插件
			openImageCrop: function() {
				require.async("ImageCrop", function(ImageCrop) {
					ImageCrop(UserInfo.portraitUrl, {
						title: "剪切用户头像",
						preview: true,
						jcrop: {
							borderRadius: true,
							aspectRatio: 1,
							previewWidth: 100,
							previewHeight: 100
						},
						cut: function(imageUrl) {
							updatePic(this, imageUrl);
						}
					});
				});
			},
			// 显示选学校模态框
			showSchools: function() {
				var $input = this;
				require.async('SchoolSelector', function(SchoolSelector) {
					SchoolSelector({
						select: function(school) {
							var selector = this;
							$input.val(school.name);
							$input.attr("data-value", school.id);
							selector.destroy();
						}
					});
				});
			}
		}
	};

	bC.extend(Controller);

	Controller.prototype.init = function(templateUrl, callback) {
		this.templateUrl = templateUrl;
		this.callback = callback;

		userId = App.user.info.id;

		App.user.reload().done(function() {
			UserInfo = $.extend({}, App.user.info);
			Helper.globalRender(template(templateUrl, UserInfo));
			initDatetimepicker();
		}).fail(function(error) {
			Helper.alert(error);
		}).always(function() {
			callback();
		});
	};

	// 初始化时间选择器控件
	function initDatetimepicker() {
		$('.datetimepicker').datetimepicker({
			format: 'yyyy/mm/dd',
			autoclose: true,
			language: 'zh-CN',
			pickerPosition: 'bottom-right',
			minView: 2,
			// startDate: '2010/1/1'
		}).on("changeDate", function(evt) {
			var _input = $(this);
			var date = evt.date.valueOf();
		});
	};

	function updatePic(selector, url) {
		if (!UserInfo.portraitUrl) {
			$(".xx-inner-content .btn-cut").removeClass('hide');
		}
		UserInfo.portraitUrl = url;
		$("#UserAvatar").attr("src", url);
		selector.destroy();
	}

	module.exports = Controller;
});