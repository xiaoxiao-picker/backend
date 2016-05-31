define(function(require, exports, module) {
	var baseController = require('scripts/baseController');
	var template = require('template');
	var bC = new baseController();
	var EventService = require("EventService");
	var Helper = require("helper");
	var Pagination = require('lib.Pagination');

	var orgId, limit, page, state;

	var keywords;

	var Controller = function() {
		var controller = this;
		controller.namespace = "event.list";
		controller.actions = {
			selectCategory: function() {
				var $input = $(this);
				var offset = $(this).offset();
				var top = offset.top + $(this).height();
				var left = offset.left;
				var zIndex = $(this).attr("data-zIndex") || 500;

				require.async("lib.CategorySelector", function(CategorySelector) {
					CategorySelector("EVENT", {
						top: top,
						left: left,
						zIndex: zIndex,
						select: function(category) {
							this.destroy();
							$input.val(category.name);
							keywords.categoryId = category.id;
						}
					});
				});
			},
			search: function() {
				var btn = this;
				keywords.keyword = btn.parents(".search-box").find(".keyword-name").val();
				Helper.begin(btn);
				page = 1;
				controller.render(function() {
					Helper.end(btn);
				});
			},
			//活动下线
			archive: function() {
				var _btn = this;
				var eventId = _btn.attr("data-value");

				Helper.confirm("下线后活动将会移至已下线的活动，仍继续？", {}, function() {
					eventHandle('ARCHIVED', eventId, _btn, function() {
						controller.render();
					});
				});

			},
			moveToDustbin: function() {
				var _btn = this;
				var eventId = _btn.attr("data-value");

				Helper.confirm("确定删除？", {}, function() {
					eventHandle('RUBBISH', eventId, _btn, function() {
						controller.render();
					});
				});
			},
			//放回原处
			recover: function() {
				var _btn = this;
				var eventId = _btn.attr("data-value");

				Helper.confirm("放回原处的活动将会移至已下线活动，仍继续？", {}, function() {
					eventHandle('ARCHIVED', eventId, _btn, function() {
						controller.render();
					});
				});
			},
			//活动删除
			remove: function() {
				var _btn = this,
					eventId = _btn.attr("data-value");

				Helper.confirm("彻底删除此活动？", {}, function() {
					Helper.begin(_btn);
					EventService.remove(orgId, eventId).done(function(data) {
						controller.render();
					}).fail(function(error) {
						Helper.alert(error);
						Helper.end(_btn);
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

		keywords = {};

		orgId = App.organization.info.id;
		state = Helper.param.search('state') || 'PUBLISHED';
		page = +Helper.param.search('page') || 1;
		limit = +Helper.param.search('limit') || 10;

		Helper.globalRender(template(controller.templateUrl, {
			state: state
		}));
		controller.render(controller.callback);
	};


	Controller.prototype.render = function(callback) {
		var controller = this;
		var skip = (page - 1) * limit;
		EventService.list(orgId, state, skip, limit, keywords.categoryId, keywords.keyword).done(function(data) {
			var events = data.result.data;
			var total = data.result.total;

			$("#Count").text(total);

			// 如果当前页数据为空，且不为第一页，则取前一页数据
			if (page > 1 && events.length == 0) {
				page = Helper.pagecount(total, limit);
				controller.render();
				return;
			}
			$("#EventsContainer").html(template("app/templates/event/list-option", {
				events: events,
				total: data.result.total,
				state: state
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

	/**
	 *	发布、下线、回收站、退回原处
	 */
	function eventHandle(state, eventId, btn, successFnc) {
		Helper.begin(btn);
		EventService.changeState(eventId, state).done(function(data) {
			successFnc();
		}).fail(function(error) {
			Helper.alert(error);
		}).always(function() {
			Helper.end(btn);
		});
	}

	module.exports = Controller;
});