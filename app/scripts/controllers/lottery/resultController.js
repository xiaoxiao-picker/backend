define(function(require, exports, module) {
	var baseController = require('scripts/baseController');
	var template = require('template');
	var bC = new baseController();
	var LotteryService = require("LotteryService");
	var Helper = require("helper");

	var orgId, lotteryId;

	var Controller = function() {
		var controller = this;
		controller.namespace = "lottery.result";
		controller.actions = {

		};
	};
	bC.extend(Controller);
	/**
	 * 初始化变量，渲染模板
	 */
	Controller.prototype.init = function() {
		orgId = App.organization.info.id;
		lotteryId = Helper.param.hash('lotteryId');

		this.render();
	};

	Controller.prototype.render = function() {
		var controller = this;
		var callback = controller.callback;
		var templateUrl = controller.templateUrl;
		
		LotteryService.award.result(lotteryId).done(function(data) {
			var awards = makeAwards(data.result);
			var total = awards.length;
			Helper.globalRender(template(templateUrl, {
				lotteryId: lotteryId,
				awards: awards,
				total: total,
				pagination: Helper.pagination(total, 1000, 1)
			}));
		}).fail(function(error) {
			Helper.alert(error);
		}).always(function() {
			Helper.execute(callback);
		});
	};

	function makeAwards(awards) {
		var probability = 0;
		$.each(awards, function(idx, award) {
			if (Helper.validation.isEmptyNull(award.probability)) {
				award.probability = 100 - probability;
				return false;
			};
			award.probability *= 100;
			probability += award.probability;
		});

		return awards;
	};

	module.exports = Controller;
});