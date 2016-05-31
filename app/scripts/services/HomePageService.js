/**
 * ****微首页*****
 */
define(function(require, exports, module) {
	var globalResponseHandler = require("ajaxHandler");

	// 获取组织微首页模板列表
	exports.getList = function(orgId, skip, limit) {
		return globalResponseHandler({
			url: "template/list",
			data: {
				organizationId: orgId,
				skip: skip,
				limit: limit
			}
		}, {
			description: "获取微首页列表"
		});
	};

	// 获取单个微首页信息 
	exports.get = function(orgId, id) {
		return globalResponseHandler({
			url: "template/" + id + "/get"
		}, {
			description: "获取微首页信息"
		});
	};

	// 添加微首页模板
	exports.add = function(orgId, name, json) {
		return globalResponseHandler({
			url: "template/add",
			type: "post",
			data: {
				organizationId: orgId,
				name: name,
				isActive: false,
				json: json
			}
		}, {
			description: "创建微首页"
		});
	};



	// 修改微首页模板 
	exports.update = function(orgId, id, name, json) {
		return globalResponseHandler({
			url: "template/" + id + "/update",
			type: "post",
			data: {
				organizationId: orgId,
				name: name,
				json: json
			}
		}, {
			description: "修改微首页"
		});
	};

	// 删除微首页模板 
	exports.remove = function(orgId, id) {
		return globalResponseHandler({
			url: "template/" + id + "/remove",
			type: "post"
		}, {
			description: "删除微首页"
		});
	};

	// 获取组织当前正在使用的微首页模板
	exports.getActive = function(orgId) {
		return globalResponseHandler({
			url: "template/get-active-template",
			data: {
				organizationId: orgId
			}
		}, {
			description: "获取主微首页"
		});
	};

	// 开启某个微首页模板 
	exports.open = function(orgId, id) {
		return globalResponseHandler({
			url: "template/" + id + "/active",
			type: "post"
		}, {
			description: "设置主微首页"
		});
	};
});