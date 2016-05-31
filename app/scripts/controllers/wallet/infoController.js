define(function(require, exports, module) {
	require("datetimepicker");
	// 日期对比函数库
	var dateCompare = require("dateCompare");

	var baseController = require('baseController');
	var bC = new baseController();

	var template = require('template');
	var Helper = require("helper");

	var AdvertisementService = require("AdvertisementService");
	var WalletService = require("WalletService");

	var orgId, skip, limit, page;

	var walletInfo;

	var Controller = function() {
		var _controller = this;
		_controller.namespace = "wallet.info";
		_controller.actions = {
			switchTimeBucket: function() {
				var btn = this;
				var number = +btn.attr("data-value");

				var searchForm = btn.parents(".advert-search-box").find(".search-form");
				searchForm.find(".datetime-min").val(new Date((new Date().getTime() - 1000 * 60 * 60 * 24 * number)).Format("yyyy/MM/dd"));
				searchForm.find(".datetime-max").val(new Date().Format("yyyy/MM/dd"));
				searchForm.find(".btnConfirm").trigger("click");
			},
			switchIncomeAndExpenses: function() {
				var btn = $("#SearchBox .btnConfirm");
				var dates = getDates();
				if (!dates) return;
				var startDate = dates.startDate;
				var endDate = dates.endDate;
				renderStatisticsRecord(startDate, endDate, btn);
			},
			search: function() {
				var btn = this;

				var dates = getDates();
				if (!dates) return;
				var startDate = dates.startDate;
				var endDate = dates.endDate;
				renderStatisticsChart(startDate, endDate, btn);
				renderStatisticsRecord(startDate, endDate, btn);
			},
			openDraw: function() {
				if (walletInfo.money < 100) {
					return Helper.alert("当前余额少于100元，不可申请取款！");
				}

				require.async("ATM", function(ATM) {
					ATM({
						value: Math.floor(walletInfo.money / 100),
						maxValue: walletInfo.money,
						success: function(btn, value) {
							var modal = this;
							walletInfo.money -= value;
							$("#Balance").text(walletInfo.money);
							modal.destroy();
						}
					});
				});
			}
		};
	};
	bC.extend(Controller);

	Controller.prototype.init = function() {
		orgId = App.organization.id;
		this.render();
	};

	Controller.prototype.render = function() {
		var templateUrl = this.templateUrl;
		var callback = this.callback();
		WalletService.get(orgId).done(function(data) {
			walletInfo = data.result;

			Helper.globalRender(template(templateUrl, {
				wallet: walletInfo
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

			$($("#SearchBox .btnTimeLine").get(0)).trigger("click");
		}).fail(function(error) {
			Helper.alert(error);
		}).done(function() {
			Helper.execute(callback);
		});
	}

	/**
	 *	切换天数获取收益统计数据
	 */
	function renderStatisticsChart(startDate, endDate, btn) {
		// 数据统计图表
		Helper.begin(btn);
		AdvertisementService.statistics.organization.getTotalList(orgId, startDate, endDate).done(function(data) {
			var statistics = data.result;
			var chartData = statistics.length > 0 ? statistics : [{
				date: endDate,
				views: 0,
				effectiveViews: 0,
				clicks: 0,
				effectiveClicks: 0
			}, {
				date: startDate,
				views: 0,
				effectiveViews: 0,
				clicks: 0,
				effectiveClicks: 0
			}];

			chartData = getChartDataForStatistics(chartData);
			require.async("ChartBox", function(ChartBox) {
				ChartBox($("#ChartBody"), chartData, {});
			});
		}).fail(function(error) {
			Helper.alert(error);
		}).always(function() {
			Helper.end(btn);
		});
	}

	function renderStatisticsRecord(startDate, endDate, btn) {
		var type = $("#RecordSearchBox").find("[name=record-type]:checked").val();
		(type == "IN" ? renderIncomeStatisticsRecord : renderSpendStatisticsRecord)(startDate, endDate, btn);
	}

	function renderIncomeStatisticsRecord(startDate, endDate, btn) {
		// 渲染收入明细
		Helper.begin(btn);
		AdvertisementService.statistics.organization.getList(orgId, startDate, endDate, 0, 0).done(function(data) {
			var logs = data.result.data;
			var count = data.result.total;

			$.each(logs, function(idx, log) {
				log.advertisement.source = sourceToData(log.advertisement.sourceType, log.advertisement.source);
			});

			$("#WalletListContainer").html(template('app/templates/wallet/innerIncomeList', {
				logs: logs
			}));
		}).fail(function(error) {
			Helper.alert(error);
		}).always(function() {
			Helper.end(btn);
		});
	}

	function renderSpendStatisticsRecord(startDate, endDate, btn) {
		// 渲染支出明细
		Helper.begin(btn);
		WalletService.apply.getList(orgId, 0, 0).done(function(data) {
			var logs = data.result.data;
			$("#WalletListContainer").html(template('app/templates/wallet/innerSpendList', {
				logs: logs
			}));
		}).fail(function(error) {
			Helper.alert(error);
		}).always(function() {
			Helper.end(btn);
		});
	}

	function getDates() {
		var startDate = $("#SearchBox .search-form").find(".datetime-min").val();
		var endDate = $("#SearchBox .search-form").find(".datetime-max").val();

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

			return {
				startDate: startDate,
				endDate: endDate
			};
		} catch (error) {
			Helper.alert("请填写正确的开始/结束时间！");
			return false;
		}
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
		chartData.reverse();
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
	 *	将收入明细source转换成统一数据结构
	 */
	function sourceToData(type, data) {
		if (type == "EVENT") {
			return {
				title: data.name,
				url: '#advertisement/EVENT/' + data.id + '/info'
			}
		} else if (type == "ARTICLE") {
			return {
				title: data.name,
				url: '#advertisement/EVENT/' + data.id + '/info'
			}
		} else if (type == "VOTE") {
			return {
				title: data.name,
				url: '#advertisement/VOTE/' + data.id + '/edit'
			}
		}
	}

	module.exports = Controller;
});