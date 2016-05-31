define(function(require, exports, module) {
	var globalResponseHandler = require("ajaxHandler");

	// 获取所有广告分类
	exports.classes = function(keyword) {
		return globalResponseHandler({
			url: 'advertisement/classes/list',
			data: {
				keyword: keyword
			}
		});
	};

	// 获取热门广告分类
	exports.classesForHot = function(limit) {
		return globalResponseHandler({
			url: 'advertisement/classes/list-favourite',
			data: {
				limit: limit
			}
		});
	};

	// 添加广告
	exports.add = function(organizationId, classes, sourceId, sourceType) {
		return globalResponseHandler({
			url: 'advertisement/add',
			type: 'post',
			data: {
				organizationId: organizationId,
				classes: classes,
				sourceId: sourceId,
				sourceType: sourceType
			}
		});
	};

	// 更换广告
	exports.update = function(data) {
		return globalResponseHandler({
			url: 'advertisement/update',
			type: 'post',
			data: data
		});
	};

	// 删除广告
	exports.remove = function(sourceId, sourceType) {
		return globalResponseHandler({
			url: 'advertisement/remove',
			type: 'post',
			data: {
				sourceId: sourceId,
				sourceType: sourceType
			}
		});
	};

	// 获取广告详情
	exports.get = function(sourceType, sourceId) {
		return globalResponseHandler({
			url: 'advertisement/' + sourceType + '/' + sourceId + '/get'
		});
	};

	// 开启广告
	exports.open = function(advertisementId) {
		return globalResponseHandler({
			url: 'advertisement/' + advertisementId + '/open',
			type: 'post'
		});
	};

	// 关闭广告
	exports.close = function(advertisementId) {
		return globalResponseHandler({
			url: 'advertisement/' + advertisementId + '/close',
			type: 'post'
		});
	};

	// 获取组织下的所有广告位
	exports.getAdverts = function(orgId, skip, limit) {
		return globalResponseHandler({
			url: 'advertisement/list',
			data: {
				organizationId: orgId,
				skip: skip,
				limit: limit
			}
		});
	};

	/* =================== 广告统计 =================== */
	exports.statistics = {
		getList: function(advertisementId, startDate, endDate, skip, limit) {
			return globalResponseHandler({
				url: 'advertisement/' + advertisementId + "/statistics/list",
				data: {
					startDate: startDate,
					endDate: endDate,
					skip: skip,
					limit: limit
				}
			});
		},
		organization: {
			getList: function(orgId, startDate, endDate, skip, limit) {
				return globalResponseHandler({
					url: 'advertisement/statistics/list',
					data: {
						organizationId: orgId,
						startDate: startDate,
						endDate: endDate,
						skip: skip,
						limit: limit
					}
				});
			},
			getTotalList: function(orgId, startDate, endDate) {
				return globalResponseHandler({
					url: 'advertisement/statistics/list-group-by-date',
					data: {
						organizationId: orgId,
						startDate: startDate,
						endDate: endDate
					}
				});
			}
		},
		source: {
			getList: function(sourceType, sourceId, startDate, endDate) {
				return globalResponseHandler({
					url: "advertisement/" + sourceType + "/" + sourceId + "/statistics/list",
					data: {
						startDate: startDate,
						endDate: endDate,
						skip: 0,
						limit: 0
					}
				}, {
					description: "获取广告访问详情"
				});
			},
			getSum: function(sourceType, sourceId) {
				return globalResponseHandler({
					url: "advertisement/" + sourceType + "/" + sourceId + "/statistics/get-sum"
				}, {
					description: "获取广告访问总数据"
				});
			}
		}
	};

});