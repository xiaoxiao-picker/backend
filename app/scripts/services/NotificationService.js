define(function(require, exports, module) {
	var globalResponseHandler = require("ajaxHandler");
	
	// 获取通知列表
	exports.getList = function(orgId, skip, limit) {
		return globalResponseHandler({
			url: 'org/' + orgId + '/message/list',
			data: {
				skip: skip,
				limit: limit
			}
		});
	};

	//获取 通知详情
	exports.get = function(orgId, messageId) {
		return globalResponseHandler({
			url: 'org/' + orgId + '/message/' + messageId + '/get'
		});
	};

	//标记通知
	exports.mark = function(orgId, messageIds) {
		return globalResponseHandler({
			url: 'org/' + orgId + '/message/mark',
			type: 'post',
			data: {
				ids: messageIds
			}
		});
	};

	//取消标记通知
	exports.unMark = function(orgId, messageIds) {
		return globalResponseHandler({
			url: 'org/' + orgId + '/message/unmark',
			type: 'post',
			data: {
				ids: messageIds
			}
		});
	};

	//标记已读
	exports.read = function(orgId, messageIds) {
		return globalResponseHandler({
			url: 'org/' + orgId + '/message/read',
			type: 'post',
			data: {
				ids: messageIds
			}
		});
	};

	//全部标记已读
	exports.allRead = function(orgId) {
		return globalResponseHandler({
			url: 'org/' + orgId + '/message/read-all',
			type: 'post'
		});
	};

	//删除
	exports.remove = function(orgId, messageIds) {
		return globalResponseHandler({
			url: 'org/' + orgId + '/message/remove',
			type: 'post',
			data: {
				ids: messageIds
			}
		});
	};

	//清空
	exports.clear = function(orgId) {
		return globalResponseHandler({
			url: 'org/' + orgId + '/message/remove-all',
			type: 'post'
		});
	};

	//获取未读数
	exports.unreadCount = function(orgId) {
		return globalResponseHandler({
			url: 'org/' + orgId + '/message/count'
		});
	};
	
});