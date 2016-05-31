// 投票选择器
define(function(require, exports, module) {
	// 容器模板
	var boxTemp = "app/templates/public/vote-selector/box";
	// 内容模板
	var contentTemp = "app/templates/public/vote-selector/list";

	var Helper = require("helper");
	var template = require("template");
	var VoteService = require('VoteService');

	var orgId = App.organization.info.id;

	var Votes, VoteCount, Index, Options;

	var Selector = function(options) {
		Index = 0;
		Votes = [];
		Options = $.extend({
			limit: 10,
			title: "关联投票",
			keyword: '',
			max: -1, // 最多关联数量，-1表示无穷
			selectedVoteIds: [],
			actions: {
				'.btn-more': {
					event: 'click',
					fnc: loadMore
				},
				'input[name=vote]': {
					event: 'click',
					fnc: bindVote,
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

		getRemoteVotes(skip, Options.limit, Options.keyword, success, error);

		function success(data) {
			VoteCount = data.result.total;
			var votes = data.result.data;
			checkSelected(selector, votes);

			Votes = Votes.concat(votes);

			$("#VOTESCONTAINER").append(template(contentTemp, {
				votes: votes,
				skip: skip
			}));

			updateSelectorTips(selector);

			Index++;
		}

		function error(error) {
			Helper.alert(error);
		}
	};

	// 更新选择器周边信息
	function updateSelectorTips(selector) {
		// 更多按钮
		var complate = Votes.length >= VoteCount;
		selector.box.find(".footer")[complate ? "addClass" : "removeClass"]("complate");

		// 投票数量
		selector.box.find("#VoteCount").text("已加载 " + Votes.length + " / " + VoteCount);
	};

	// 加载更多
	function loadMore(selector) {
		var btn = $(this);
		var skip = Index * Options.limit;

		Helper.begin(btn);
		getRemoteVotes(skip, Options.limit, Options.keyword, success, error, done);

		function success(data) {
			Index++;
			VoteCount = data.result.total;
			var votes = data.result.data;
			checkSelected(selector, votes);

			Votes = Votes.concat(votes);

			$("#VOTESCONTAINER").append(template(contentTemp, {
				votes: votes,
				skip: skip
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

	// 选择
	function bindVote(selector) {
		var options = selector.options;
		var $input = $(this);
		var checked = $(this).prop("checked");

		if (checked && options.max != -1 && options.max <= options.selectedVoteIds.length) {
			$input.prop("checked", false);
			return Helper.alert("最多能关联 " + options.max + " 个投票！");
		}

		var voteId = $(this).val();
		var index = Votes.indexOfByAttr("id", voteId);
		if (index == -1) {
			return Helper.alert("内部数据错误！");
		}
		var vote = Votes[index];

		Options.change && $.isFunction(Options.change) && Options.change.call($(this), selector, checked, vote);
	};

	// 搜索
	function search(selector) {
		Options.keyword = selector.box.find(".input-search").val();
		var btn = $(this);
		Helper.begin(btn);
		getRemoteVotes(0, Options.limit, Options.keyword, success, error, done);

		function success(data) {
			Index = 1;
			Votes = [];
			VoteCount = data.result.total;
			var votes = data.result.data;
			checkSelected(selector, votes);
			Votes = Votes.concat(votes);
			$("#VOTESCONTAINER").html(template(contentTemp, {
				votes: votes,
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

	// 获取远程投票数据
	function getRemoteVotes(skip, limit, keyword, success, error, done) {
		VoteService.getList({
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
	function checkSelected(selector, votes) {
		$(votes).each(function(idx, vote) {
			vote.checked = Options.selectedVoteIds.indexOf(vote.id) != -1;
		});
	};

	module.exports = Selector;
});