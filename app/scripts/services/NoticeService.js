define(function(require, exports, module) {	
	var globalResponseHandler = require("ajaxHandler");

	// 保存公告
	exports.save = function(orgId, data) {
		data.orgId = orgId;
		return globalResponseHandler({
			url: 'announcement/save',
			type: 'post',
			data: data
		}, {
			description: '保存公告'
		});
	};
	
	// 删除公告
	exports.remove = function(orgId, noticeId) {
		return globalResponseHandler({
			url: 'announcement/' + noticeId + '/remove',
			type: 'post',
			data: {
				orgId: orgId
			}
		}, {
			description: '删除公告'
		});
	};

	// 获取公告详情
	exports.load = function(orgId, noticeId) {
		return globalResponseHandler({
			url: 'announcement/' + noticeId + '/get'
		}, {
			description: '获取公告详情'
		});
	};

	// 获取公告列表
	exports.getList = function(data) {
		return globalResponseHandler({
			url: 'announcement/list',
			data: data
		}, {
			description: '获取公告列表'
		});
	};

	// 发送公告
	exports.send = function(noticeId) {
		return globalResponseHandler({
			url: 'announcement/' + noticeId + '/sent-with-sms',
			type: 'post'
		}, {
			description: '发送公告'
		});
	};

	// 获取剩余短信数
	exports.getSmsRemain = function(orgId) {
		return globalResponseHandler({
			url: 'announcement/sms-remain/get',
			data: {
				orgId: orgId
			}
		}, {
			description: '获取剩余短信数'
		});
	};

	// 获取公告回复列表
	exports.replies = function(noticeId, skip, limit) {
		return globalResponseHandler({
			url: 'announcement/' + noticeId + '/detail/get',
			data: {
				skip: skip,
				limit: limit
			}
		}, {
			description: '获取公告回复列表'
		});
	};

});