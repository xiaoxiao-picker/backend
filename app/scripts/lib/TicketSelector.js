// 电子票选择器
define(function(require, exports, module) {
	// 容器模板
	var boxTemp = "app/templates/public/ticket-selector/box";
	// 内容模板
	var contentTemp = "app/templates/public/ticket-selector/list";

	var Helper = require("helper");
	var template = require("template");
	var TicketService = require('TicketService');
	template.helper("makedate", Helper.makedate);

	var orgId = App.organization.info.id;

	var Tickets, TicketCount, Index, Options;

	var Selector = function(options) {
		Index = 0;
		Tickets = [];
		Options = $.extend({
			limit: 10,
			title: "关联投票",
			keyword: '',
			selectedTicketIds: [],
			actions: {
				'.btn-more': {
					event: 'click',
					fnc: loadMore
				},
				'input[name=ticket]': {
					event: 'click',
					fnc: bindTicket,
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

		getBindTickets(skip, Options.limit, Options.keyword, success, function(error) {
			Helper.alert(error);
		});

		function success(data) {
			TicketCount = data.result.total;
			var tickets = data.result.data;
			checkSelected(selector, tickets);

			Tickets = Tickets.concat(tickets);

			$("#VOTESCONTAINER").append(template(contentTemp, {
				tickets: tickets,
				skip: skip
			}));

			updateSelectorTips(selector);

			Index++;
		}
	};

	// 更新选择器周边信息
	function updateSelectorTips(selector) {
		// 更多按钮
		var complate = Tickets.length >= TicketCount;
		selector.box.find(".footer")[complate ? "addClass" : "removeClass"]("complate");

		// 电子票数量
		selector.box.find("#TicketCount").text("已加载 " + Tickets.length + " / " + TicketCount);
	};

	// 加载更多
	function loadMore(selector) {
		var btn = $(this);
		var skip = Index * Options.limit;

		Helper.begin(btn);
		getBindTickets(skip, Options.limit, Options.keyword, success, error, done);

		function success(data) {
			Index++;
			TicketCount = data.result.total;
			var tickets = data.result.data;
			checkSelected(selector, tickets);

			Tickets = Tickets.concat(tickets);

			$("#VOTESCONTAINER").append(template(contentTemp, {
				tickets: tickets,
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
	function bindTicket(selector) {
		var checked = $(this).prop("checked");
		var ticketId = $(this).val();
		var index = Tickets.indexOfByAttr("id", ticketId);
		if (index == -1) {
			Helper.alert("内部数据错误！");
			return;
		}
		var ticket = Tickets[index];

		Options.change && $.isFunction(Options.change) && Options.change.call(selector, checked, ticket, $(this));
	};

	// 搜索
	function search(selector) {
		Options.keyword = selector.box.find(".input-search").val();
		var btn = $(this);
		Helper.begin(btn);
		getBindTickets(0, Options.limit, Options.keyword, success, error, done);

		function success(data) {
			Index = 1;
			Tickets = [];
			TicketCount = data.result.total;
			var tickets = data.result.data;
			checkSelected(selector, tickets);
			Tickets = Tickets.concat(tickets);
			$("#VOTESCONTAINER").html(template(contentTemp, {
				tickets: tickets,
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
	function getBindTickets(skip, limit, keyword, success, error, done) {
		TicketService.getList({
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
	function checkSelected(selector, tickets) {
		$(tickets).each(function(idx, ticket) {
			ticket.checked = Options.selectedTicketIds.indexOf(ticket.id) != -1;
		});
	};

	module.exports = Selector;
});