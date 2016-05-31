define(function(require, exports, module) {
	var globalResponseHandler = require("ajaxHandler");
	/**
	 * 获取组织新申请成员列表
	 */
	exports.getList = function(orgId, skip, limit) {
		return globalResponseHandler({
			url: 'member/apply/list',
			data: {
				organizationId: orgId,
				skip: skip,
				limit: limit
			}
		}, {
			description: "获取申请加入组织人员列表"
		});
	};

	// 获取申请人的信息
	// applyId : 申请Id （不是申请人的信息）
	exports.get = function(orgId, applyId) {
		return globalResponseHandler({
			url: "member/apply/" + applyId + '/get',
			data: {
				organizationId: orgId
			}
		}, {
			description: "获取申请人的信息"
		});
	};

	// 同意成员申请
	exports.agree = function(orgId, applyId) {
		return globalResponseHandler({
			url: 'member/apply/' + applyId + '/agree',
			type: 'post',
			data: {
				organizationId: orgId
			}
		}, {
			description: "同意成员申请"
		});
	};

	/**
	 * 拒绝成员申请
	 */
	exports.refuse = function(orgId, applyId) {
		return globalResponseHandler({
			url: "member/apply/" + applyId + "/refuse",
			type: 'post',
			data: {
				organizationId: orgId
			}
		}, {
			description: "拒绝成员申请"
		});
	};


});