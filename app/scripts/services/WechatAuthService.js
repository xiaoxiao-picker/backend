define(function(require, exports, module) {
	var globalResponseHandler = require("ajaxHandler");

	exports.commentAppId = function() {
		return globalResponseHandler({
			url: "application/component-app-id"
		}, {
			description: "获取AppId"
		});
	};

	exports.preAuthCode = function() {
		return globalResponseHandler({
			url: "application/pre-auth-code"
		}, {
			description: "获取预授权码"
		});
	};

	exports.finishAuth = function(orgId, authCode) {
		return globalResponseHandler({
			url: "wechat/public/finish-auth",
			type: "post",
			data: {
				organizationId: orgId,
				authCode: authCode
			}
		}, {
			description: "微信授权"
		});
	};

	exports.unbind = function(orgId) {
		return globalResponseHandler({
			url: "wechat/public/unbind",
			type: "post",
			data: {
				organizationId: orgId
			}
		}, {
			description: "强制解除微信绑定"
		});
	};

	exports.isAuthorizer = function(publicId) {
		return globalResponseHandler({
			url: "wechat/public/" + publicId + "/is-authorizer"
		}, {
			description: "验证公众号是否是通过微信第三方绑定"
		});
	};
});