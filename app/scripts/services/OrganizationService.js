define(function(require, exports, module) {
	var globalResponseHandler = require("ajaxHandler");

	// 获取当前用户所管理的所有组织
	exports.getOwnedOrganizations = function(userId) {
		return globalResponseHandler({
			url: 'member/list-organization-by-user',
			data: {
				userId: userId,
				rank: 0
			}
		}, {
			description: "获取用户所管理的组织列表"
		});
	};

	// 获取组织基础信息
	exports.get = function(orgId) {
		return globalResponseHandler({
			url: 'org/' + orgId + '/get'
		}, {
			description: "获取组织基础信息"
		});
	};

	// 获取组织扩展信息
	exports.getExtendInfo = function(orgId) {
		return globalResponseHandler({
			url: 'org/' + orgId + '/extend/get'
		}, {
			description: "获取组织扩展信息"
		});
	};

	// 创建组织
	exports.add = function() {
		return globalResponseHandler({
			url: 'org/add',
			type: 'post',
			data: {
				name: '',
				description: ''
			}
		}, {
			description: "创建组织"
		});
	};

	// 更新组织
	exports.update = function(orgId, data) {
		return globalResponseHandler({
			url: 'org/' + orgId + '/update',
			type: 'post',
			data: data
		}, {
			description: "修改组织信息"
		});
	};

	// 删除组织
	exports.remove = function(orgId) {
		return globalResponseHandler({
			url: 'org/' + orgId + '/remove',
			type: 'post'
		}, {
			description: "删除组织"
		});
	};

	// 搜索组织
	exports.search = function(skip, limit, data) {
		data.skip = skip;
		data.limit = limit;
		return globalResponseHandler({
			url: 'org/list',
			data: data
		}, {
			description: "搜索组织"
		});
	};

	// 组织配置信息
	exports.config = {
		get: function(orgId) {
			return globalResponseHandler({
				url: 'org/' + orgId + '/config/get'
			}, {
				description: "获取组织配置信息"
			});
		},
		update: function(orgId, data) {
			return globalResponseHandler({
				url: 'org/' + orgId + '/config/update',
				type: 'post',
				data: data
			}, {
				description: "修改组织配置信息"
			});
		}
	};

	/**
	 * 设置微信号
	 */
	exports.setupWechatId = function(orgId) {
		return globalResponseHandler({
			url: 'org/' + orgId + '/wechat/add',
			type: 'post',
			data: {
				orgId: orgId
			}
		}, {
			description: ""
		});
	};

	/**
	 * 获取组织微信号
	 */
	exports.wechat = function(orgId) {
		return globalResponseHandler({
			url: 'wechat/public/get-by-organization',
			data: {
				organizationId: orgId
			}
		}, {
			description: "获取组织微信号"
		});
	};

	/* ===================== 组织加入条件 ===================== */

	exports.condition = {
		// 获取条件
		get: function(orgId) {
			return globalResponseHandler({
				url: 'org/' + orgId + '/register/get'
			}, {
				description: "获取申请加入组织条件"
			});
		},
		// 添加条件
		add: function(orgId, registerJson) {
			return globalResponseHandler({
				url: 'org/' + orgId + '/register/add',
				type: "post",
				data: {
					registerJson: registerJson
				}
			}, {
				description: "添加申请加入组织条件"
			});
		},
		// 更新条件
		update: function(orgId, registerJson) {
			return globalResponseHandler({
				url: 'org/' + orgId + '/register/update',
				type: "post",
				data: {
					registerJson: registerJson
				}
			}, {
				description: "修改申请加入组织条件"
			});
		}
	};

	/* ===================== 组织分类 ===================== */

	exports.category = {
		// 组织分类列表
		getList: function(orgId) {
			return globalResponseHandler({
				url: 'org/' + orgId + '/class/list'
			}, {
				description: '获取组织分类列表'
			});
		},
		// 添加组织分类
		add: function(orgId, name) {
			return globalResponseHandler({
				url: 'org/' + orgId + '/class/add',
				type: 'post',
				data: {
					name: name
				}
			}, {
				description: '添加组织分类'
			});
		},
		// 更新组织分类
		update: function(orgId, categoryId, name) {
			return globalResponseHandler({
				url: 'org/' + orgId + '/class/' + categoryId + '/update',
				type: 'post',
				data: {
					name: name
				}
			}, {
				description: '更新组织分类'
			});
		},
		// 删除组织分类
		remove: function(orgId, categoryId) {
			return globalResponseHandler({
				url: 'org/' + orgId + '/class/' + categoryId + '/remove',
				type: 'post'
			}, {
				description: '删除组织分类'
			});
		}
	};


	/* ===================== 组织风采 ===================== */

	exports.exhibition = {
		// 获取组织风采列表
		getList: function(orgId, skip, limit, categoryId, keyword) {
			var data = {
				skip: skip,
				limit: limit,
				keyword: keyword || "",
				orgClassId: categoryId
			};
			return globalResponseHandler({
				url: 'org/' + orgId + '/exhibition/list',
				data: data
			}, {
				description: '获取组织风采列表'
			});
		},
		// 获取[手动添加组织]详情
		get: function(orgId, exhibitionId) {
			return globalResponseHandler({
				url: 'org/' + orgId + '/exhibition/' + exhibitionId + '/get'
			}, {
				description: '获取[手动添加组织]风采详情'
			});
		},
		// 添加组织
		add: function(orgId, data) {
			return globalResponseHandler({
				url: 'org/' + orgId + '/exhibition/add',
				type: 'post',
				data: data
			}, {
				description: '添加组织风采'
			});
		},
		// 更新[手动添加组织]
		update: function(orgId, data) {
			return globalResponseHandler({
				url: 'org/' + orgId + '/exhibition/' + data.exhibitionId + '/update',
				type: 'post',
				data: data
			}, {
				description: '更新[手动添加组织]风采'
			});
		},
		// 删除组织
		remove: function(orgId, exhibitionId) {
			return globalResponseHandler({
				url: 'org/' + orgId + '/exhibition/' + exhibitionId + '/remove',
				type: 'post'
			}, {
				description: '删除组织风采'
			});
		},
		updateCategory: function(orgId, classId, ids) {
			return globalResponseHandler({
				url: "org/" + orgId + "/exhibition/org-class/" + classId + "/update",
				type: "post",
				data: {
					ids: ids
				}
			}, {
				description: "修改组织风采分类"
			});
		}
	};

	/* ===================== 关联组织 ===================== */

	exports.relation = {
		// 获取关联组织列表
		getList: function(orgId, keyword) {
			return globalResponseHandler({
				url: 'org/' + orgId + '/relate/list',
				data: {
					keyword: keyword || ''
				}
			}, {
				description: '获取关联组织列表'
			});
		},
		// 添加关联组织
		add: function(orgId, relateOrgId) {
			return globalResponseHandler({
				url: 'org/' + orgId + '/relate/add',
				type: 'post',
				data: {
					relateOrgId: relateOrgId
				}
			}, {
				description: '添加关联组织'
			});
		},
		// 删除关联组织
		remove: function(orgId, relateOrgId) {
			return globalResponseHandler({
				url: 'org/' + orgId + '/relate/remove',
				type: 'post',
				data: {
					relateOrgId: relateOrgId
				}
			}, {
				description: '删除关联组织'
			});
		}
	};
});