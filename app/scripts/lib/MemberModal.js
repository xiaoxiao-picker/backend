define(function(require, exports, module) {
	var template = require('template');
	var MemberService = require('MemberService');
	var Helper = require("helper");

	var MemberModal = function(memberId, options) {
		options = $.extend({
			title: "查看成员信息",
			className: "user-modal",
			readonly: true
		}, options);
		var modal = Helper.modal(options);

		MemberService.get(memberId).done(function(data) {
			var member = data.result;
			modal.member = member;
			modal.html(template("app/templates/member/member-info", {
				isSelf: member.user.id == App.user.info.id,
				readonly: options.readonly,
				member: member
			}));

		}).fail(function(error) {
			Helper.alert(error);
			modal.destroy();
		});

		modal.addAction("button.close", "click", function() {
			modal.destroy();
		});
		return modal;
	};
	module.exports = MemberModal;
});