define(function(require, exports, module) {
	var baseController = require('baseController');
	var bC = new baseController();
	var NoticeService = require('NoticeService');
	var Helper = require("helper");
	var template = require('template');
	var Pagination = require('lib.Pagination');

	var orgId = Application.organization.id;
	var limit, page, state, keyword;

	var Controller = function() {
		var controller = this;
		controller.namespace = "notice.list";
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
			remove: function() {
				var btn = this;
				var noticeId = btn.attr("data-value");
				Helper.confirm("确定删除该公告？", {}, function() {
					Helper.begin(btn);
					NoticeService.remove(orgId, noticeId).done(function(data) {
						controller.render();
					}).fail(function(error) {
						Helper.alert(error);
					}).always(function() {
						Helper.end(btn);
					});
				});
			},
			send: function() {
				if (smsCount < 0) {
					Helper.alert('亲：您本周短信余额已使用完了呦！');
					return;
				}
				var btn = this;
				var noticeId = btn.attr("data-value");

				Helper.begin(btn);
				NoticeService.send(noticeId).done(function(data) {
					controller.render();
				}).fail(function(error) {
					Helper.alert(error);
				}).always(function() {
					Helper.end(btn);
				});
			}
		}
	};


	bC.extend(Controller);
	Controller.prototype.init = function() {
		page = +Helper.param.search('page') || 1;
		limit = +Helper.param.search('limit') || 10;
		keyword = "";
		state = Helper.param.search('state') || "PUBLISHED";
		this.render(this.callback, true);
	};

	Controller.prototype.render = function(callback, refreshMessageRemain) {
		var controller = this;
		var skip = (page - 1) * limit;
		var notices;
		var count;

		var getMessageRemain = NoticeService.getSmsRemain(orgId).done(function(data) {
			smsCount = data.result;
		});

		var getNoticeList = NoticeService.getList({
			orgId: orgId,
			skip: skip,
			limit: limit,
			state: state,
			keyword: keyword
		}).done(function(data) {
			notices = data.result.data;
			count = data.result.total;
		});

		(refreshMessageRemain ? $.when(getMessageRemain, getNoticeList) : $.when(getNoticeList)).done(function(data) {
			Helper.globalRender(template(controller.templateUrl, {
				smsCount: smsCount,
				count: count,
				notices: notices,
				pagination: Helper.pagination(count, limit, page),
				state: state,
				keyword: keyword
			}));

			Pagination(count, limit, page, {
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