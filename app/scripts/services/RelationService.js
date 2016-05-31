define(function(require, exports, module) {
	var globalResponseHandler = require("ajaxHandler");

	exports.bind = function(sourceType, sourceId, targetType, targetId) {
		return globalResponseHandler({
			url: sourceType + '/' + sourceId + '/relation/' + targetType + '/' + targetId + '/bind',
			type: 'post'
		}, {
			description: '设置绑定'
		});
	};

	exports.unbind = function(sourceType, sourceId, targetType, targetId) {
		return globalResponseHandler({
			url: sourceType + '/' + sourceId + '/relation/' + targetType + '/' + targetId + '/unbind',
			type: 'post'
		}, {
			description: '解除绑定'
		});
	};

	exports.getList = function(sourceType, sourceId, targetType) {
		return globalResponseHandler({
			url: sourceType + '/' + sourceId + '/relation/' + targetType + '/list'
		}, {
			description: '获取绑定内容'
		});
	};
});