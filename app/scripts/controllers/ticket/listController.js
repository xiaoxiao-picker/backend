define(function(require, exports, module) {
	var Helper = require("helper");
	var baseController = require('baseController');
	var bC = new baseController();
	var template = require('template');
	var TicketService = require('TicketService');
	var Pagination = require('lib.Pagination');

	var page, limit, keyword;
	var orgId = Application.organization.id;

	var Controller = function() {
		var controller = this;
		controller.namespace = "ticket.list";
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
				var _input = this;
				var ticketId = _input.attr("data-value");
				var checked = _input.prop("checked");
				TicketService[checked ? 'open' : 'close'](ticketId).done(function(data) {
					Helper.successToast(checked ? "电子票已开启！" : "电子票已关闭！");
					if (checked) {
						_input.prop("checked", true);
					} else {
						_input.removeAttr("checked");
					}
				}).fail(function(error) {
					Helper.alert(error);
				});
			},
			remove: function() {
				var _btn = this;
				var ticketId = _btn.attr("data-value");
				Helper.confirm("确定删除该电子票？", function() {
					Helper.begin(_btn);
					TicketService.remove(ticketId).done(function(data) {
						Helper.successToast("删除成功！");
						_btn.parents("tr").slideUp(200, function() {
							$(this).remove();
							controller.render();
						});
					}).fail(function(error) {
						Helper.alert(error);
					}).always(function() {
						Helper.end(_btn);
					});
				});
			}
		}
	};

	bC.extend(Controller);
	Controller.prototype.init = function() {
		page = +Helper.param.search('page') || 1;
		limit = +Helper.param.search('limit') || 10;
		keyword = "";
		this.render(this.callback);
	};

	Controller.prototype.render = function(callback) {
		var controller = this;
		var skip = (page - 1) * limit;
		TicketService.getList({
			organizationId: orgId,
			skip: skip,
			limit: limit,
			keyword: keyword
		}).done(function(data) {
			var tickets = data.result.data;
			var total = data.result.total;
			var pagination = Helper.pagination(total, limit, page);
			Helper.globalRender(template(controller.templateUrl, {
				tickets: tickets,
				count: total,
				keyword: keyword,
				pagination: pagination
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