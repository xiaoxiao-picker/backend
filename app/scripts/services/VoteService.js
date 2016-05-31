define(function(require, exports, module) {
	var globalResponseHandler = require("ajaxHandler");

	// organizationId, skip, limit, type, keyword
	exports.getList = function(data) {
		return globalResponseHandler({
			url: 'vote/list-by-organization',
			data: data
		}, {
			description: '获取组织下的投票列表'
		});
	};

	// 获取投票信息
	exports.get = function(voteId) {
		return globalResponseHandler({
			url: 'vote/' + voteId + '/get'
		}, {
			description: '获取投票详情'
		});
	};

	// 添加投票
	exports.add = function(orgId, data) {
		data.organizationId = orgId;
		return globalResponseHandler({
			url: 'vote/add',
			type: 'post',
			data: data
		}, {
			description: '添加投票'
		});
	};

	// 更新投票
	exports.update = function(voteId, data) {
		return globalResponseHandler({
			url: 'vote/' + voteId + '/update',
			type: 'post',
			data: data
		}, {
			description: '更新投票'
		});
	};

	// 删除投票
	exports.remove = function(voteId) {
		return globalResponseHandler({
			url: 'vote/' + voteId + '/remove',
			type: 'post'
		}, {
			description: '删除投票'
		});
	};

	// 开启投票
	exports.open = function(voteId) {
		return globalResponseHandler({
			url: "vote/" + voteId + "/open",
			type: "post"
		}, {
			description: '开启投票'
		});
	};

	// 关闭投票
	exports.close = function(voteId) {
		return globalResponseHandler({
			url: "vote/" + voteId + "/close",
			type: "post"
		}, {
			description: '关闭投票'
		});
	};

	// 投票选项
	exports.option = {
		// 选项列表
		getList: function(voteId, skip, limit, keyword) {
			return globalResponseHandler({
				url: "vote/" + voteId + "/option/list",
				data: {
					skip: skip,
					limit: limit,
					keyword: keyword || ''
				}
			}, {
				description: '获取投票选项列表'
			});
		},
		// 获取选项
		get: function(optionId) {
			return globalResponseHandler({
				url: "vote/option/" + optionId + "/get"
			}, {
				description: '获取投票选项详情'
			});
		},
		// 添加选项
		add: function(voteId, data) {
			return globalResponseHandler({
				url: "vote/" + voteId + "/option/add",
				type: "post",
				data: data
			}, {
				description: '添加投票选项'
			});
		},
		// 更新选项
		update: function(optionId, data) {
			return globalResponseHandler({
				url: "vote/option/" + optionId + "/update",
				type: "post",
				data: data
			}, {
				description: '更新投票选项'
			});
		},
		// 删除选项
		remove: function(optionId) {
			return globalResponseHandler({
				url: "vote/option/" + optionId + "/remove",
				type: "post"
			}, {
				description: '删除投票选项'
			});
		}
	};

	exports.signup = {
		getList: function(voteId, skip, limit, state) {
			return globalResponseHandler({
				url: "vote/" + voteId + "/sign-up/list",
				data: {
					skip: skip,
					limit: limit,
					state: state
				}
			}, {
				description: '获取报名列表'
			});
		},
		updateState: function(signUpId, state, response) {
			return globalResponseHandler({
				url: "vote/sign-up/" + signUpId + "/update-state",
				type: 'post',
				data: {
					state: state,
					response: response
				}
			}, {
				description: '更新报名状态'
			});
		},
		count: function(voteId, state) {
			return globalResponseHandler({
				url: "vote/" + voteId + "/sign-up/count",
				data: {
					state: state
				}
			}, {
				description: '获取报名总数'
			});
		},
		update: function(signUpId, name, description) {
			return globalResponseHandler({
				url: "vote/sign-up/" + signUpId + "/update",
				type: 'post',
				data: {
					name: name,
					description: description
				}
			}, {
				description: '更新报名信息'
			});
		},
		get: function(signUpId) {
			return globalResponseHandler({
				url: "vote/sign-up/" + signUpId + "/get"
			}, {
				description: '获取报名信息'
			});
		},
	};
});