define(function(require, exports, module) {
	var globalResponseHandler = require("ajaxHandler");

	// 获取提案列表
	exports.getList = function(data) {
		return globalResponseHandler({
			url: 'proposal/list',
			data: data
		}, {
			description: '获取提案列表'
		});
	};

	// 获取提案详情
	exports.get = function(proposalId) {
		return globalResponseHandler({
			url: 'proposal/' + proposalId + '/get'
		}, {
			description: '获取提案详情'
		});
	};

	// 删除提案
	exports.remove = function(proposalId) {
		return globalResponseHandler({
			url: 'proposal/' + proposalId + '/remove',
			type: 'post'
		}, {
			description: '删除提案'
		});
	};

	// 改变提案状态
	exports.changeState = function(proposalId, state) {
		return globalResponseHandler({
			url: 'proposal/' + proposalId + '/state/change',
			type: 'post',
			data: {
				state: state
			}
		}, {
			description: '改变提案状态'
		});
	};

	// 添加提案
	exports.add = function(orgId, data) {
		data.orgId = orgId;
		return globalResponseHandler({
			url: 'proposal/add',
			type: 'post',
			data: data
		}, {
			description: '添加提案'
		});
	};

	exports.top = function(proposalId) {
		return globalResponseHandler({
			url: 'proposal/' + proposalId + '/top',
			type: 'post'
		}, {
			description: '提案置顶'
		});
	};
	
	exports.untop = function(proposalId) {
		return globalResponseHandler({
			url: 'proposal/' + proposalId + '/untop',
			type: 'post'
		}, {
			description: '提案取消置顶'
		});
	};

	exports.reply = {
		// 添加提案回复
		add: function(proposalId, text) {
			return globalResponseHandler({
				url: 'proposal/' + proposalId + '/reply/add',
				type: 'post',
				data: {
					text: text
				}
			}, {
				description: '添加提案回复'
			});
		},
		// 更新提案回复
		update: function(proposalId, replyId, text) {
			return globalResponseHandler({
				url: 'proposal/' + proposalId + '/reply/' + replyId + '/update',
				type: 'post',
				data: {
					text: text
				}
			}, {
				description: '更新提案回复'
			});
		},
		// 删除提案回复
		remove: function(proposalId, replyId) {
			return globalResponseHandler({
				url: 'proposal/' + proposalId + '/reply/' + replyId + '/remove',
				type: 'post'
			}, {
				description: '删除提案回复'
			});
		},
		// 获取提案回复
		getList: function(proposalId) {
			return globalResponseHandler({
				url: 'proposal/' + proposalId + '/reply/list'
			}, {
				description: '获取提案回复'
			});
		}
	};

	exports.comment = {
		changeState: function(proposalId, state) {
			return globalResponseHandler({
				url: 'proposal/' + proposalId + '/comment/state/change',
				type: 'post',
				data: {
					state: state
				}
			}, {
				description: '提案评论开关'
			});
		}
	};

	exports.category = {
		add: function(organizationId, name) {
			return globalResponseHandler({
				url: 'proposal/category/add',
				type: 'post',
				data: {
					organizationId: organizationId,
					name: name
				}
			}, {
				description: '创建分类'
			});
		},
		update: function(organizationId, categoryId, name) {
			return globalResponseHandler({
				url: 'proposal/category/' + categoryId + '/update',
				type: 'post',
				data: {
					organizationId: organizationId,
					name: name
				}
			}, {
				description: '更新分类'
			});
		},
		remove: function(organizationId, categoryIds) {
			return globalResponseHandler({
				url: 'proposal/category/remove',
				type: 'post',
				data: {
					organizationId: organizationId,
					categoryIds: categoryIds
				}
			}, {
				description: '删除分类'
			});
		},
		list: function(organizationId) {
			return globalResponseHandler({
				url: 'proposal/category/list',
				data: {
					organizationId: organizationId
				}
			}, {
				description: '获取分类列表'
			});
		}
	};
});