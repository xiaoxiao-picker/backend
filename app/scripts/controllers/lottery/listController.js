define(function(require, exports, module) {
	var baseController = require('baseController');
	var template = require('template');
	var bC = new baseController();
	var LotteryService = require("LotteryService");
	var Helper = require("helper");
	var Pagination = require('lib.Pagination');

	var limit, page, keyword;
	var orgId = App.organization.id;

	var Controller = function() {
		var controller = this;
		controller.namespace = "lottery.list";
		controller.actions = {
			search: function() {
				var btn = this;
				keyword = btn.parents(".search-box").find(".keyword-name").val();
				Helper.begin(btn);
				page = 1;
				controller.render(function() {
					Helper.end(btn);
				});
			},
			switch: function() {
				var input = this;
				var lotteryId = input.attr("data-value");
				var checked = input.prop("checked");

				LotteryService.updateState(lotteryId, checked ? 'OPEN' : 'CLOSED').done(function(data) {
					Helper.successToast(checked ? "抽奖已开启！" : "抽奖已关闭！");
					if (checked) {
						input.prop("checked", true);
					} else {
						input.removeAttr("checked");
					}
				}).fail(function(error) {
					Helper.alert(error);
				});
			},
			remove: function() {
				var btn = this;
				var lotteryId = btn.attr("data-value");

				Helper.confirm("是否确认删除该抽奖？", {}, function() {
					Helper.begin(btn);
					LotteryService.remove(lotteryId).done(function() {
						controller.render();
					}).fail(function(error) {
						Helper.alert(error);
					}).always(function() {
						Helper.end(btn);
					});
				});
			}
		};
	};
	bC.extend(Controller);
	/**
	 * 初始化变量，渲染模板
	 */
	Controller.prototype.init = function() {
		var controller = this;

		keyword = "";
		page = +Helper.param.search('page') || 1;
		limit = +Helper.param.search('limit') || 10;

		controller.render(this.callback);
	};

	Controller.prototype.render = function(callback) {
		var controller = this;
		var templateUrl = controller.templateUrl;
		var skip = (page - 1) * limit;

		LotteryService.getList({
			organizationId: orgId,
			skip: skip,
			limit: limit,
			keyword: keyword
		}).done(function(data) {
			var lotteries = data.result.data;
			var total = data.result.total;
			Helper.globalRender(template(templateUrl, {
				lotteries: lotteries,
				total: total,
				keyword: keyword,
				pagination: Helper.pagination(total, limit, page)
			}));

			Pagination(total, limit, page, {
				switchPage: function(pageIndex) {
					page = pageIndex;
					Application.loader.begin();
					controller.render(function() {
						Application.loader.end();
					});
				}
			});

		}).fail(function(error) {
			Helper.alert(error);
		}).always(function() {
			Helper.execute(callback);
		});

	};

	module.exports = Controller;
});