define(function(require, exports, module) {
	var globalResponseHandler = require("ajaxHandler");

	// 意见反馈列表
	exports.getList = function(orgId, skip, limit) {
		return globalResponseHandler({
			url: 'feedback/list',
			data:{
				orgId: orgId,
				skip: skip,
				limit: limit
			}
		}, {
			description: '获取意见反馈列表'
		});
	};

	exports.reply = {
		getList: function(feedbackId, skip, limit) {
			return globalResponseHandler({
				url: 'feedback/' + feedbackId + '/feedback-reply/list',
				data: {
					skip: skip,
					limit: limit
				}
			}, {
				description: '获取反馈回复列表'
			});
		},
		add: function(feedbackId, text) {
			return globalResponseHandler({
				url: 'feedback/' + feedbackId + '/add-reply',
				type: 'post',
				data: {
					text: text
				}
			}, {
				description: '添加反馈回复'
			});
		}
	};
	
});