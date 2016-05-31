define(function(require, exports, module) {
	var globalResponseHandler = require("ajaxHandler");

	// 获取组织成员列表
	// rank 0-普通用户，1-管理员，100-创建者
	exports.getList = function(orgId, skip, limit, rank) {
		return globalResponseHandler({
			url: 'member/list-user-by-organization',
			data: {
				organizationId: orgId,
				skip: skip,
				limit: limit,
				rank: rank
			}
		}, {
			description: "获取组织成员列表"
		});
	};
	// 获取成员信息
	exports.get = function(memberId) {
		return globalResponseHandler({
			url: 'member/' + memberId + '/get'
		}, {
			description: "获取成员信息"
		});
	};
	// 删除成员
	exports.remove = function(orgId, userId) {
		return globalResponseHandler({
			url: 'member/' + userId + '/remove',
			type: 'post',
			data: {
				organizationId: orgId
			}
		}, {
			description: "删除组织成员"
		});
	};

	// 修改成员信息
	exports.update = function(orgId, memberIds, options) {
		options = $.extend({
			organizationId: orgId,
			ids: memberIds
		}, options);
		return globalResponseHandler({
			url: 'member/update',
			type: 'post',
			data: options
		}, {
			description: "修改组织成员信息"
		});
	};
	// 修改成员备注
	exports.updateRemark = function(orgId, memberId, remark) {
		return globalResponseHandler({
			url: 'member/update-remark',
			type: 'post',
			data: {
				organizationId: orgId,
				remark: remark,
				id: memberId
			}
		}, {
			description: "修改组织成员信息"
		});
	};
	// 修改成员权限
	exports.updateRank = function(orgId, memberIds, rank) {
		return globalResponseHandler({
			url: 'member/update-rank',
			type: 'post',
			data: {
				organizationId: orgId,
				rank: rank,
				ids: memberIds
			}
		}, {
			description: "修改组织成员信息"
		});
	};

	// 获取用户在组织中的角色
	// creator: 100 ,admin: >0,member: 0, applied: -100, nobody: -200	
	exports.getRank = function(orgId, userId) {
		return globalResponseHandler({
			url: "member/get-rank",
			data: {
				organizationId: orgId,
				userId: userId
			}
		}, {
			description: "获取用户角色"
		});
	};

	// 获取组织总人数
	exports.getMemberCount = function(orgId) {
		return globalResponseHandler({
			url: 'org/' + orgId + '/member/count',
			data: {
				organizationId: orgId
			}
		}, {
			description: "获取组织成员总数"
		});
	};
	// 获取申请加入组织的人数
	exports.appliedMemberCount = function(orgId) {
		return globalResponseHandler({
			url: 'member/apply/count',
			data: {
				organizationId: orgId
			}
		}, {
			description: "获取申请加入组织的人数"
		});
	};

	/* ===================== 手动添加成员 ===================== */

	exports.addMember = function(orgId, phoneNumber, remark, rank) {
		return globalResponseHandler({
			url: 'member/add-by-phone-number',
			type: 'post',
			data: {
				organizationId: orgId,
				phoneNumber: phoneNumber,
				remark: remark,
				rank: rank,
			}
		}, {
			description: "添加成员"
		});
	};

	/* ===================== 分组管理 ===================== */

	exports.group = {
		list: function(orgId) {
			return globalResponseHandler({
				url: 'member/group/list',
				data: {
					organizationId: orgId
				}
			}, {
				description: "获取成员分组信息"
			});
		},
		add: function(orgId, name) {
			return globalResponseHandler({
				url: 'member/group/add',
				type: 'post',
				data: {
					organizationId: orgId,
					name: name
				}
			}, {
				description: "添加成员分组"
			});
		},
		update: function(orgId, groupId, name) {
			return globalResponseHandler({
				url: 'member/group/' + groupId + '/update',
				type: 'post',
				data: {
					organizationId: orgId,
					name: name
				}
			}, {
				description: "修改成员分组"
			});
		},
		remove: function(orgId, groupId) {
			return globalResponseHandler({
				url: 'member/group/' + groupId + '/remove',
				type: 'post',
				data: {
					organizationId: orgId
				}
			}, {
				description: "删除成员分组"
			});
		}
	};

	exports.groupMember = {
		getList: function(orgId, groupId) {
			return globalResponseHandler({
				url: 'member/list-member-by-group',
				data: {
					organizationId: orgId,
					groupId: groupId
				}
			}, {
				description: "获取分组成员列表"
			});
		},
		nogroupMembers: function(orgId) {
			return globalResponseHandler({
				url: 'member/list-member-by-no-group',
				data: {
					organizationId: orgId
				}
			}, {
				description: "获取未分组成员列表"
			});
		},
		remove: function(orgId, groupId, memberIds) {
			return globalResponseHandler({
				url: 'member/remove-from-group',
				type: 'post',
				data: {
					organizationId: orgId,
					groupId: groupId,
					memberIds: memberIds
				}
			}, {
				description: "获取分组成员"
			});
		},
		add: function(orgId, groupId, memberIds) {
			return globalResponseHandler({
				url: 'member/add-to-group',
				type: 'post',
				data: {
					organizationId: orgId,
					groupId: groupId,
					memberIds: memberIds
				}
			}, {
				description: "添加成员至分组"
			});
		}
	};

	// 批量设置成员为管理员
	exports.setMembersAsAdmin = function(orgId, userIds) {
		return globalResponseHandler({
			url: 'org/' + orgId + '/member/update_member_to_admin',
			type: 'post',
			data: {
				userIds: userIds
			}
		}, {
			description: "设置组织管理员"
		});
	};



	//获取成员资料
	exports.getMemberInfo = function(orgId, userId) {
		return globalResponseHandler({
			url: 'org/' + orgId + "/member/get",
			data: {
				userId: userId
			}
		});
	};

	//获取用户资料
	exports.getUserInfo = function(userId) {
		return globalResponseHandler({
			url: 'user/' + userId + "/info"
		});
	};

	//设置组织联系人
	exports.updateOrgDirector = function(orgId, userId) {
		return globalResponseHandler({
			url: 'org/' + orgId + "/update",
			type: 'post',
			data: {
				directorId: userId
			}
		});
	};



	/* ===================== 组织对成员评价 ===================== */

	exports.comment = {
		// 获取成员评价列表
		getList: function(orgId, userId) {
			return globalResponseHandler({
				url: 'member/comment/list',
				data: {
					organizationId: orgId,
					userId: userId
				}
			}, {
				description: '获取成员评价列表'
			});
		},
		// 获取成员评价
		get: function(commentId) {
			return globalResponseHandler({
				url: 'member/comment/' + commentId + '/get'
			}, {
				description: '获取成员评价'
			});
		},
		// 添加成员评价
		add: function(orgId, userId, context) {
			return globalResponseHandler({
				url: 'member/comment/add',
				type: "post",
				data: {
					organizationId: orgId,
					userId: userId,
					text: context
				}
			}, {
				description: '添加成员评价'
			});
		},
		// 删除成员评价
		remove: function(commentId) {
			return globalResponseHandler({
				url: 'member/comment/' + commentId + '/remove',
				type: 'post'
			}, {
				description: '删除成员评价'
			});
		}
	};
});