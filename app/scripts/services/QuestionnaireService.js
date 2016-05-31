define(function(require, exports, module) {
	var globalResponseHandler = require("ajaxHandler");

	// orgId,skip,limit,keyword
	exports.getList = function(data) {
		return globalResponseHandler({
			url: 'poll/list',
			data: data
		}, {
			description: '获取问卷列表'
		});
	};

	// 获取问卷详情
	exports.get = function(qid) {
		return globalResponseHandler({
			url: "poll/" + qid + "/get"
		}, {
			description: '获取问卷详情'
		});
	};

	// 添加问卷
	exports.add = function(orgId, data) {
		data.organizationId = orgId;
		return globalResponseHandler({
			url: "poll/add",
			type: "post",
			data: data
		}, {
			description: '添加问卷'
		});
	};

	// 更新问卷
	exports.update = function(orgId, qid, data) {
		data.organizationId = orgId;
		return globalResponseHandler({
			url: "poll/" + qid + "/update",
			type: "post",
			data: data
		}, {
			description: '更新问卷'
		});
	};

	// 删除问卷
	exports.remove = function(qid) {
		return globalResponseHandler({
			url: "poll/" + qid + "/remove",
			type: "post"
		}, {
			description: '删除问卷'
		});
	};

	// 开启问卷
	exports.open = function(qid) {
		return globalResponseHandler({
			url: "poll/" + qid + "/open",
			type: "post"
		}, {
			description: '开启问卷'
		});
	};

	// 关闭问卷
	exports.close = function(qid) {
		return globalResponseHandler({
			url: "poll/" + qid + "/close",
			type: "post"
		}, {
			description: '关闭问卷'
		});
	};

	// 获取问卷统计数据
	exports.makeStatisticsTask = function(qid) {
		return globalResponseHandler({
			url: "poll/" + qid + "/statistics"
		}, {
			description: '获取问卷统计数据'
		});
	};


	exports.reply = {
		// 获取问卷回复列表
		getList: function(qid, skip, limit) {
			return globalResponseHandler({
				url: 'poll/' + qid + '/list-sign-up-users',
				data: {
					skip: skip,
					limit: limit
				}
			}, {
				description: '获取问卷回复列表'
			});
		},
		// 获取问卷回复详情
		get: function(qid, userId) {
			return globalResponseHandler({
				// url: 'poll/' + qid + '/result/' + userId + '/get'
				url: 'poll/' + qid + '/user/' + userId + '/result/get'
			}, {
				description: '获取问卷回复详情'
			});
		}
	};
});