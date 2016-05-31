define(function(require, exports, module) {
	var baseController = require('baseController');
	var bC = new baseController();
	var template = require('template');
	var ArticleService = require('ArticleService');
	var Helper = require("helper");
	var Pagination = require('lib.Pagination');

	var orgId, skip, state, page, limit;
	var keywords;

	var Controller = function() {
		var controller = this;
		controller.namespace = "articles";
		controller.actions = {
			selectCategory: function() {
				var $input = $(this);
				var offset = $(this).offset();
				var top = offset.top + $(this).height();
				var left = offset.left;
				var zIndex = $(this).attr("data-zIndex") || 500;

				require.async("lib.CategorySelector", function(CategorySelector) {
					CategorySelector("ARTICLE", {
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
			remove: function() {
				var _btn = this;
				var articleId = _btn.attr("data-value");
				Helper.confirm("确定彻底删除该文章？", {}, function() {
					Helper.begin(_btn);
					ArticleService.remove(orgId, articleId).done(function(data) {
						controller.render();
					}).fail(function(error) {
						Helper.alert(error);
						Helper.end(_btn);
					});
				});
			},
			archive: function() {
				var _btn = this;
				var articleId = _btn.attr("data-value");
				Helper.confirm("下线后文章将进入草稿箱？", {}, function() {
					articleHandle('UNPUBLISHED', articleId, _btn, function() {
						controller.render();
					});
				});
			},
			moveToDustbin: function() {
				var _btn = this;
				var articleId = _btn.attr("data-value");
				Helper.confirm("确定删除？", {}, function() {
					articleHandle('RUBBISH', articleId, _btn, function() {
						controller.render();
					});
				});
			},
			//放回原处
			recover: function() {
				var _btn = this;
				var articleId = _btn.attr("data-value");
				Helper.confirm("放回原处的文章将进入草稿箱？", {}, function() {
					articleHandle('UNPUBLISHED', articleId, _btn, function() {
						controller.render();
					});
				});
			}
		};
	};
	bC.extend(Controller);
	Controller.prototype.init = function() {
		var controller = this;

		keywords = {};

		orgId = App.organization.info.id;
		state = Helper.param.search('state') || "PUBLISHED";
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
		ArticleService.list(orgId, state, skip, limit, keywords.categoryId, keywords.keyword).done(function(data) {
			var articles = data.result.data;
			var total = data.result.total;
			$("#Count").text(total);

			// 如果当前页数据为空，且不为第一页，则取前一页数据
			if (page > 1 && articles.length == 0) {
				page = Helper.pagecount(total, limit);
				controller.render();
				return;
			}
			$("#ArticlesContainer").html(template("app/templates/article/list-option", {
				articles: articles,
				total: total,
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
	}

	/**
	 *	发布、下线、回收站、退回原处
	 */
	function articleHandle(state, articleId, btn, successFnc) {
		Helper.begin(btn);
		ArticleService.updateState(orgId, articleId, state).done(function(data) {
			successFnc();
		}).fail(function(error) {
			Helper.alert(error);
		}).always(function() {
			Helper.end(btn);
		});
	}

	module.exports = Controller;
});