define(function(require, exports, module) {
	var Chart = require("plugins/chart/Chart");
	var Helper = require("helper");
	var VoteService = require("VoteService");
	var template = require("template");

	var StatisticsBox = function(voteId, options) {
		var statisticsBox = this;
		this.targetId = voteId;
		this.namespace = "vote.statistics";

		options = $.extend({
			title: "投票统计结果"
		}, options);

		var modal = Helper.modal(options);
		modal.html(template("app/templates/vote/statistics", options));

		this.canvas = modal.box.find(".canvas").get(0);

		// 获取投票结果
		(function request() {
			VoteService.option.getList(statisticsBox.targetId, 0, 0).done(function(data) {
				statisticsBox.statisticsData = data.result;
				if (statisticsBox.statisticsData.length == 0) {
					modal.html("<div class='text-gray center'>该投票暂未添加选项！</div>");
					// Helper.alert("该投票暂未添加选项！", function() {
					// 	modal.destroy();
					// });
					return;
				}
				modal.box.find(".nav-loading").addClass("hide");
				modal.box.find(".canvas").removeClass("hide");
				// statisticsBox.renderLine();
				statisticsBox.renderBar();
				// statisticsBox.renderPie();
				// statisticsBox.renderDoughnut();
			}).fail(function(error) {
				Helper.alert(error);
				modal.destroy();
			});
		})();
	};

	// 绘制曲线图
	StatisticsBox.prototype.renderLine = function() {
		var statisticsBox = this;
		var data = makeLineData(statisticsBox.statisticsData);
		var ctx = statisticsBox.canvas.getContext("2d");
		new Chart(ctx).Line(data);
	};
	// 绘制柱状图
	StatisticsBox.prototype.renderBar = function() {
		var statisticsBox = this;
		var data = makeBarData(statisticsBox.statisticsData);
		if (data.labels.length > 15) {
			statisticsBox.canvas.width = data.labels.length * 40;
		}
		var ctx = statisticsBox.canvas.getContext("2d");
		new Chart(ctx).Bar(data, {
			barStrokeWidth: 1
		});
	};
	// 绘制饼状图
	StatisticsBox.prototype.renderPie = function() {
		var statisticsBox = this;
		var data = makePieData(statisticsBox.statisticsData);
		var ctx = statisticsBox.canvas.getContext("2d");
		new Chart(ctx).Pie(data);
	};
	// 绘制环形图
	StatisticsBox.prototype.renderDoughnut = function() {
		var statisticsBox = this;
		var data = makePieData(statisticsBox.statisticsData);
		var ctx = statisticsBox.canvas.getContext("2d");
		new Chart(ctx).Doughnut(data);
	};


	function makeLineData(statisticsData) {
		var data = {
			labels: [],
			datasets: [{
				fillColor: "rgba(151,187,205,0.5)",
				strokeColor: "rgba(151,187,205,1)",
				pointColor: "rgba(151,187,205,1)",
				pointStrokeColor: "#fff",
				data: []
			}, {
				fillColor: "rgba(151,187,205,0.5)",
				strokeColor: "rgba(151,187,205,1)",
				pointColor: "rgba(151,187,205,1)",
				pointStrokeColor: "#fff",
				data: []
			}]
		};
		$(statisticsData).each(function(idx, item) {
			data.labels.push(item.name);
			data.datasets[0].data.push(item.totalVotes || 0);
		});
		return data;
	}

	function makeBarData(statisticsData) {
		var data = {
			labels: [],
			datasets: [{
				fillColor: "rgba(151,187,205,0.5)",
				strokeColor: "rgba(151,187,205,1)",
				data: []
			}]
		};
		$(statisticsData).each(function(idx, item) {
			data.labels.push(item.name);
			data.datasets[0].data.push(item.totalVotes || 0);
		});
		return data;
	}

	function makePieData(statisticsData) {
		var data = [];
		$(statisticsData).each(function(idx, item) {
			data.push({
				value: item.totalVotes || 0,
				color: "#F7464A"
			});
		});
		return data;
	}



	module.exports = function(voteId, options) {
		return new StatisticsBox(voteId, options);
	};
});