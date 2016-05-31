define(function(require, exports, module) {
	var baseController = require('baseController');
	var bC = new baseController();
	var Helper = require("helper");
	var template = require('template');
	var TicketService = require("TicketService");
	var RelationService = require("RelationService");

	var orgId = Application.organization.id;
	var Tickets;

	var Controller = function() {
		var controller = this;
		controller.namespace = "ticket.relation";
		controller.actions = {
			// 添加电子票
			addTicket: function() {
				Helper.alert("<p>新建电子票后，请手动关联。</p><p>自动关联功能正在奋力开发中。</p>", function() {
					Helper.go("ticket/add/edit");
				});
			},
			// 关联电子票
			bindTicket: function() {
				require.async("TicketSelector", function(TicketSelector) {
					TicketSelector({
						title: "添加电子票关联",

						// scripts/public/array.js
						selectedTicketIds: Tickets.arrayOfAttr("id"),
						change: function(checked, ticket, $input) {
							var ticketSelector = this;
							var ticketIds = [ticket.id].join(',');
							if (checked) {
								bind(ticketIds, reRender, function(errorMsg) {
									// add error
									$input.prop("checked", false);
									Helper.errorToast(errorMsg);
								});
							} else {
								unbind(ticketIds, reRender, function(errorMsg) {
									// remove error
									$input.prop("checked", true);
									Helper.errorToast(errorMsg);
								});
							}

							// 重新请求数据并渲染列表
							function reRender(data) {
								var message = "电子票【" + ticket.name + "】" + (checked ? "" : "取消") + "关联成功";
								Helper.successToast(message);
								renderTickets(function(data) {
									Helper.globalRender(template(controller.templateUrl, data));
								});
							}
						}
					});
				});
			},
			// 开启关闭电子票
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
			// 移除绑定
			remove: function() {
				var _btn = this;
				var ticketId = _btn.attr("data-value");
				Helper.confirm("确定解除该电子票关联？", {}, function() {
					Helper.begin(_btn);
					var ticketIds = [ticketId].join('');
					unbind(ticketIds, function() {
						renderTickets(function(data) {
							Helper.globalRender(template(controller.templateUrl, data));
						}, null);
					}, function() {
						Helper.errorToast(error);
					}, function() {
						Helper.end(_btn);
					});
				});
			}
		};
	};
	bC.extend(Controller);

	Controller.prototype.init = function() {
		var controller = this;
		sourceType = Helper.param.hash('sourceType').toUpperCase();
		sourceId = Helper.param.hash('sourceId');

		Tickets = [];
		renderTickets(function(data) {
			Helper.globalRender(template(controller.templateUrl, data));
		}, null, controller.callback);
	};

	// 渲染电子票
	function renderTickets(success, error, done) {
		RelationService.getList(sourceType, sourceId, 'TICKET').done(function(data) {
			Tickets = data.result;
			var count = Tickets.length;

			var result = {
				tickets: Tickets,
				count: count
			};

			Helper.execute(success, result);
		}).fail(function(errorMsg) {
			Helper.execute(error, errorMsg);
			Helper.alert(errorMsg);
		}).always(function() {
			Helper.execute(done);
		});
	};

	// 添加关联
	function bind(ticketIds, success, error, done) {
		RelationService.bind(sourceType, sourceId, 'TICKET', ticketIds).done(function(data) {
			Helper.execute(success, data);
		}).fail(function(errorMsg) {
			Helper.execute(error, errorMsg);
		}).always(function() {
			Helper.execute(done);
		});
	};

	// 移除关联
	function unbind(ticketIds, success, error, done) {
		RelationService.unbind(sourceType, sourceId, 'TICKET', ticketIds).done(function(data) {
			Helper.execute(success, data);
		}).fail(function(errorMsg) {
			Helper.execute(error, errorMsg);
		}).always(function() {
			Helper.execute(done);
		});
	};

	module.exports = Controller;
});