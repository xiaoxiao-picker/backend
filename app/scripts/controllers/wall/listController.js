/**
 * 微信墙列表
 */
define(function(require, exports, module) {
	var Helper = require("helper");
	var baseController = require('baseController');
	var bC = new baseController();
	var template = require('template');
	var WallService = require('WallService');
	var Pagination = require('lib.Pagination');

	var keyword, limit, page;
	var orgId = Application.organization.id;

	var Controller = function() {
		var controller = this;
		controller.namespace = "wall.list";
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
			// 切换状态
			switchState: function() {
				var _input = this;
				var wallId = _input.attr("data-value");
				var checked = _input.prop("checked");
				WallService[checked ? "open" : "close"](orgId, wallId).done(function(data) {
					Helper.successToast(checked ? "上墙已开启！" : "上墙已关闭！");
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
				var btn = this;
				var wallId = btn.attr("data-value");
				var checked = btn.parents("tr").find("input[type=checkbox]").prop("checked");
				var tips = checked ? "该墙为已开启状态，删除墙后大屏幕将不能正常显示。仍删除？" : "是否确定删除该上墙？";

				Helper.confirm(tips, {}, function() {
					Helper.begin(btn);
					WallService.remove(orgId, wallId).done(function(data) {
						btn.parents("tr").slideUp(200, function() {
							$(this).remove();
							controller.render();
						});
					}).fail(function(error) {
						Helper.alert(error);
					}).always(function() {
						Helper.end(btn);
					});
				});
			}
		};
	};

	bC.extend(Controller);
	Controller.prototype.init = function() {
		keyword = "";
		page = +Helper.param.search('page') || 1;
		limit = +Helper.param.search('limit') || 10;
		this.render(this.callback);
	};

	Controller.prototype.render = function(callback) {
		var templateUrl = this.templateUrl;

		var skip = (page - 1) * limit;

		WallService.getList({
			orgId: orgId,
			skip: skip,
			limit: limit,
			keyword: keyword
		}).done(function(data) {
			var total = data.result.total;
			var walls = data.result.data;
			Helper.globalRender(template(templateUrl, {
				walls: walls,
				count: total,
				pagination: Helper.pagination(total, limit, page)
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