define(function(require, exports, module) {
	var globalResponseHandler = require("ajaxHandler");

	// 资源列表
	exports.getList = function(orgId, skip, limit, type, keyword) {
		var data = {
			organizationId: orgId,
			skip: skip,
			limit: limit
		};
		if (keyword) {
			data.keyword = keyword;
		};
		return globalResponseHandler({
			url: "attach/" + type + "/list",
			data: data
		}, {
			description: '获取素材列表'
		});
	};

	// 获取资源信息
	exports.get = function(id) {
		return globalResponseHandler({
			url: "attach/" + id + "/get"
		}, {
			description: '获取资源信息'
		});
	};

	// 更新资源名称
	exports.update = function(id, name) {
		return globalResponseHandler({
			url: "attach/" + id + "/update",
			type: 'post',
			data: {
				name: name
			}
		}, {
			description: '更新素材名称'
		});
	};

	// 删除资源
	exports.remove = function(orgId, ids) {
		return globalResponseHandler({
			url: "attach/remove",
			type: 'post',
			data: {
				organizationId: orgId,
				ids: ids
			}
		}, {
			description: '删除素材'
		});
	};


	exports.music = {
		list: function(orgId, skip, limit, keyword) {
			var data = {
				organizationId: orgId,
				skip: skip,
				limit: limit
			};
			if (keyword) data.keyword = keyword;
			return globalResponseHandler({
				url: "attach/MUSIC/list",
				data: data
			}, {
				description: '获取音乐列表'
			});
		}
	};


	/* ====================== 图片管理 ====================== */

	exports.image = {
		// 获取分组内图片列表
		getList: function(orgId, classId, skip, limit) {
			var data = {
				skip: skip,
				limit: limit,
				organizationId: orgId
			};
			if (classId) {
				data.classId = classId;
			};
			return globalResponseHandler({
				url: "picture-class/picture/list",
				data: data
			}, {
				description: '获取分组内图片列表'
			});
		},
		// 移动图片到分组
		move: function(orgId, pictureIds, newClassId) {
			return globalResponseHandler({
				url: "picture-class/picture/switch",
				type: 'post',
				data: {
					organizationId: orgId,
					ids: pictureIds,
					classId: newClassId
				}
			}, {
				description: '移动图片到分组'
			});
		},
		group: {
			// 获取图片分组列表
			getList: function(orgId) {
				return globalResponseHandler({
					url: "picture-class/list",
					data: {
						organizationId: orgId
					}
				}, {
					description: '获取图片分组列表'
				});
			},
			// 获取对应图片分组
			get: function(classId) {
				return globalResponseHandler({
					url: "picture-class/" + classId + "/get"
				}, {
					description: '获取对应图片分组'
				});
			},
			// 新建图片分组
			add: function(orgId, name) {
				return globalResponseHandler({
					url: "picture-class/add",
					type: 'post',
					data: {
						organizationId: orgId,
						name: name
					}
				}, {
					description: '新建图片分组'
				});
			},
			// 更新图片分组
			update: function(classId, name) {
				return globalResponseHandler({
					url: "picture-class/" + classId + "/update",
					type: 'post',
					data: {
						name: name
					}
				}, {
					description: '更新图片分组'
				});
			},
			// 删除图片分组
			remove: function(classId) {
				return globalResponseHandler({
					url: "picture-class/" + classId + "/remove",
					type: 'post'
				}, {
					description: '删除图片分组'
				});
			}
		}
	};

});