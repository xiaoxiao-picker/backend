define(function(require, exports, module) {
	var globalResponseHandler = require("ajaxHandler");

	// 获取总收益
	exports.get = function(orgId) {
		return globalResponseHandler({
			url: 'wallet/get',
			data: {
				organizationId: orgId
			}
		});
	};

	// 取款
	exports.draw = function(orgId, payAccountId, money) {
		return globalResponseHandler({
			url: 'draw-money/apply',
			type: 'post',
			data: {
				organizationId: orgId,
				money: money,
				payAccountId: payAccountId
			}
		});
	};

	exports.apply = {
		getList: function(orgId, skip, limit) {
			return globalResponseHandler({
				url: 'draw-money/list',
				data: {
					organizationId: orgId,
					skip: skip,
					limit: limit
				}
			});
		}
	};


	exports.account = {
		// state [UNDEALED, APPROVED, REJECTED]
		getList: function(organizationId, state) {
			return globalResponseHandler({
				url: "pay-account/list",
				data: {
					orgId: organizationId,
					state: state || "",
					skip: 0,
					limit: 0
				}
			});
		},
		get: function(accountId) {
			return globalResponseHandler({
				url: "pay-account/" + accountId + "/get"
			});
		},

		// data 
		// name 交通银行，建设银行
		// account 账号，支付宝账号
		// orgId
		// type ALIPAY,BANK
		// photos 
		add: function(organizationId, data) {
			data = $.extend({
				orgId: organizationId,
				name: "",
				account: "",
				type: "",
				photos: ""
			}, data);
			return globalResponseHandler({
				url: "pay-account/add",
				type: "post",
				data: data
			});
		},
		update: function(accountId, data) {
			data = $.extend({
				name: "",
				account: "",
				photos: ""
			}, data);
			return globalResponseHandler({
				url: "pay-account/" + accountId + "/update",
				type: "post",
				data: data
			});
		},
		remove: function(accountId) {
			return globalResponseHandler({
				url: "pay-account/" + accountId + "/remove",
				type: "post"
			});
		},
		active: function(accountId) {
			return globalResponseHandler({
				url: "pay-account/" + accountId + "/active",
				type: "post"
			});
		}
	};

	//绑定
	exports.bind = function(sourceType, sourceId, targetType, targetId) {
		return globalResponseHandler({
			url: sourceType + '/' + sourceId + '/relation/' + targetType + '/bind',
			type: 'post',
			data: {
				targetId: targetId
			}
		}, {
			description: '设置绑定'
		});
	};
	//解绑
	exports.unbind = function(sourceType, sourceId, targetType, targetId) {
		return globalResponseHandler({
			url: sourceType + '/' + sourceId + '/relation/' + targetType + '/unbind',
			type: 'post',
			data: {
				targetId: targetId
			}
		}, {
			description: '解除绑定'
		});
	};
	// 获取
	exports.get = function(sourceType, sourceId, targetType) {
		return globalResponseHandler({
			url: sourceType + '/' + sourceId + '/relation/' + targetType + '/get'
		}, {
			description: '获取绑定内容'
		});
	};


});