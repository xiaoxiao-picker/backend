define(function(require, exports, module) {
	var baseController = require('scripts/baseController');
	var bC = new baseController();
	var Helper = require("helper");
	var template = require('template');
	var LotteryService = require("LotteryService");
	var RelationService = require("RelationService");

	var orgId = Application.organization.id;

	var sourceType, sourceId;

	var Controller = function() {
		var controller = this;
		controller.namespace = "lottery.relation";
		controller.actions = {
			addLottery: function() {
				Helper.alert("新建抽奖后，请手动关联", function() {
					Helper.go("lottery/0/edit");
				});
			},
			bindLottery: function() {
				require.async("scripts/lib/LotterySelector", function(LotterySelector) {
					LotterySelector({
						title: "添加抽奖关联",
						max: sourceType == "WALL" ? 1 : -1,
						selectedLotteryIds: controller.lotteries.arrayOfAttr("id"),
						change: function(checked, lottery, $input) {
							var selector = this;
							var lotteryIds = [lottery.id].join(',');
							if (checked) {
								RelationService.bind(sourceType, sourceId, 'LOTTERY', lotteryIds).done(function(data) {
									selector.options.selectedLotteryIds.push(lottery.id);
									controller.lotteries.splice(0, 0, lottery);
									controller.render();
								}).fail(function(error) {
									$input.prop("checked", false);
									Helper.alert(error);
								});
							} else {
								RelationService.unbind(sourceType, sourceId, 'LOTTERY', lotteryIds).done(function(data) {
									selector.options.selectedLotteryIds.remove(lottery.id);
									var unbindId = lottery.id;
									var index = controller.lotteries.indexOfAttr("id", unbindId);
									controller.lotteries.splice(index, 1);
									controller.render();
								}).fail(function(error) {
									$input.prop("checked", false);
									Helper.alert(error);
								});
							}
						}
					});
				});
			},
			// 开启关闭抽奖
			switch: function() {
				var _input = this;
				var lotteryId = _input.attr("data-value");
				var checked = _input.prop("checked");
				LotteryService.updateState(lotteryId, checked ? 'OPEN' : 'CLOSED').done(function(data) {
					Helper.successToast(checked ? "抽奖已开启！" : "抽奖已关闭！");
					if (checked) {
						_input.prop("checked", true);
					} else {
						_input.removeAttr("checked");
					}
				}).fail(function(error) {
					Helper.alert(error);
				});
			},
			// 移除绑定
			remove: function() {
				var _btn = this;
				var lotteryId = _btn.attr("data-value");

				Helper.confirm("确定解除该抽奖关联？", {}, function() {
					Helper.begin(_btn);
					RelationService.unbind(sourceType, sourceId, 'LOTTERY', lotteryId).done(function(data) {
						var index = controller.lotteries.indexOfAttr("id", lotteryId);
						controller.lotteries.splice(index, 1);
						controller.render();
					}).fail(function(error) {
						Helper.alert(error);
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
		sourceType = Helper.param.hash('sourceType').toUpperCase();
		sourceId = Helper.param.hash('sourceId');

		RelationService.getList(sourceType, sourceId, 'LOTTERY').done(function(data) {
			controller.lotteries = data.result;
			controller.render();
		}).fail(function(error) {
			Helper.alert(error);
		}).always(function() {
			Helper.execute(controller.callback);
		});
	};

	Controller.prototype.render = function() {
		var controller = this;
		Helper.globalRender(template(controller.templateUrl, {
			sourceId: sourceId,
			sourceType: sourceType,
			backURL: makeRedirectURL(),
			lotteries: controller.lotteries
		}));
	};

	function makeRedirectURL() {
		var from = Helper.param.search('from') || "edit";
		if (sourceType == "WALL") {
			if (from == "lucky") {
				return "#wall/" + sourceId + "/lottery";
			} else if (from == "vote") {
				return "#vote/relation/Wall/" + sourceId + "/list?from=lottery";
			} else {
				return '#' + sourceType.toLowerCase() + '/' + sourceId + '/' + from;
			}
		}
		return '#' + sourceType.toLowerCase() + '/' + sourceId + '/' + from;
	}

	module.exports = Controller;
});