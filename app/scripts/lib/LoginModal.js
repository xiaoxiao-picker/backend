define(function(require, exports, module) {
	var Helper = require("helper");
	var template = require("template");

	var PublicService = require("PublicService");

	function LoginBox(options) {
		options = $.extend({
			title: "校校登陆",
			zIndex: 10040
		}, options);
		var modal = Helper.modal(options);

		render(modal);
		addListener(modal);

		return modal;
	}

	function render(modal) {
		modal.html(template("app/templates/public/login", {}));
	}

	function addListener(modal) {
		modal.addAction(".btn-login", "click", function() {
			var username = $.trim(modal.box.find("input.username").val());
			var password = $.trim(modal.box.find("input.password").val());
			if (Helper.validation.isEmpty(username)) {
				Helper.errorToast("手机号码不能为空！");
				return;
			}
			if (!Helper.validation.isPhoneNumber(username)) {
				Helper.errorToast("手机号码格式错误！");
				return;
			}
			if (Helper.validation.isEmpty(password)) {
				Helper.errorToast("密码不能为空！");
				return;
			}
			var btn = this;
			Helper.begin(btn);
			PublicService.createSession().done(function(data) {
				var session = data.result;
				PublicService.login(username, password, session).done(function(data) {
					App.setSession(session);
					window.location.reload();
				}).fail(function(error) {
					Helper.alert(error);
				}).always(function() {
					Helper.end(btn);
				});
			}).fail(function(error) {
				Helper.alert(error);
				Helper.end(btn);
			});
		});
	};

	module.exports = LoginBox;
});