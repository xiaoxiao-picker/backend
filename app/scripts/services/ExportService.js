define(function(require, exports, module) {
	var globalResponseHandler = require("ajaxHandler");

	exports.members = function(organizationId) {
		return globalResponseHandler({
			url: 'member/' + organizationId + '/export',
			type: 'post'
		}, {
			description: "组织成员导出"
		});
	};

	exports.appliedusers = function(organizationId) {
		return globalResponseHandler({
			url: 'member/apply/' + organizationId + '/export',
			type: 'post'
		}, {
			description: "申请加入组织成员导出"
		});
	};

	exports.vote = function(voteId) {
		return globalResponseHandler({
			url: 'vote/' + voteId + '/result/export',
			type: 'post'
		}, {
			description: "投票结果导出"
		});
	};
	exports.votedetail = function(voteId) {
		return globalResponseHandler({
			url: 'vote/' + voteId + '/export',
			type: 'post'
		}, {
			description: "投票详情导出"
		});
	};
	exports.ticket = function(ticketId) {
		return globalResponseHandler({
			url: 'ticket-source/' + ticketId + '/export',
			type: 'post'
		}, {
			description: "电子票结果导出"
		});
	};
	exports.event = function(eventId) {
		return globalResponseHandler({
			url: 'event/' + eventId + '/export',
			type: 'post'
		}, {
			description: "活动报名结果导出"
		});
	};
	exports.questionnaire = function(pollId) {
		return globalResponseHandler({
			url: 'poll/' + pollId + '/export',
			type: 'post'
		}, {
			description: "问卷结果导出"
		});
	};
	exports.lottery = function(lotteryId) {
		return globalResponseHandler({
			url: 'lottery/' + lotteryId + '/result/export',
			type: 'post'
		}, {
			description: "中奖结果导出"
		});
	};
});