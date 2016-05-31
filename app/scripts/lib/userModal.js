define(function(require, exports, module) {
	var template = require('template');
	var UserService = require('UserService');
	var Helper = require("helper");

	var UserModal = function(userId, options) {
		options = $.extend({
			title: "查看用户信息",
			className: "user-modal"
		}, options);
		var modal = Helper.modal(options);

		UserService.get(userId).done(function(data) {
			var user = data.result;
			modal.user = user;
			modal.html(template("app/templates/member/user-info", {
				user: user
			}));


		}).fail(function(error) {
			Helper.alert(error);
			modal.destroy();
		});
		return modal;
	};
	module.exports = UserModal;
});