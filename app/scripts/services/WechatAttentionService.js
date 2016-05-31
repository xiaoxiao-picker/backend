define(function(require, exports, module) {
	var globalResponseHandler = require("ajaxHandler");

	// 设置关注后操作的业务类型包括
	// EVENT, VOTE, TICKET, POLL, JOIN_APPLY

	exports.open = function(orgId, sourceType, sourceId) {
		return globalResponseHandler({
			url: "wechat/attention/check/add",
			type: "post",
			data: {
				orgId: orgId,
				eventId: sourceId,
				eventType: sourceType
			}
		});
	};

	exports.close = function(orgId, sourceType, sourceId) {
		return globalResponseHandler({
			url: "wechat/attention/check/remove",
			type: "post",
			data: {
				eventId: sourceId,
				eventType: sourceType
			}
		});
	};

	exports.get = function(sourceType, sourceId) {
		return globalResponseHandler({
			url: "wechat/attention/check/get",
			data: {
				eventId: sourceId,
				eventType: sourceType
			}
		});
	};
});