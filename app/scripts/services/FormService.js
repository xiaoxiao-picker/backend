define(function(require, exports, module) {
	var globalResponseHandler = require("ajaxHandler");

	// 获取表格列表
	exports.getList = function(orgId, skip, limit, keyword) {
		return globalResponseHandler({
			url: 'form/list',
			data: {
				orgId: orgId,
				skip: skip,
				limit: limit,
				keyword: keyword || ''
			}
		}, {
			description: '获取表格列表'
		});
	};

	// 获取表格详情
	exports.get = function(formId) {
		return globalResponseHandler({
			url: 'form/' + formId + '/get'
		}, {
			description: '获取表格详情'
		});
	};

	// 添加表格
	exports.add = function(orgId, data) {
		data.orgId = orgId;
		return globalResponseHandler({
			url: 'form/add',
			type: 'post',
			data: data
		}, {
			description: '添加表格'
		});
	};

	// 修改表格
	exports.update = function(orgId, formId, data) {
		data.orgId = orgId;
		return globalResponseHandler({
			url: 'form/' + formId + '/update',
			type: 'post',
			data: data
		}, {
			description: '修改表格'
		});
	};

	// 删除表格
	exports.remove = function(formId) {
		return globalResponseHandler({
			url: 'form/' + formId + '/remove',
			type: 'post'
		}, {
			description: '删除表格'
		});
	};

	// 开启表格
	exports.open = function(formId) {
		return globalResponseHandler({
			url: 'form/' + formId + '/open',
			type: 'post'
		}, {
			description: '开启表格'
		});
	};

	// 关闭表格
	exports.close = function(formId) {
		return globalResponseHandler({
			url: 'form/' + formId + '/close',
			type: 'post'
		}, {
			description: '关闭表格'
		});
	};

	exports.reply = {
		// 获取表格回复列表
		getList: function(formId, skip, limit) {
			return globalResponseHandler({
				url: 'form/' + formId + '/result/list',
				data: {
					skip: skip,
					limit: limit
				}
			}, {
				description: '获取表格回复列表'
			});
		},
		// 获取回复详情
		get: function(formId, userId) {
			return globalResponseHandler({
				url: 'form/' + formId + '/result/get',
				data: {
					userId: userId
				}
			}, {
				description: '获取回复详情'
			});
		},
		// 删除回复人员信息
		remove: function(replyId) {
			return globalResponseHandler({
				url: 'form/reply/' + replyId + '/remove',
				type: 'post'
			}, {
				description: '删除回复人员信息'
			});
		},
		// 清空回复人员信息
		clear: function(formId) {
			return globalResponseHandler({
				url: 'form/' + formId + '/reply/clear',
				type: 'post'
			}, {
				description: '清空回复人员信息'
			});
		},
		// 清空回复人员信息
		add: function(formId) {
			return globalResponseHandler({
				url: 'form/' + formId + '/fill',
				type: 'post',
				data: {
					fillFormInfo: JSON.stringify({
						id: "39a03ee6-d5bc-4c09-8086-1b39dd04ec39",
						userTexts: [{textId: "92961424-c72b-4829-a248-cc41a5647c12", value: "测试"}],
						userDates: [],
						userImages: [{imageId: "834ceffd-e1fe-453b-a45d-9c6dff202f46", value: "http://img.xiaoxiao.la//371e9b25-e040-41a0-ba57-0f227b039e21.jpg,http://img.xiaoxiao.la//371e9b25-e040-41a0-ba57-0f227b039e21.jpg"}],
						userOptions: [{optionId: "a3d3675c-4cdc-47c7-aa95-e7fe3a03d095"}, {optionId: "1be26774-ccc4-4d89-b5d5-7e3ef0cfbd33"}]
					})
				}
			}, {
				description: '清空回复人员信息'
			});
		}
	};

});