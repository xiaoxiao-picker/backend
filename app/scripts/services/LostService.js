define(function(require, exports, module) {
	var globalResponseHandler = require("ajaxHandler");

	// 获取[失物招领/寻物启事]列表
	exports.getList = function(data) {
		return globalResponseHandler({
			url: 'lost/list',
			data: data
		}, {
			description: '获取[失物招领/寻物启事]列表'
		});
	};

	// 添加[失物招领/寻物启事]
	exports.add = function(orgId, data) {
		data.organizationId = orgId;
		return globalResponseHandler({
			url: 'lost/add',
			type: 'post',
			data: data
		}, {
			description: '添加[失物招领/寻物启事]'
		});
	};

	// 更新[失物招领/寻物启事]
	exports.update = function(orgId, lostId, data) {
		data.organizationId = orgId;
		return globalResponseHandler({
			url: 'lost/' + lostId + '/update',
			type: 'post',
			data: data
		}, {
			description: '更新[失物招领/寻物启事]'
		});
	};

	// 删除[失物招领/寻物启事]
	exports.remove = function(lostId) {
		return globalResponseHandler({
			url: 'lost/' + lostId + '/remove',
			type: 'post'
		}, {
			description: '删除[失物招领/寻物启事]'
		});
	};

	// 获取[失物招领/寻物启事]详情
	exports.get = function(orgId, lostId) {
		return globalResponseHandler({
			url: 'lost/' + lostId + '/get'
		}, {
			description: '获取[失物招领/寻物启事]详情'
		});
	};

	// 确认[失物招领/寻物启事][找到/归还]操作
	exports.changeStatus = function(lostId, status) {
		return globalResponseHandler({
			url: 'lost/' + lostId + '/change-status',
			type: 'post',
			data: {
				status: status
			}
		}, {
			description: '确认[失物招领/寻物启事][找到/归还]操作'
		});
	};

	exports.stick = {
		// 置顶[失物招领/寻物启事]操作
		add: function(lostId) {
			return globalResponseHandler({
				url: 'lost/' + lostId + '/top',
				type: 'post'
			}, {
				description: '置顶[失物招领/寻物启事]操作'
			});
		},
		// 取消置顶[失物招领/寻物启事]操作
		remove: function(lostId) {
			return globalResponseHandler({
				url: 'lost/' + lostId + '/untop',
				type: 'post'
			}, {
				description: '取消置顶[失物招领/寻物启事]操作'
			});
		}
	};

});