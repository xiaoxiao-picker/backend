define(function(require, exports, module) {
	var baseController = require('baseController');
	var template = require('template');
	var bC = new baseController();
	var NoticeService = require('NoticeService');
	var MemberService = require('MemberService');
	var Helper = require("helper");

	var orgId, noticeId;

	var SmsCount, NoticeInfo, Targets;

	var Controller = function() {
		var controller = this;
		controller.namespace = "notice.info";
		controller.actions = {};
	};


	bC.extend(Controller);
	Controller.prototype.init = function(templateUrl, callback) {
		this.callback = callback;
		this.templateUrl = templateUrl;
		orgId = App.organization.info.id;
		noticeId = Helper.param.hash("noticeId");
		Targets = [];
		this.render();
	};


	Controller.prototype.render = function() {
		var callback = this.callback;
		var templateUrl = this.templateUrl;
		// 获取剩余短信数
		var getSmsRemain = NoticeService.getSmsRemain(orgId).done(function(data) {
			SmsCount = data.result;
		});

		// 获取公告详情
		var getNoticeInfo = NoticeService.load(orgId, noticeId).done(function(data) {
			NoticeInfo = data.result.announcement;
			$(data.result.announceTargets).each(function(idx, target) {
				Targets.push(target.member)
			});
		});

		$.when(getSmsRemain, getNoticeInfo).done(function() {
			Helper.globalRender(template(templateUrl, {
				smsCount: SmsCount,
				notice: NoticeInfo,
				members: Targets
			}));
		}).fail(function(error) {
			Helper.alert(error);
		}).always(function() {
			Helper.execute(callback);
		});
	};

	module.exports = Controller;
});