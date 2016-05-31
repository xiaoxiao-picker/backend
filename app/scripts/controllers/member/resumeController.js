/**
 * 现有成员
 */
define(function(require, exports, module) {
	
	var baseController = require('scripts/baseController');
	var bC = new baseController();
	var template = require('scripts/template');
	var OrganizationService = require('scripts/services/OrganizationService');
	var MemberService = require('scripts/services/MemberService');
	var Helper = require("scripts/public/helper");

	var orgId, tmp, callback;

	var options = ["E", "events", "award"]; // 第二课堂简历、活动历史、奖项

	var Controller = function() {
		var _controller = this;
		_controller.namespace = "member.resume";
		_controller.actions = {};
	};

	bC.extend(Controller);
	Controller.prototype.init = function(templateName, fn) {
		orgId = App.organization.info.id;
		tmp = templateName;
		callback = fn;
		render();
	};

	function render() {
		Helper.globalRender(template(tmp, {
			targets: RequireInfo,
			orgId: orgId,
			session: App.getSession()
		}));
		MemberService.getMemberGroups(orgId).done(function(data) {


		}).fail(function(error) {
			Helper.errorToast(error);
		}).always(function() {
			Helper.execute(callback);
		});
	}



	module.exports = Controller;
});
