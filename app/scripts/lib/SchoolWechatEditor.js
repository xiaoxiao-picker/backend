define(function(require, exports, module) {
	require("plugins/select2/select2.js");

	var template = require("template");
	var SchoolService = require('SchoolService');
	var Helper = require("helper");

	var OrgInfo;

	function Editor(exhibitionId, orgId, options) {
		options = $.extend({
			title: '组织信息编辑',
			actions: {
				'.BtnSave': {
					event: 'click',
					fnc: save
				},
				'.BtnAvatarUpload': {
					event: 'click',
					fnc: uploadAvatar
				}
			}
		}, options);

		var modal = Helper.modal(options);
		modal.exhibitionId = exhibitionId;
		modal.orgId = orgId;
		init(modal);

		return modal;
	}

	function init(editor) {
		if (!editor.orgId) {
			OrgInfo = {};
			editor.html(template('app/templates/organization/school/wechat', {
				org: OrgInfo
			}));
			$("#CategoryBox").select2();
			return;
		}

		SchoolService.wechat.get(editor.orgId).done(function(data) {
			OrgInfo = data.result;
			editor.html(template('app/templates/organization/school/wechat', {
				org: OrgInfo
			}));
			$("#CategoryBox").select2();
		}).fail(function(error) {
			Helper.alert(error);
		});
	};

	// 保存
	function save(editor) {
		var _btn = $(this);
		OrgInfo.name = $.trim(editor.box.find("[name=name]").val());
		OrgInfo.category = $.trim(editor.box.find("[name=category]").val());

		if (Helper.validation.isEmptyNull(OrgInfo.name)) {
			Helper.errorToast("组织名称不能为空！");
			return;
		}
		if (Helper.validation.isEmptyNull(OrgInfo.category)) {
			Helper.errorToast("组织类型不能为空！");
			return;
		}
		if (Helper.validation.isEmptyNull(OrgInfo.qrUrl)) {
			Helper.errorToast("公众号二维码不能为空！");
			return;
		}
		if (!Helper.validation.isImageUrl(OrgInfo.qrcodeUrl)) {
			Helper.errorToast("公众号二维码不合法！");
			return;
		}

		var data = {
			qrUrl: OrgInfo.qrUrl,
			name: OrgInfo.name,
			category: OrgInfo.category,
		};

		Helper.begin(_btn);
		SchoolService.wechat[editor.orgId ? "update" : "add"](editor.orgId ? editor.orgId : editor.exhibitionId, data).done(function() {
			editor.options.save && $.isFunction(editor.options.save) && editor.options.save.call(editor);
		}).fail(function(error) {
			Helper.alert(error);
		}).always(function() {
			Helper.end(_btn);
		});
	};

	// 上传图片
	function uploadAvatar(editor) {
		require.async("ImageSelector", function(ImageSelector) {
			ImageSelector({
				title: '选择图片',
				cut: function(imageUrl) {
					updateImage(imageUrl);
					this.destroy();
				},
				choose: function(imageUrls) {
					updateImage(imageUrls[0]);
					this.destroy();
				}
			});
		});

		function updateImage(imageUrl) {
			OrgInfo.qrUrl = imageUrl;
			editor.box.find("#logo").attr("src", imageUrl);
		}
	};

	module.exports = Editor;
});