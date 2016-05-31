define(function(require, exports, module) {
	var globalResponseHandler = require("ajaxHandler");
	
	exports.get = function(userId) {
		return globalResponseHandler({
			url: 'user/' + userId + '/get'
		}, {
			description: "获取用户信息"
		});
	};
	exports.getExtendInfo = function(userId) {
		return globalResponseHandler({
			url: 'user/' + userId + '/info'
		});
	};
	exports.update = function(userId, data) {
		return globalResponseHandler({
			url: 'user/' + userId + '/update',
			type: 'post',
			data: data
		});
	};



	/**
	 *	获取用户配置信息
	 */
	exports.getConfigInfo = function(userId) {
		return globalResponseHandler({
			url: 'user/' + userId + '/config/get'
		});
	};

	/**
	 *	更新用户配置信息
	 */
	exports.updateUserConfig = function(userId, data) {
		return globalResponseHandler({
			url: 'user/' + userId + '/config/update',
			type: 'post',
			data: data
		});
	};
});