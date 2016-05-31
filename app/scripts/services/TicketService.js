define(function(require, exports, module) {
	var globalResponseHandler = require("ajaxHandler");

	// organizationId, skip, limit, state, keyword
	exports.getList = function(data) {
		return globalResponseHandler({
			url: 'ticket-source/list',
			data: data
		}, {
			description: '获取电子票列表'
		});
	};

	// 获取电子票
	exports.get = function(sourceId) {
		return globalResponseHandler({
			url: 'ticket-source/' + sourceId + '/get'
		}, {
			description: '获取电子票详情'
		});
	};

	// 添加电子票
	exports.add = function(orgId, data) {
		data.organizationId = orgId;
		return globalResponseHandler({
			url: 'ticket-source/add',
			type: 'post',
			data: data
		}, {
			description: '添加电子票'
		});
	};

	// 更新电子票
	exports.update = function(orgId, data) {
		data.organizationId = orgId;
		return globalResponseHandler({
			url: 'ticket-source/' + data.sourceId + '/update',
			type: 'post',
			data: data
		}, {
			description: '更新电子票'
		});
	};

	// 删除电子票
	exports.remove = function(sourceId) {
		return globalResponseHandler({
			url: 'ticket-source/' + sourceId + '/remove',
			type: 'post'
		}, {
			description: '删除电子票'
		});
	};

	// 开启电子票
	exports.open = function(sourceId) {
		return globalResponseHandler({
			url: "ticket-source/" + sourceId + "/state/update",
			type: "post",
			data: {
				state: "OPENED"
			}
		}, {
			description: '开启电子票'
		});
	};

	// 关闭电子票
	exports.close = function(sourceId) {
		return globalResponseHandler({
			url: "ticket-source/" + sourceId + "/state/update",
			type: "post",
			data: {
				state: "CLOSED"
			}
		}, {
			description: '关闭电子票'
		});
	};

	// 抢票人员列表
	exports.users = function(sourceId, keyword, skip, limit) {
		return globalResponseHandler({
			url: 'ticket-source/' + sourceId + '/list_user',
			data: {
				keyword: keyword,
				skip: skip,
				limit: limit
			}
		}, {
			description: '获取抢票人员列表'
		});
	};

	// 电子票时间段
	exports.time = {
		getList: function(sourceId) {
			return globalResponseHandler({
				url: 'ticket-source/' + sourceId + '/open-time/list'
			}, {
				description: '获取电子票时间段列表'
			});
		},
		add: function(sourceId, data) {
			data.ticketSourceId = sourceId;
			return globalResponseHandler({
				url: 'ticket-source/' + sourceId + '/open-time/add',
				type: 'post',
				data: data
			}, {
				description: '添加电子票时间段'
			});
		},
		update: function(sourceId, data) {
			data.ticketSourceId = sourceId;
			return globalResponseHandler({
				url: 'ticket-source/' + sourceId + '/open-time/' + data.id + '/update',
				type: 'post',
				data: data
			}, {
				description: '更新电子票时间段'
			});
		},
		remove: function(sourceId, timeId) {
			return globalResponseHandler({
				url: 'ticket-source/' + sourceId + '/open-time/' + timeId + '/remove',
				type: 'post'
			}, {
				description: '删除电子票时间段'
			});
		}
	};
});