define(function(require, exports, module) {
	var globalResponseHandler = require("ajaxHandler");

	exports.createSession = function() {
		return globalResponseHandler({
			url: "session/create"
		}, {
			description: "创建会话"
		});
	};

	exports.authSession = function(session) {
		return globalResponseHandler({
			url: 'session/get-user',
			data: {
				session: session
			}
		}, {
			description: "验证用户身份信息"
		});
	};

	exports.getConfigInfo = function() {
		return globalResponseHandler({
			url: "config/get"
		}, {
			description: "获取系统配置信息"
		});
	};

	exports.login = function(phoneNumber, password) {
		return globalResponseHandler({
			url: "account/mobile-login-with-password",
			type: "post",
			data: {
				phoneNumber: phoneNumber,
				password: password
			}
		}, {
			description: "登陆"
		});
	};

	exports.register = function(phoneNumber, token, password) {
		return globalResponseHandler({
			url: "account/mobile-login",
			type: "post",
			data: {
				phoneNumber: phoneNumber,
				token: token,
				password: password
			}
		}, {
			description: "用户注册"
		});
	};

	exports.requestLoginToken = function(phoneNumber, captcha) {
		return globalResponseHandler({
			url: "account/request-login-token",
			type: "post",
			data: {
				phoneNumber: phoneNumber,
				captcha: captcha
			}
		}, {
			description: "获取验证码"
		});
	};
	exports.requestVoiceLoginToken = function(phoneNumber, captcha) {
		return globalResponseHandler({
			url: "account/request-login-token-voice",
			type: "post",
			data: {
				phoneNumber: phoneNumber,
				captcha: captcha
			}
		}, {
			description: "获取验证码"
		});
	};
	exports.requestResetPasswordToken = function(phoneNumber, captcha) {
		return globalResponseHandler({
			url: "account/request-reset-password",
			type: "post",
			data: {
				phoneNumber: phoneNumber,
				captcha: captcha
			}
		}, {
			description: "获取验证码"
		});
	};
	exports.requestVoiceResetPasswordToken = function(phoneNumber, captcha) {
		return globalResponseHandler({
			url: "account/request-reset-password-voice",
			type: "post",
			data: {
				phoneNumber: phoneNumber,
				captcha: captcha
			}
		}, {
			description: "获取验证码"
		});
	};

	exports.resetPassword = function(phoneNumber, token, password) {
		return globalResponseHandler({
			url: "account/reset-password",
			type: "post",
			data: {
				phoneNumber: phoneNumber,
				token: token,
				newPassword: password
			}
		}, {
			description: "设置密码"
		});
	};

	exports.logout = function(session) {
		return globalResponseHandler({
			url: 'session/logout',
			type: 'post',
			data: {
				session: session
			}
		}, {
			description: "用户登出"
		});
	};

	exports.imageUpload = function(key, x, y, w, h, scale) {
		return globalResponseHandler({
			url: 'attach/IMAGE/cut',
			type: 'post',
			data: {
				key: key,
				x: x,
				y: y,
				w: w,
				h: h,
				scale: scale
			}
		}, {
			description: "上传图片"
		});
	};
	exports.imageUpload2 = function(image) {
		return globalResponseHandler({
			url: 'attach/IMAGE/cut',
			type: 'post',
			data: {
				key: image.key,
				x: image.x1,
				y: image.y1,
				w: image.w,
				h: image.h,
				scale: 1
			}
		}, {
			description: "上传图片"
		});
	};

	// 获取学校列表
	exports.getSchools = function(province) {
		return globalResponseHandler({
			url: 'school/list',
			data: {
				province: province
			}
		}, {
			description: "获取学校列表"
		});
	};

	// 搜索学校
	exports.searchSchool = function(name) {
		return globalResponseHandler({
			url: 'school/list',
			data: {
				name: name
			}
		}, {
			description: "搜索学校"
		});
	};

});