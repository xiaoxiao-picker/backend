define(function(require, exports, module) {
	var Helper = require("helper");
	var WechatAuthService = require("WechatAuthService");

	var factoryApplication = require("factory.application");

	var redirectURI = Helper.config.pages.origin + "/home.html#wechat/info";
	var organizationId = Helper.param.search("organizationId");
	var auth_code = Helper.param.search("auth_code");
	var expires_in = Helper.param.search("expires_in");



	if (!auth_code) {
		Helper.alert("微信授权失败，请重新操作！", function() {
			window.location.href = redirectURI
		});
		return;
	}

	window.App = factoryApplication;

	window.App.authSession(function() {
		WechatAuthService.finishAuth(organizationId, auth_code).done(function(data) {
			var taskId = data.result;
			window.location.href = redirectURI + "&taskId=" + taskId;
		}).fail(function(message) {
			Helper.alert(message, function() {
				window.location.href = redirectURI
			});
		});
	});


	// var btn = this;
	// if (!App.organization.wechat.name || !App.organization.wechat.headImgUrl) {
	// 	return Helper.alert("当前绑定公众号名称或头像为空，不能同步！");
	// }
	// Helper.confirm("该操作将同步当前绑定公众号的名称和头像至该组织。" {
	// 	yesText: "同步",
	// 	noText: "取消"
	// }, function() {
	// 	OrganizationService.update
	// });
});