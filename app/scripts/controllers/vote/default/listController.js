define(function(require, exports, module) {
	var Helper = require("helper");
	var baseController = require('baseController');
	var bC = new baseController();
	var template = require('template');
	var VoteService = require('VoteService');
	var Pagination = require('lib.Pagination');

	var orgId = Application.organization.id;
	var page, limit, keyword;

	var Controller = function() {
		var controller = this;
		controller.namespace = "vote.list";
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
				var voteId = _input.attr("data-value");
				var checked = _input.prop("checked");
				VoteService[checked ? "open" : "close"](voteId).done(function(data) {
					Helper.successToast(checked ? "投票已开启！" : "投票已关闭！");
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
				var voteId = _btn.attr("data-value");
				Helper.confirm("确定删除该投票？", function() {
					Helper.begin(_btn);
					VoteService.remove(voteId).done(function(data) {
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
			},
			// 查看统计
			checkStatistics: function() {
				var voteId = this.attr("data-vote-id");
				require.async("scripts/controllers/vote/statistics", function(VoteStatistics) {
					VoteStatistics(voteId);
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
		var templateUrl = this.templateUrl;
		var skip = (page - 1) * limit;
		VoteService.getList({
			organizationId: orgId,
			skip: skip,
			limit: limit,
			keyword: keyword,
			type: "DEFAULT"
		}).done(function(data) {
			var votes = data.result.data;
			var total = data.result.total;
			if (votes.length == 0 && total > 0 && page > 1) {
				page = 1;
				controller.render(callback);
				return;
			}
			var pagination = Helper.pagination(total, limit, page);
			Helper.globalRender(template(templateUrl, {
				votes: votes,
				count: total,
				keyword: keyword,
				pagination: pagination,
				organization: Application.organization
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