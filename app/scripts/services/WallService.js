define(function(require, exports, module) {
	var globalResponseHandler = require("ajaxHandler");
	// 墙列表
	exports.getList = function(data) {
		return globalResponseHandler({
			url: 'wall/list',
			data: data
		}, {
			description: "获取微信墙列表"
		});
	};
	// 墙信息
	exports.get = function(wallId) {
		return globalResponseHandler({
			url: "wall/" + wallId + "/get"
		}, {
			description: "获取微信墙信息"
		});
	};
	// 创建墙
	exports.add = function(orgId, data) {
		data.orgId = orgId;
		return globalResponseHandler({
			url: "wall/add",
			type: 'post',
			data: data
		}, {
			description: "创建微信墙"
		});
	};
	// 修改微信墙信息
	exports.update = function(orgId, wallId, data) {
		data.orgId = orgId;
		return globalResponseHandler({
			url: "wall/" + wallId + "/update",
			type: 'post',
			data: data
		}, {
			description: "更新微信墙信息"
		});
	};
	// 开启墙
	exports.open = function(orgId, wallId) {
		return globalResponseHandler({
			url: "wall/" + wallId + "/open",
			type: "post",
			data: {
				orgId: orgId
			}
		}, {
			description: "开启微信墙"
		});
	};
	// 关闭墙
	exports.close = function(orgId, wallId) {
		return globalResponseHandler({
			url: "wall/" + wallId + "/close",
			type: "post",
			data: {
				orgId: orgId
			}
		}, {
			description: "关闭微信墙"
		});
	};
	// 开启审核，即需要审核
	exports.openCheck = function(orgId, wallId) {
		return globalResponseHandler({
			url: "wall/" + wallId + "/is-need-check",
			type: "post",
			data: {
				orgId: orgId,
				isNeedCheck: true
			}
		}, {
			description: "开启审核"
		});
	};
	// 关闭审核，即不需要审核
	exports.closeCheck = function(orgId, wallId) {
		return globalResponseHandler({
			url: "wall/" + wallId + "/is-need-check",
			type: "post",
			data: {
				orgId: orgId,
				isNeedCheck: false
			}
		}, {
			description: "关闭审核"
		});
	};
	// 删除墙
	exports.remove = function(orgId, wallId) {
		return globalResponseHandler({
			url: "wall/" + wallId + "/remove",
			type: "post",
			data: {
				orgId: orgId
			}
		}, {
			description: "删除微信墙"
		});
	};

	// 获取要上墙的消息
	exports.getMessages = function(wallId, skip, limit) {
		return globalResponseHandler({
			url: "wall/" + wallId + "/text/list",
			data: {
				skip: skip,
				limit: limit
			}
		}, {
			description: "获取微信墙消息队列"
		});
	};

	exports.getNewerMessages = function(wallId, skip, limit) {
		return globalResponseHandler({
			url: "wall/" + wallId + "/text/list",
			data: {
				limit: limit,
				maxId: lastId
			}
		}, {
			description: "获取微信墙消息队列"
		});
	};

	// 添加上墙消息
	exports.addMessage = function(wallId, text) {
		return globalResponseHandler({
			url: "wall/" + wallId + "/text/add",
			type: "post",
			data: {
				text: text
			}
		}, {
			description: "添加上墙消息"
		});
	};

	// 删除上墙消息
	exports.removeMessage = function(orgId, wallId, messageId) {
		return globalResponseHandler({
			url: "wall/text/" + messageId + "/remove",
			type: "post",
			data: {
				orgId: orgId
			}
		}, {
			description: "删除上墙消息"
		});
	};

	// 添加回复到上墙队列中
	exports.addToQueue = function(wallId, messageId) {
		return globalResponseHandler({
			url: "wall/" + wallId + "/text/add-to-wall",
			type: "post",
			data: {
				textId: messageId
			}
		}, {
			description: "添加消息至上墙等待队列"
		});
	};


	// 抽奖
	exports.lottery = {
		//获取抽奖列表
		getList: function(wallId) {
			return globalResponseHandler({
				url: "wall/" + wallId + "/lottery/winner/list"
			}, {
				description: "获取上墙抽奖名单"
			});
		}
	};

	exports.relation = {
		list: function(wallId, targetType) {
			return globalResponseHandler({
				url: 'wall/' + wallId + '/relation/list',
				data: {
					targetType: targetType
				}
			}, {
				description: "获取列表"
			});
		},
		add: function(wallId, targetId, targetType) {
			return globalResponseHandler({
				url: 'wall/' + wallId + '/relation/bind',
				type: 'post',
				data: {
					targetId: targetId,
					targetType: targetType
				}
			}, {
				description: '绑定'
			});
		},
		remove: function(wallId, targetId, targetType) {
			return globalResponseHandler({
				url: 'wall/' + wallId + '/relation/unbind',
				type: 'post',
				data: {
					targetId: targetId,
					targetType: targetType
				}
			}, {
				description: '解绑'
			});
		}
	};
});