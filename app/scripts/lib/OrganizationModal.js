define(function(require, exports, module) {
	var template = require('template');
	var OrganizationService = require('OrganizationService');
	var Helper = require("helper");

	var OrgModal = function(orgId, options) {
		options = $.extend({
			title: "查看组织信息",
			className: "organization-modal",
			readonly: true
		}, options);
		var modal = Helper.modal(options);

		var getOrgInfo = OrganizationService.get(orgId);
		var getExtendInfo = OrganizationService.getExtendInfo(orgId);

		$.when(getOrgInfo, getExtendInfo).done(function(data1, data2) {
			modal.html(template("app/templates/organization/info-modal", {
				orgInfo: data1.result,
				extendInfo: data2.result,
				readonly: options.readonly,
				isExtend: true
			}));
		}).fail(function(error) {
			Helper.alert(error);
			modal.destroy();
		});

		return modal;
	};

	module.exports = function(orgId, options) {
		new OrgModal(orgId, options);
	};
});