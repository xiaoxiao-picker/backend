define(function(require, exports, module) {
	var baseController = require('baseController');
	var bC = new baseController();

	var ArticleService = require('ArticleService');
	var OrganizationService = require('OrganizationService');

	var template = require('template');
	var Helper = require("helper");

	var KeywordModel = require('KeywordModel');

	var orgId, skip, page, limit, from, targetId;

	var Controller = function() {
		var controller = this;
		controller.namespace = "article.categories";
		controller.actions = {
			create: create(controller),
			update: update(controller),
			remove: function() {
				var _btn = this;
				var categoryId = _btn.attr("data-value");

				if (categoryId) {
					Helper.confirm("删除该分类会将该分类中的文章移至未分类，仍确认删除？", {}, function() {
						Helper.begin(_btn);
						ArticleService.category.remove(orgId, categoryId).done(function(data) {
							_btn.parents("tr").remove();
							controller.render();
						}).fail(function(error) {
							Helper.end(_btn);
							Helper.errorToast(error);
						});
					});
				} else {
					Helper.alert("该分类为关联组织的文章分类，不能进行删除!");
					return;
				}
			}
		};
	};
	bC.extend(Controller);
	Controller.prototype.init = function(templateName, fn) {
		from = Helper.param.search('from') ? Helper.param.search('from') : "list";
		targetId = Helper.param.search('targetId') ? Helper.param.search('targetId') : "";
		orgId = App.organization.info.id;
		this.render();
	};

	Controller.prototype.render = function() {
		var controller = this;
		App.organization.getArticleCategories(true).done(function(data) {
			Helper.globalRender(template(controller.templateUrl, {
				result: App.organization.articleCategories,
				from: from,
				targetId: targetId
			}));
		}).fail(function(error) {
			Helper.alert(error);
		}).always(function() {
			Helper.execute(controller.callback);
		});
	};

	function create(controller) {
		return function() {
			Helper.singleInputModal({
				title: '文章分类管理',
				name: "文章分类名称",
				action: function(modal) {
					var _btn = $(this);
					var _input = modal.box.find('.input');
					var categoryName = _input.val();
					var categoryId = _btn.attr("data-value");

					if (Helper.validation.isEmpty(categoryName)) {
						Helper.errorToast("分类名称不能为空");
						return;
					}

					Helper.begin(_btn);
					ArticleService.category.add(orgId, categoryName).done(function(data) {
						Helper.successToast("添加成功");

						//默认添加关键词回复
						KeywordModel.custom.article(data.result, categoryName);

						modal.close();
						controller.render();
					}).fail(function(error) {
						Helper.errorToast(error);
						Helper.end(_btn);
					});
				}
			});
		};
	}

	function update(controller) {
		return function() {
			var _btn = this;
			var categoryId = _btn.attr("data-value");
			var categoryName = _btn.attr("data-name");
			Helper.singleInputModal({
				title: '文章分类管理',
				id: categoryId,
				name: "文章分类名称",
				value: categoryName,
				action: function(modal) {
					var _btn = $(this);
					var _input = modal.box.find('.input');
					var categoryName = _input.val();
					var categoryId = _btn.attr("data-value");

					if (Helper.validation.isEmpty(categoryName)) {
						Helper.errorToast("分类名称不能为空");
						return;
					}

					Helper.begin(_btn);
					ArticleService.category.update(orgId, categoryId, categoryName).done(function(data) {
						Helper.successToast("修改成功，请手动修改关键字自动回复。");
						modal.close();
						controller.render();
					}).fail(function(error) {
						Helper.errorToast(error);
					}).always(function() {
						Helper.end(_btn);
					});
				}
			});
		};
	}

	module.exports = Controller;
});