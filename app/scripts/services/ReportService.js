define(function(require, exports, module) {
	var globalResponseHandler = require("ajaxHandler");

	// 获取举报列表
	exports.getList = function(subject, subjectId) {
		return globalResponseHandler({
			url: "report/list",
			data: {
				subject: subject,
				subjectId: subjectId
			}
		}, {
			description: '获取举报列表'
		});
	};

	// 删除举报
	exports.remove = function(subject, subjectId) {
		return globalResponseHandler({
			url: "report/remove-all",
			type: 'post',
			data: {
				subject: subject,
				subjectId: subjectId
			}
		}, {
			description: '删除举报'
		});
	};

	// 添加举报
	exports.add = function(subject, subjectId, text) {
		return globalResponseHandler({
			url: "report/add",
			type: 'post',
			data: {
				subject: subject,
				subjectId: subjectId,
				text: text
			}
		}, {
			description: '添加举报'
		});
	};

});