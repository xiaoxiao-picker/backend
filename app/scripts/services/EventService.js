define(function(require, exports, module) {
	var globalResponseHandler = require("ajaxHandler");

	/* ===================== 活动 ===================== */

	// 活动列表
	exports.list = function(orgId, state, skip, limit, categoryId, keyword) {
		return globalResponseHandler({
			url: 'event/list',
			data: {
				organizationId: orgId,
				state: state,
				skip: skip,
				limit: limit,
				categoryId: categoryId || "",
				keyword: keyword || ""
			}
		}, {
			description: '获取活动列表'
		});
	};

	// 活动详情
	exports.load = function(orgId, eventId) {
		return globalResponseHandler({
			url: 'event/' + eventId + '/get'
		}, {
			description: '获取活动详情'
		});
	};

	// 创建活动
	exports.add = function(orgId, eventId, data) {
		data.organizationId = orgId;
		return globalResponseHandler({
			url: 'event/add',
			type: 'post',
			data: data
		}, {
			description: '创建活动'
		});
	};

	// 更新活动
	exports.update = function(orgId, eventId, data) {
		data.organizationId = orgId;
		return globalResponseHandler({
			url: 'event/' + eventId + '/update',
			type: 'post',
			data: data
		}, {
			description: '更新活动'
		});
	};

	// 删除活动
	exports.remove = function(orgId, eventId) {
		return globalResponseHandler({
			url: 'event/' + eventId + '/remove',
			type: 'post'
		}, {
			description: '删除活动'
		});
	};

	// 设置活动状态
	exports.changeState = function(eventId, state) {
		return globalResponseHandler({
			url: 'event/' + eventId + '/state/update',
			type: 'post',
			data: {
				state: state
			}
		}, {
			description: '设置活动状态'
		});
	};

	/* ===================== 活动报名 ===================== */

	exports.signup = {
		time: {
			// 报名时间段列表
			list: function(eventId) {
				return globalResponseHandler({
					url: 'event/' + eventId + '/sign-up-time/list'
				}, {
					description: '获取活动报名时间段列表'
				});
			},
			// 添加报名时间段
			add: function(eventId, data) {
				return globalResponseHandler({
					url: 'event/' + eventId + '/sign-up-time/add',
					type: 'post',
					data: data
				}, {
					description: '添加活动报名时间段'
				});
			},
			// 更新报名时间段
			update: function(eventId, data) {
				return globalResponseHandler({
					url: 'event/' + eventId + '/sign-up-time/' + data.id + '/update',
					type: 'post',
					data: data
				}, {
					description: '更新活动报名时间段'
				});
			},
			// 删除报名时间段
			remove: function(eventId, signUpId) {
				return globalResponseHandler({
					url: 'event/' + eventId + '/sign-up-time/' + signUpId + '/remove',
					type: 'post'
				}, {
					description: '删除活动报名时间段'
				});
			}
		},
		// 报名人员列表
		users: function(eventId, skip, limit) {
			return globalResponseHandler({
				url: 'event/' + eventId + '/sign-up-users/list',
				data: {
					skip: skip,
					limit: limit
				}
			}, {
				description: '获取活动报名人员列表'
			});
		}
	};

	/* ===================== 活动分类 ===================== */

	exports.category = {
		// 添加分类
		add: function(orgId, name) {
			return globalResponseHandler({
				url: 'event/category/add',
				type: 'post',
				data: {
					organizationId: orgId,
					name: name
				}
			}, {
				description: '添加活动分类'
			});
		},
		// 更新分类
		update: function(orgId, categoryId, name) {
			return globalResponseHandler({
				url: 'event/category/' + categoryId + '/update',
				type: 'post',
				data: {
					organizationId: orgId,
					name: name
				}
			}, {
				description: '更新活动分类'
			});
		},
		// 删除分类
		remove: function(orgId, categoryId) {
			return globalResponseHandler({
				url: 'event/category/' + categoryId + '/remove',
				type: 'post'
			}, {
				description: '删除活动分类'
			});
		},
		// 分类列表
		list: function(orgId, skip, limit) {
			return globalResponseHandler({
				url: 'event/category/list',
				data: {
					organizationId: orgId,
					skip: skip,
					limit: limit
				}
			}, {
				description: '获取活动分类列表'
			});
		}
	};

	/* ===================== 活动奖项 ===================== */

	exports.award = {
		// 奖项列表
		list: function(eventId, skip, limit) {
			return globalResponseHandler({
				url: 'event/' + eventId + '/award/list',
				data: {
					skip: skip,
					limit: limit
				}
			}, {
				description: '获取活动奖项列表'
			});
		},
		// 奖项详情
		get: function(eventId, sourceId) {
			return globalResponseHandler({
				url: 'event/' + eventId + '/award/' + sourceId + '/get'
			}, {
				description: '获取活动奖项详情'
			});
		},
		// 添加奖项
		add: function(eventId, data) {
			return globalResponseHandler({
				type: 'post',
				url: 'event/' + eventId + '/award/add',
				data: data
			}, {
				description: '添加活动奖项'
			});
		},
		// 更新奖项
		update: function(eventId, sourceId, data) {
			return globalResponseHandler({
				type: 'post',
				url: 'event/' + eventId + '/award/' + sourceId + '/update',
				data: data
			}, {
				description: '更新活动奖项'
			});
		},
		// 删除奖项
		remove: function(eventId, sourceId) {
			return globalResponseHandler({
				type: 'post',
				url: 'event/' + eventId + '/award/' + sourceId + '/delete'
			}, {
				description: '删除活动奖项'
			});
		},
		// 颁发奖项
		batch: function(eventId, sourceId, userIds) {
			return globalResponseHandler({
				type: 'post',
				url: 'event/' + eventId + '/award/' + sourceId + '/award_batch',
				data: {
					userIds: userIds
				}
			}, {
				description: '颁发活动奖项'
			});
		},
		// 撤销奖项
		revoke: function(eventId, sourceId, userId) {
			return globalResponseHandler({
				type: 'post',
				url: 'event/' + eventId + '/award/' + sourceId + '/remove_award',
				data: {
					userId: userId
				}
			}, {
				description: '撤销活动奖项'
			});
		},
		// 已颁发用户列表
		users: function(eventId, sourceId, skip, limit) {
			return globalResponseHandler({
				url: 'event/' + eventId + '/award/' + sourceId + '/users',
				data: {
					skip: skip,
					limit: limit
				}
			}, {
				description: '已颁发用户列表'
			});
		}
	};
});