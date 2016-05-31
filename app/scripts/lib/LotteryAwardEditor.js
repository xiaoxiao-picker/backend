/**
 *	抽奖奖项编辑器
 */
define(function(require, exports, module) {
	var template = require("template");
	var LotteryService = require("LotteryService");
	var PublicService = require("PublicService");
	var Helper = require("helper");

	var AwardInfo;
	var orgId = App.organization.id;

	function Editor(lotteryId, awardId, options) {
		options = $.extend({
			title: '奖品编辑',
			actions: {
				'.btn-save': {
					event: 'click',
					fnc: save
				},
				'.BtnAvatarUpload': {
					event: 'click',
					fnc: uploadAwardImage
				},
				'.BtnIconUpload': {
					event: 'click',
					fnc: uploadAwardIcon
				},
				'input[name=unlimit]': {
					event: 'change',
					fnc: switchLimit
				}
			}
		}, options);

		var modal = Helper.modal(options);
		modal.awardId = awardId;
		modal.lotteryId = lotteryId;
		init(modal);

		return modal;
	}

	function init(editor) {
		// 未中奖信息
		if (editor.options.award) {
			AwardInfo = editor.options.award;
			editor.html(template('app/templates/lottery/award-modal', {
				award: AwardInfo
			}));
			return;
		};

		if (!editor.awardId) {
			AwardInfo = {};
			editor.html(template('app/templates/lottery/award-modal', {
				award: AwardInfo
			}));
			return;
		}

		LotteryService.award.get(editor.lotteryId, editor.awardId).done(function(data) {
			AwardInfo = data.result;
			AwardInfo.probability *= 100;
			AwardInfo.unlimit = AwardInfo.max>=0 ? false : true;
			editor.html(template('app/templates/lottery/award-modal', {
				award: AwardInfo
			}));
		}).fail(function(error) {
			Helper.alert(error);
		});
	};

	// 保存
	function save(editor) {
		var _btn = $(this);
		AwardInfo.name = $.trim(editor.box.find("[name=name]").val());
		AwardInfo.description = $.trim(editor.box.find("[name=description]").val());
		AwardInfo.max = $.trim(editor.box.find("[name=max]").val());
		AwardInfo.probability = $.trim(editor.box.find("[name=probability]").val());
		AwardInfo.lotteryTicketUrl = $.trim(editor.box.find("[name=lotteryTicketUrl]").val());

		if (Helper.validation.isEmptyNull(AwardInfo.name)) {
			Helper.errorToast("奖品名称不能为空！");
			return;
		}
		if (Helper.validation.isEmptyNull(AwardInfo.portraitLotteryUrl)) {
			Helper.errorToast("大转盘显示图片不能为空！");
			return;
		}

		if (!AwardInfo.type) {
			if (Helper.validation.isEmptyNull(AwardInfo.description)) {
				Helper.errorToast("奖品描述不能为空！");
				return;
			}
			if (!AwardInfo.unlimit && !Helper.validation.isInt(AwardInfo.max)) {
				Helper.errorToast("奖品数量格式不合法！");
				return;
			}
			if (!AwardInfo.unlimit && !Helper.validation.isNumber(AwardInfo.probability)) {
				Helper.errorToast("中奖概率格式不合法！");
				return;
			}
			if (Helper.validation.isEmptyNull(AwardInfo.portraitUrl)) {
				Helper.errorToast("奖品图片不能为空！");
				return;
			}
			if (!Helper.validation.isEmptyNull(AwardInfo.lotteryTicketUrl) && !Helper.validation.isUrl(AwardInfo.lotteryTicketUrl)) {
				Helper.errorToast("奖品领取地址格式不合法！");
				return;
			}


			AwardInfo.probability = AwardInfo.unlimit ? null : AwardInfo.probability/100;
			Helper.begin(_btn);
			var action = editor.awardId ? LotteryService.award.update(editor.lotteryId, editor.awardId, AwardInfo) : LotteryService.award.add(editor.lotteryId, AwardInfo);
			action.done(function() {
				editor.options.save && $.isFunction(editor.options.save) && editor.options.save.call(editor);
			}).fail(function(error) {
				Helper.alert(error);
			}).always(function() {
				Helper.end(_btn);
			});
		}else {
			Helper.begin(_btn);
			LotteryService.update(orgId, editor.lotteryId, {
				thankYouText: AwardInfo.name,
				thankYouImageUrl: AwardInfo.portraitLotteryUrl
			}).done(function(data) {
				editor.options.save && $.isFunction(editor.options.save) && editor.options.save.call(editor, AwardInfo);
			}).fail(function(error) {
				Helper.alert(error);
			}).always(function() {
				Helper.end(_btn);
			});
		}
		
	};

	// 上传奖品图片
	function uploadAwardImage(editor) {
		require.async("ImageSelector", function(ImageSelector) {
			ImageSelector({
				title: '选择奖品图片',
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
			AwardInfo.portraitUrl = imageUrl;
			editor.box.find("#AwardImage").attr("src", imageUrl);
		}
	};

	// 上传大转盘显示图片
	function uploadAwardIcon(editor) {
		require.async("ImageSelector", function(ImageSelector) {
			ImageSelector({
				title: '选择大转盘显示图片',
				systemCode: 'ICON_LOTTERY',
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
			AwardInfo.portraitLotteryUrl = imageUrl;
			editor.box.find("#AwardIcon").attr("src", imageUrl);
		}
	};

	function switchLimit(editor) {
		var _input = $(this);
		var checked = _input.prop('checked');
		AwardInfo.unlimit = checked;

		if (checked) {
			editor.box.find("input[name=max]").val('').prop('readonly', true);
			editor.box.find(".probability").val('').addClass('hide');
			editor.box.find(".unlottery-text").removeClass('hide');
		}else {
			editor.box.find("input[name=max]").prop('readonly', false);
			editor.box.find(".unlottery-text").addClass('hide');
			editor.box.find(".probability").removeClass('hide');
		}
	};

	module.exports = Editor;
});