define(function(require, exports, module) {
	var globalResponseHandler = require("ajaxHandler");

	/* ===================== 文章 ===================== */

	// 文章详情
	exports.load = function(articleId) {
		return globalResponseHandler({
			url: 'article/' + articleId + '/get'
		}, {
			description: '获取文章详情'
		});
	};

	// 创建文章
	exports.add = function(orgId, data) {
		data.orgId = orgId;
		return globalResponseHandler({
			url: 'article/add',
			type: 'post',
			data: data
		}, {
			description: '创建文章'
		});
	};

	// 更新文章
	exports.update = function(orgId, articleId, data) {
		data.orgId = orgId;
		return globalResponseHandler({
			url: 'article/' + articleId + '/update',
			type: 'post',
			data: data
		}, {
			description: '更新文章'
		});
	};

	// 更新文章状态
	exports.updateState = function(orgId, articleId, state) {
		return globalResponseHandler({
			url: 'article/' + articleId + '/status/change',
			type: 'post',
			data: {
				orgId: orgId,
				status: state
			}
		}, {
			description: '更新文章状态'
		});
	};

	// 删除文章
	exports.remove = function(articleId, orgId) {
		return globalResponseHandler({
			url: 'article/' + articleId + '/remove',
			type: 'post',
			data: {
				orgId: orgId
			}
		}, {
			description: '删除文章'
		});
	};

	// 文章列表
	exports.list = function(orgId, state, skip, limit, categoryId, keyword) {
		return globalResponseHandler({
			url: 'article/list',
			data: {
				orgId: orgId,
				state: state,
				skip: skip,
				limit: limit,
				categoryId: categoryId || "",
				keyword: keyword || ""
			}
		}, {
			description: '获取文章列表'
		});
	};

	/* ===================== 文章分类 ===================== */

	exports.category = {
		// 添加分类
		add: function(orgId, name) {
			return globalResponseHandler({
				url: 'article/category/add',
				type: 'post',
				data: {
					orgId: orgId,
					name: name
				}
			}, {
				description: '创建文章分类'
			});
		},
		// 更新分类
		update: function(orgId, categoryId, name) {
			return globalResponseHandler({
				url: 'article/category/' + categoryId + '/update',
				type: 'post',
				data: {
					orgId: orgId,
					name: name
				}
			}, {
				description: '更新文章分类'
			});
		},
		// 删除分类
		remove: function(orgId, categoryIds) {
			return globalResponseHandler({
				url: 'article/category/remove',
				type: 'post',
				data: {
					orgId: orgId,
					categoryIds: categoryIds
				}
			}, {
				description: '删除文章分类'
			});
		},
		// 分类列表
		list: function(orgId) {
			return globalResponseHandler({
				url: 'article/category/list',
				data: {
					orgId: orgId
				}
			}, {
				description: '获取文章分类列表'
			});
		}
	};
});