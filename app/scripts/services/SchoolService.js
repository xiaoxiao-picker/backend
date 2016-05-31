define(function(require, exports, module) {
	var globalResponseHandler = require("ajaxHandler");

	exports.getList = function(skip, limit) {
		return globalResponseHandler({
			url: 'exhibition/list',
			data: {
				skip: skip,
				limit: limit
			}
		}, {
			description: '获取学校风采列表'
		});
	};

	exports.get = function(exhibitionId) {
		return globalResponseHandler({
			url: 'exhibition/' + exhibitionId + '/get'
		}, {
			description: '获取学校风采'
		});
	};

	exports.add = function(exhibitionId, data) {
		return globalResponseHandler({
			url: 'exhibition/add',
			type: 'post',
			data: data
		}, {
			description: '添加学校风采'
		});
	};

	exports.update = function(exhibitionId, data) {
		return globalResponseHandler({
			url: 'exhibition/' + exhibitionId + '/update',
			type: 'post',
			data: data
		}, {
			description: '更新学校风采'
		});
	};

	exports.remove = function(exhibitionId) {
		return globalResponseHandler({
			url: 'exhibition/' + exhibitionId + '/remove',
			type: 'post'
		}, {
			description: '删除学校风采'
		});
	};

	exports.wechat = {
		getList: function(exhibitionId, skip, limit) {
			return globalResponseHandler({
				url: 'exhibition/school/' + exhibitionId + '/qr-code/list',
				data: {
					skip: skip,
					limit: limit
				}
			}, {
				description: '获取学校风采的组织列表'
			});
		},
		get: function(qrcodeId) {
			return globalResponseHandler({
				url: 'exhibition/school/qr-code/' + qrcodeId + '/get',
			}, {
				description: '获取学校风采的组织详情'
			});
		},
		add: function(exhibitionId, data) {
			return globalResponseHandler({
				url: 'exhibition/school/' + exhibitionId + '/qr-code/add',
				type: 'post',
				data: data
			}, {
				description: '添加学校风采的组织'
			});
		},
		update: function(qrcodeId, data) {
			return globalResponseHandler({
				url: 'exhibition/school/qr-code/' + qrcodeId + '/update',
				type: 'post',
				data: data
			}, {
				description: '更新学校风采的组织'
			});
		},
		remove: function(qrcodeId) {
			return globalResponseHandler({
				url: 'exhibition/school/qr-code/' + qrcodeId + '/remove',
				type: 'post'
			}, {
				description: '删除学校风采的组织'
			});
		}
	};

});