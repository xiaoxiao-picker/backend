define(function(require, exports, module) {
	var template = require('template');
	var OrganizationService = require('OrganizationService');
	var WechatService = require("WechatService");
	var TaskService = require("TaskService");
	var ExportService = require("ExportService");
	var Helper = require("helper");

	var baseController = require('baseController');
	var bC = new baseController();

	var orgId;

	var Controller = function() {
		var _controller = this;
		_controller.namespace = "organization.info";
		_controller.actions = {
			// 同步数据
			wechatSync: function() {
				var btn = this;
				Helper.begin(btn);
				WechatService.attentionSync(App.organization.wechat.id).done(function(data) {
					var taskId = data.result;
					makeTaskResult(taskId);
				}).fail(function(error) {
					Helper.alert(error);
					Helper.end(btn);
				});

				function makeTaskResult(taskId) {
					setTimeout(function() {
						TaskService.checkTaskState(taskId).done(function(data) {
							var state = data.result;
							if (state == "OK") {
								TaskService.getTaskResult(taskId).done(function(data) {
									Helper.successToast("同步成功！");
									App.organization.extend.wechatFollowerCount = data.result;
									$("#WechAtattentionNumber").html(App.organization.extend.wechatFollowerCount);
								}).fail(function(error) {
									Helper.alert(error);
								}).always(function() {
									Helper.end(btn);
								});
							} else if (state == "RUNNING") {
								makeTaskResult(taskId);
							} else if (state == "CANCEL") {
								Helper.alert("任务意外中断，请稍后重试！");
								Helper.end(btn);
							} else if (state == "ERROR") {
								TaskService.getTaskResult(taskId).done(function(data) {
									Helper.alert(data.result);
								}).fail(function(error) {
									Helper.alert(error);
								}).always(function() {
									Helper.end(btn);
								});
							}
						}).fail(function(error) {
							Helper.alert(error);
							Helper.end(btn);
						});
					}, 2000);
				}
			},
			checkMember: function() {
				var memberId = this.attr("data-member-id");
				if (!memberId) return;
				require.async('lib.MemberModal', function(MemberModal) {
					MemberModal(memberId);
				});
			}
		};
	};

	bC.extend(Controller);
	Controller.prototype.init = function(templateName, callback) {
		orgId = App.organization.info.id;

		$.when(App.organization.reload(), App.organization.getExtend(), App.organization.getWechat(true)).done(function() {
			Helper.globalRender(template(templateName, {
				baseInfo: App.organization.info,
				extendInfo: App.organization.extend,
				wechat: App.organization.wechat || {}
			}));
		}).fail(function(error) {
			Helper.alert(error);
		}).always(function() {
			Helper.execute(callback);
		});
	};

	module.exports = Controller;
});