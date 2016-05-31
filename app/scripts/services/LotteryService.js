define(function(require, exports, module) {
	var globalResponseHandler = require("ajaxHandler");

	exports.getList = function(data) {
		return globalResponseHandler({
			url: 'lottery/list',
			data: data
		}, {
			description: '获取抽奖列表'
		});
	};

	exports.get = function(lotteryId) {
		return globalResponseHandler({
			url: 'lottery/' + lotteryId + '/get'
		}, {
			description: '获取抽奖详情'
		});
	};

	exports.add = function(orgId, data) {
		data.organizationId = orgId;
		return globalResponseHandler({
			url: 'lottery/add',
			type: 'post',
			data: data
		}, {
			description: '创建抽奖'
		});
	};

	exports.update = function(orgId, lotteryId, data) {
		data.organizationId = orgId;
		return globalResponseHandler({
			url: 'lottery/' + lotteryId + '/update',
			type: 'post',
			data: data
		}, {
			description: '更新抽奖'
		});
	};

	exports.remove = function(lotteryId) {
		return globalResponseHandler({
			url: 'lottery/' + lotteryId + '/remove',
			type: 'post'
		}, {
			description: '删除抽奖'
		});
	};

	exports.updateState = function(lotteryId, state) {
		return globalResponseHandler({
			url: 'lottery/' + lotteryId + '/state/update',
			type: 'post',
			data: {
				state: state
			}
		}, {
			description: '切换抽奖开关'
		});
	};

	exports.time = {
		getList: function(lotteryId) {
			return globalResponseHandler({
				url: 'lottery/' + lotteryId + '/time/list'
			}, {
				description: '获取抽奖时间段列表'
			});
		},
		get: function(lotteryId, timeId) {
			return globalResponseHandler({
				url: 'lottery/' + lotteryId + '/time/' + timeId + '/get'
			}, {
				description: '获取抽奖某个时间段详情'
			});
		},
		add: function(lotteryId, data) {
			return globalResponseHandler({
				url: 'lottery/' + lotteryId + '/time/add',
				type: 'post',
				data: data
			}, {
				description: '添加抽奖时间段'
			});
		},
		update: function(lotteryId, timeId, data) {
			return globalResponseHandler({
				url: 'lottery/' + lotteryId + '/time/' + timeId + '/update',
				type: 'post',
				data: data
			}, {
				description: '更新抽奖时间段'
			});
		},
		remove: function(lotteryId, timeId) {
			return globalResponseHandler({
				url: 'lottery/' + lotteryId + '/time/' + timeId + '/remove',
				type: 'post'
			}, {
				description: '删除抽奖时间段'
			});
		}
	};

	exports.award = {
		getList: function(lotteryId) {
			return globalResponseHandler({
				url: 'lottery/' + lotteryId + '/award/list'
			}, {
				description: '获取抽奖奖品列表'
			});
		},
		get: function(lotteryId, awardId) {
			return globalResponseHandler({
				url: 'lottery/' + lotteryId + '/award/' + awardId + '/get'
			}, {
				description: '获取抽奖奖品详情'
			});
		},
		add: function(lotteryId, data) {
			return globalResponseHandler({
				url: 'lottery/' + lotteryId + '/award/add',
				type: 'post',
				data: data
			}, {
				description: '添加抽奖奖品'
			});
		},
		update: function(lotteryId, awardId, data) {
			return globalResponseHandler({
				url: 'lottery/' + lotteryId + '/award/' + awardId + '/update',
				type: 'post',
				data: data
			}, {
				description: '更新抽奖奖品'
			});
		},
		remove: function(lotteryId, awardId) {
			return globalResponseHandler({
				url: 'lottery/' + lotteryId + '/award/' + awardId + '/remove',
				type: 'post'
			}, {
				description: '删除抽奖奖品'
			});
		},
		result: function(lotteryId) {
			return globalResponseHandler({
				url: 'lottery/' + lotteryId + '/award/result'
			}, {
				description: '获取奖品中奖结果'
			});
		}
	};

});