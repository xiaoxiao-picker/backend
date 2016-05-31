/**
 *	投票选手编辑器
 */
define(function(require, exports, module) {
	var template = require("template");
	var VoteService = require("VoteService");
	var PublicService = require("PublicService");
	var Helper = require("helper");

	var OptionInfo;

	function Editor(voteId, optionId, options) {
		options = $.extend({
			title: '投票选项信息编辑',
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
		modal.optionId = optionId;
		modal.voteId = voteId;
		init(modal);

		return modal;
	}

	function init(editor) {
		if (!editor.optionId) {
			OptionInfo = {};
			editor.html(template('app/templates/vote/default/member', {
				option: OptionInfo
			}));
			return;
		}

		VoteService.option.get(editor.optionId).done(function(data) {
			OptionInfo = data.result;
			editor.html(template('app/templates/vote/default/member', {
				option: OptionInfo
			}));
		}).fail(function(error) {
			Helper.alert(error);
		});
	};

	// 保存
	function save(editor) {
		var _btn = $(this);
		OptionInfo.name = $.trim(editor.box.find("[name=name]").val());
		OptionInfo.description = $.trim(editor.box.find("[name=description]").val());
		OptionInfo.videoUrl = $.trim(editor.box.find("[name=videoUrl]").val());

		if (Helper.validation.isEmptyNull(OptionInfo.name)) {
			Helper.errorToast("选项名称不能为空！");
			return;
		}
		if (Helper.validation.isEmptyNull(OptionInfo.description)) {
			Helper.errorToast("选项描述不能为空！");
			return;
		}
		if (Helper.validation.isEmptyNull(OptionInfo.imgUrl)) {
			Helper.errorToast("选项图片不能为空！");
			return;
		}
		if (!Helper.validation.isImageUrl(OptionInfo.imgUrl)) {
			Helper.errorToast("选项图片不合法！");
			return;
		}

		var data = {
			imgUrl: OptionInfo.imgUrl,
			name: OptionInfo.name,
			description: OptionInfo.description,
			videoUrl: OptionInfo.videoUrl
		};

		Helper.begin(_btn);
		VoteService.option[editor.optionId ? "update" : "add"](editor.optionId ? editor.optionId : editor.voteId, data).done(function() {
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
			OptionInfo.imgUrl = imageUrl;
			editor.box.find("#ActiveOptionAvatar").attr("src", imageUrl);
		}
	};

	module.exports = Editor;
});