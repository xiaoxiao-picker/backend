/**
 * 新申请成员列表
 */
define(function(require, exports, module) {
	var baseController = require('baseController');
	var bC = new baseController();
	var template = require('template');
	var MemberApplyService = require('MemberApplyService');
	var Helper = require("helper");
	var Pagination = require('lib.Pagination');

	var orgId, limit, skip, page;

	var Controller = function() {
		var _controller = this;
		_controller.namespace = "members.applied";
		_controller.actions = {
			agreeMemberApply: function() {
				var _btn = this;
				var applyId = _btn.attr("data-apply-id");
				Helper.begin(_btn);
				MemberApplyService.agree(orgId, applyId).done(function(data) {
					Helper.successToast("操作成功！");
					_controller.render();
				}).fail(function(error) {
					Helper.alert(error);
				}).always(function() {
					Helper.end(_btn);
				});
			},
			refuseMemberApply: function() {
				var _btn = this;
				var applyId = _btn.attr("data-apply-id");
				Helper.begin(_btn);
				MemberApplyService.refuse(orgId, applyId).done(function(data) {
					Helper.successToast("操作成功！");
					_controller.render();
				}).fail(function(error) {
					Helper.alert(error);
				}).always(function() {
					Helper.end(_btn);
				});
			},
			check: function() {
				var applyId = this.attr("data-apply-id");
				var userId = this.attr("data-user-id");

				require.async("scripts/lib/Applicant", function(Applicant) {
					Applicant(applyId, {
						agree: function(btn) {
							var applicant = this;
							Helper.begin(btn);
							MemberApplyService.agree(orgId, applyId).done(function(data) {
								Helper.successToast("操作成功！");
								applicant.destroy();
								_controller.render();
							}).fail(function(error) {
								Helper.alert(error);
							}).always(function() {
								Helper.end(btn);
							});
						},
						reject: function(btn) {
							var applicant = this;
							Helper.begin(btn);
							MemberApplyService.refuse(orgId, applyId).done(function(data) {
								Helper.successToast("操作成功！");
								applicant.destroy();
								_controller.render();
							}).fail(function(error) {
								Helper.alert(error);
							}).always(function() {
								Helper.end(btn);
							});
						}
					});
				});
			}
		};
	};

	bC.extend(Controller);
	Controller.prototype.init = function() {
		orgId = App.organization.info.id;
		page = +Helper.param.search("page") || 1;
		limit = +Helper.param.search("limit") || 30;

		this.render();
	};


	// 渲染函数
	Controller.prototype.render = function() {
		var templateUrl = this.templateUrl;
		var callback = this.callback;

		skip = limit * (page - 1);

		MemberApplyService.getList(orgId, skip, limit).done(function(data) {
			var members = data.result.data;
			var total = data.result.total;
			Helper.globalRender(template(templateUrl, {
				session: App.getSession(),
				orgId: App.organization.info.id,
				members: members,
				count: total
			}));

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
	}

	module.exports = Controller;
});