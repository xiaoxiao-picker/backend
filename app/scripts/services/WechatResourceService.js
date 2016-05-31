define(function(require, exports, module) {
	var globalResponseHandler = require("ajaxHandler");

	/**
	 * 微信图片库
	 * @param  {string} organizationId 组织ID
	 */

	var opts = {
		image: "图片库",
		voice: "语音",
		video: "视频",
		thumb: "图文消息"
	};

	$(['image', 'voice', 'video', 'thumb']).each(function(index, materialType) {
		exports[materialType] = {
			synchronize: function(organizationId) {
				return globalResponseHandler({
					url: "wechat/material/synchronize",
					type: "post",
					data: {
						organizationId: organizationId,
						type: materialType.toUpperCase()
					}
				}, {
					description: '同步微信' + opts[materialType]
				});
			},
			getList: function(organizationId, skip, limit) {
				return globalResponseHandler({
					url: "wechat/material/list",
					data: {
						organizationId: organizationId,
						type: materialType.toUpperCase(),
						skip: skip,
						limit: limit
					}
				}, {
					description: '获取微信' + opts[materialType] + '列表'
				});
			},
			remove: function(materialIds) {
				return globalResponseHandler({
					url: "wechat/material/remove",
					type: "post",
					data: {
						ids: materialIds
					}
				}, {
					description: '删除微信' + opts[materialType]
				});
			},
			get: function(materialId) {
				return globalResponseHandler({
					url: "wechat/material/" + materialId + "/get"
				}, {
					description: '获取微信' + opts[materialType] + '详细信息'
				});
			},
			add: function(organizationId, fileName, id) {
				return globalResponseHandler({
					url: "wechat/material/add",
					type: "post",
					data: {
						organizationId: organizationId,
						fileName: fileName,
						id: id,
						type: materialType.toUpperCase()
					}
				});
			}
		}
	});

	exports.graphic = {
		synchronize: function(organizationId) {
			return globalResponseHandler({
				url: "wechat/material/synchronize",
				type: "post",
				data: {
					type: "NEWS",
					organizationId: organizationId
				}
			}, {
				description: "同步微信图文消息"
			});
		},
		getList: function(organizationId, skip, limit) {
			return globalResponseHandler({
				url: "wechat/material/news/list",
				data: {
					organizationId: organizationId,
					skip: skip,
					limit: limit
				}
			}, {
				description: "获取微信图文消息"
			});
		},
		get: function(graphicId) {
			return globalResponseHandler({
				url: "wechat/material/news/" + graphicId + "/get",
				data: {
					graphicId: graphicId
				}
			}, {
				description: "获取微信图文消息"
			});
		},
		remove: function(graphicIds) {
			return globalResponseHandler({
				url: "wechat/material/news/remove",
				type: "post",
				data: {
					ids: graphicIds
				}
			}, {
				description: "删除微信图文消息"
			});
		},
		add: function(organizationId, articles) {
			return globalResponseHandler({
				url: "wechat/material/news/add",
				type: "post",
				data: {
					organizationId: organizationId,
					articles: articles
				}
			});
		}
	};
});