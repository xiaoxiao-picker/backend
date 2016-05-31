// 抽奖选择器
define(function(require, exports, module) {
	// 容器模板
	var boxTemp = "app/templates/public/lottery-selector/box";
	// 内容模板
	var contentTemp = "app/templates/public/lottery-selector/list";

	var Helper = require("helper");
	var template = require("template");
	var LotteryService = require('LotteryService');
	var RelationService = require('RelationService');

	var orgId = App.organization.info.id;

	var Lotteries, LotteryCount, Index, Options;

	var Selector = function(options) {
		Index = 0;
		Lotteries = [];
		Options = $.extend({
			limit: 10,
			title: "关联抽奖",
			keyword: '',
			selectedLotteryIds: [],
			max: -1,
			actions: {
				'.btn-more': {
					event: 'click',
					fnc: loadMore
				},
				'input[name=lottery]': {
					event: 'click',
					fnc: bindLottery,
					prevent: false
				},
				'.btn-search': {
					event: 'click',
					fnc: search
				}
			}
		}, options);

		var modal = Helper.modal(Options);
		render(modal);

		return modal;
	};

	function render(selector) {
		var skip = Index * Options.limit;

		selector.html(template(boxTemp, {
			title: Options.title
		}));

		getLotteries(skip, Options.limit, Options.keyword, success, function(error) {
			Helper.alert(error);
		});

		function success(data) {
			LotteryCount = data.result.total;
			Lotteries = data.result.data;
			checkSelected(selector, Lotteries);

			$("#LOTTERYCONTAINER").append(template(contentTemp, {
				lotteries: Lotteries,
				skip: skip
			}));

			updateSelectorTips(selector);

			Index++;
		}
	};

	// 更新选择器周边信息
	function updateSelectorTips(selector) {
		// 更多按钮
		var complate = Lotteries.length >= LotteryCount;
		selector.box.find(".footer")[complate ? "addClass" : "removeClass"]("complate");

		// 数量
		selector.box.find("#LotteryCount").text("已加载 " + Lotteries.length + " / " + LotteryCount);
	};

	// 加载更多
	function loadMore(selector) {
		var btn = $(this);
		var skip = Index * Options.limit;

		Helper.begin(btn);
		getLotteries(skip, Options.limit, Options.keyword, success, error, done);

		function success(data) {
			Index++;
			LotteryCount = data.result.total;
			Lotteries = data.result.data;
			checkSelected(selector, Lotteries);

			$("#LOTTERYCONTAINER").append(template(contentTemp, {
				lotteries: Lotteries,
				skip: skip
			}));

			updateSelectorTips(selector);
		}

		function error(errorMsg) {

		}

		function done() {
			Helper.end(btn);
		}
	}

	// 选择
	function bindLottery(selector) {
		var options = selector.options;
		var $input = $(this);
		var checked = $(this).prop("checked");

		if (checked && options.max != -1 && options.max <= options.selectedLotteryIds.length) {
			$input.prop("checked", false);
			return Helper.alert("最多能关联 " + options.max + " 个抽奖！");
		}

		var lotteryId = $(this).val();
		var index = Lotteries.indexOfByAttr("id", lotteryId);
		if (index == -1) {
			Helper.alert("内部数据错误！");
			return;
		}
		var lottery = Lotteries[index];

		Options.change && $.isFunction(Options.change) && Options.change.call(selector, checked, lottery, $(this));
	};

	// 搜索
	function search(selector) {
		Options.keyword = selector.box.find(".input-search").val();
		var btn = $(this);
		Helper.begin(btn);
		getLotteries(0, Options.limit, Options.keyword, success, error, done);

		function success(data) {
			Index = 1;
			Lotteries = [];
			LotteryCount = data.result.total;
			Lotteries = data.result.data;
			checkSelected(selector, Lotteries);

			$("#LOTTERYCONTAINER").html(template(contentTemp, {
				lotteries: Lotteries,
				skip: 0
			}));

			updateSelectorTips(selector);
		}

		function error(error) {
			Helper.alert(error);
		}

		function done() {
			Helper.end(btn);
		}
	}

	// 获取远程抽奖数据
	function getLotteries(skip, limit, keyword, success, error, done) {
		LotteryService.getList({
			organizationId: orgId,
			skip: skip,
			limit: limit,
			keyword: keyword
		}).done(function(data) {
			Helper.execute(success, data);
		}).fail(function(errorMsg) {
			Helper.execute(error, errorMsg);
		}).always(function() {
			Helper.execute(done);
		});
	};

	// 判断投票是否已被选中
	function checkSelected(selector, lotteries) {
		$(lotteries).each(function(idx, lottery) {
			lottery.checked = Options.selectedLotteryIds.indexOf(lottery.id) != -1;
		});
	};

	module.exports = Selector;
});