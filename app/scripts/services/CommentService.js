define(function(require, exports, module) {
	var globalResponseHandler = require("ajaxHandler");

	// [评论/回复]列表
	exports.getList = function(subjectType, subjectId, skip, limit) {
		return globalResponseHandler({
			url: 'comment/list',
			data: {
				subjectType: subjectType,
				subjectId: subjectId,
				skip: skip,
				limit: limit
			}
		}, {
			description: '获取[评论/回复]列表'
		});
	};

	// 添加[评论/回复]
	exports.add = function(subjectType, subjectId, data) {
		data.subjectType = subjectType;
		data.subjectId = subjectId;
		return globalResponseHandler({
			url: 'comment/add',
			type: 'post',
			data: data
		}, {
			description: '添加[评论/回复]'
		});
	};

	// 删除[评论/回复]
	exports.remove = function(orgId, commentId) {
		return globalResponseHandler({
			url: 'comment/' + commentId + '/remove',
			type: 'post',
			data: {
				orgId: orgId
			}
		}, {
			description: '删除[评论/回复]'
		});
	};
});