define(function(require, exports, module) {
	require("datetimepicker");
	// 日期对比函数库
	var dateCompare = require("dateCompare");

	var baseController = require("baseController");
	var bC = new baseController();

	var template = require("template");
	var Helper = require("helper");

	var AdvertisementService = require("AdvertisementService");

	var orgId, from;

	var sourceId, sourceType;

	var advertInfo;

	var configData;

	var Controller = function() {
		var controller = this;
		controller.namespace = "advertisement.info";
		controller.actions = {
			switchState: function() {
				var $input = this;

				if ($input.data("executing")) return;

				$input.data("executing", true);
				if (advertInfo.id) { // 如果广告位已创建
					var action = advertInfo.state == "OPEN" ? "close" : "open";
					AdvertisementService[action](advertInfo.id).done(function(data) {
						if (advertInfo.state == "OPEN") {
							$input.removeAttr("checked");
							advertInfo.state = "CLOSED";
						} else {
							$input.prop("checked", "checked");
							advertInfo.state = "OPEN";
						}
					}).fail(function(error) {
						Helper.alert(error);
					}).always(function() {
						$input.data("executing", false);
					});
				} else { // 如果广告位暂未创建，则先创建
					AdvertisementService.add(orgId, "", sourceId, sourceType).done(function(data) {
						advertInfo.id = data.result;
						advertInfo.state = "OPEN";
						$input.prop("checked", "checked");
					}).fail(function(error) {
						Helper.alert(error);
					}).always(function() {
						$input.data("executing", false);
					});

				}
			},
			switchTimeBucket: function() {
				var btn = this;
				var number = +btn.attr("data-value");

				var searchForm = btn.parents(".advert-search-box").find(".search-form");
				searchForm.find("#StartDate").val(new Date((new Date().getTime() - 1000 * 60 * 60 * 24 * number)).Format("yyyy/MM/dd"));
				searchForm.find("#EndDate").val(new Date().Format("yyyy/MM/dd"));
				searchForm.find(".btnConfirm").trigger("click");
			},
			search: function() {
				var btn = this;
				var startDate = btn.parents(".search-form").find("#StartDate").val();
				var endDate = btn.parents(".search-form").find("#EndDate").val();

				if (Helper.validation.isEmptyNull(startDate)) {
					return Helper.errorToast("开始时间不能为空！");
				}
				if (Helper.validation.isEmptyNull(endDate)) {
					return Helper.errorToast("结束时间不能为空！");
				}
				try {
					startDate = new Date(startDate + " 00:00:00").getTime();
					endDate = new Date(endDate + " 00:00:00").getTime();

					if ((endDate - startDate) > 1000 * 60 * 60 * 24 * 30) {
						return Helper.alert("最多可查询30天的数据！");
					}

					Helper.begin(btn);
					renderStatistics(startDate, endDate, function() {
						Helper.end(btn);
					});
				} catch (error) {
					Helper.alert("请填写正确的开始/结束时间！");
				}
			},
			// showMarket: function() {
			// 	require.async("AdvertSelector", function(AdvertSelector) {
			// 		AdvertSelector({
			// 			advertId: advertId,
			// 			classes: classes,
			// 			sourceId: sourceId,
			// 			sourceType: sourceType,
			// 			save: function(value) {
			// 				controller.render();
			// 			},
			// 			cancel: function() {}
			// 		});
			// 	});
			// }
		};
	};
	bC.extend(Controller);

	Controller.prototype.init = function() {
		orgId = App.organization.id;
		from = Helper.param.search('from') || "edit";
		sourceId = Helper.param.hash("sourceId");
		sourceType = Helper.param.hash("sourceType");

		configData = getConfigData(sourceId);
		this.render();
	};

	Controller.prototype.render = function() {
		var controller = this;

		var getAdvertInfo = AdvertisementService.get(sourceType, sourceId).done(function(data) {
			advertInfo = data.result || {
				sourceType: sourceType,
				sourceId: sourceId,
				orgId: orgId
			};
		});

		var totalAdvertData;
		var getTotal = AdvertisementService.statistics.source.getSum(sourceType, sourceId).done(function(data) {
			totalAdvertData = data.result;
		});

		$.when(Application.getConfig(), getAdvertInfo, getTotal).done(function() {
			Helper.globalRender(template(controller.templateUrl, {
				orgId: orgId,
				title: configData[sourceType].title,
				advert: advertInfo,
				back: configData[sourceType][from],
				advertConfig: Application.config.advConfig,
				totalAdvertData: totalAdvertData
			}));

			$('.advert-search-box .datetime').datetimepicker({
				format: 'yyyy/mm/dd',
				autoclose: true,
				language: 'zh-CN',
				pickerPosition: 'bottom-right',
				endDate: new Date(),
				minView: 2
			}).on("changeDate", function(evt) {
				var _input = $(this);
				var date = evt.date.valueOf();
				dateCompare.compare(_input, Helper.errorToast);
			});

			$($(".advert-search-box .btnTimeLine").get(0)).trigger("click");
		}).fail(function(error) {
			Helper.alert(error);
		}).always(function() {
			Helper.execute(controller.callback);
		});
	};

	function renderStatistics(startDate, endDate, callback) {
		var advertDataList;

		var getDetail = AdvertisementService.statistics.source.getList(sourceType, sourceId, startDate, endDate).done(function(data) {
			advertDataList = data.result;
		});

		$.when(getDetail).done(function() {
			var chartData = advertDataList.data.length > 0 ? advertDataList.data : [{
				date: startDate,
				views: 0,
				effectiveViews: 0,
				clicks: 0,
				effectiveClicks: 0
			}, {
				date: endDate,
				views: 0,
				effectiveViews: 0,
				clicks: 0,
				effectiveClicks: 0
			}];
			renderChart(chartData);
			renderList(advertDataList.data);
		}).fail(function(error) {
			Helper.alert(error);
		}).always(function() {
			Helper.execute(callback);
		});
	}

	/**
	 *	渲染统计折线图
	 */
	function renderChart(returns) {
		var chartData = getChartDataForStatistics(returns);
		require.async("ChartBox", function(ChartBox) {
			ChartBox($("#ChartBody"), chartData, {});
		});
	}

	/**
	 *	渲染统计列表
	 */
	function renderList(returns) {
		if (returns.length > 0) {
			var total = {
				date: "总和",
				views: 0,
				effectiveViews: 0,
				clicks: 0,
				effectiveClicks: 0,
				viewsMoney: 0,
				clicksMoney: 0
			};
			$(returns).each(function(idx, record) {
				total.views += record.views;
				total.effectiveViews += record.effectiveViews;
				total.clicks += record.clicks;
				total.effectiveClicks += record.effectiveClicks;
				total.viewsMoney += record.viewsMoney;
				total.clicksMoney += record.clicksMoney;
			});
			returns.splice(0, 0, total);
		}
		$("#TimeListContainer").html(template("app/templates/advertisement/inner-list", {
			returns: returns
		}));
	}

	/**
	 *	将 返回统计数据 转换成 图表接受数据
	 */
	function getChartDataForStatistics(data) {
		var labels = [],
			views = [],
			clicks = [],
			effectiveViews = [],
			effectiveClicks = [];

		var chartData = data.concat();
		// chartData.reverse();
		var format = data.length > 10 ? "MM-dd" : "yyyy/MM/dd";
		$.each(chartData, function(idx, item) {
			labels.push(Helper.makedate(item.date, format));
			views.push(item.views);
			clicks.push(item.clicks);
			effectiveViews.push(item.effectiveViews);
			effectiveClicks.push(item.effectiveClicks);
		});

		return {
			labels: labels,
			datasets: [{
				fillColor: "rgba(255,207,0,0.1)",
				strokeColor: "rgba(255,207,0,1)",
				pointColor: "rgba(255,207,0,1)",
				pointStrokeColor: "#fff",
				data: views
			}, {
				fillColor: "rgba(91,209,139,0.1)",
				strokeColor: "rgba(91,209,139,1)",
				pointColor: "rgba(91,209,139,1)",
				pointStrokeColor: "#fff",
				data: effectiveViews
			}, {
				fillColor: "rgba(88,162,236,0.1)",
				strokeColor: "rgba(88,162,236,1)",
				pointColor: "rgba(88,162,236,1)",
				pointStrokeColor: "#fff",
				data: clicks
			}, {
				fillColor: "rgba(148,119,211,0.1)",
				strokeColor: "rgba(148,119,211,1)",
				pointColor: "rgba(148,119,211,1)",
				pointStrokeColor: "#fff",
				data: effectiveClicks
			}]
		}
	}

	/**
	 *配置信息
	 *可根据sourceType，获取标题、返回按钮内容等
	 */
	function getConfigData(sourceId) {
		return {
			EVENT: {
				title: "活动广告",
				info: {
					url: '#event/' + sourceId + '/info',
					title: '活动预览'
				},
				edit: {
					url: '#event/' + sourceId + '/edit',
					title: '活动编辑'
				}
			},
			ARTICLE: {
				title: "文章广告",
				info: {
					url: '#article/' + sourceId + '/info',
					title: '文章预览'
				},
				edit: {
					url: '#article/' + sourceId + '/edit',
					title: '文章编辑'
				}
			},
			VOTE: {
				title: "投票广告",
				edit: {
					url: '#vote/' + sourceId + '/edit',
					title: '投票编辑'
				},
				list:{
					url: '#votes',
					title: '投票列表'
				}
			}
		}
	}

	module.exports = Controller;
});