define(function(require, exports, module) {
	var baseController = require('baseController');
	var bC = new baseController();

	var ProposalService = require('ProposalService');
	var OrganizationService = require('OrganizationService');

	var template = require('template');
	var Helper = require("helper");

	var KeywordModel = require('KeywordModel');

	var orgId = Application.organization.id;

	var Controller = function() {
		var controller = this;
		controller.namespace = "proposal.categories";
		controller.actions = {
			create: create(controller),
			update: update(controller),
			remove: function() {
				var _btn = this;
				var categoryId = _btn.attr("data-value");
				Helper.confirm("删除该分类会将该分类中的提案移至未分类，仍确认删除？", function() {
					Helper.begin(_btn);
					ProposalService.category.remove(orgId, categoryId).done(function(data) {
						_btn.parents("tr").remove();
						controller.render();
					}).fail(function(error) {
						Helper.alert(error);
					}).always(function() {
						Helper.end(_btn);
					});
				});
			}
		};
	};

	bC.extend(Controller);

	Controller.prototype.init = function() {
		this.render();
	};

	Controller.prototype.render = function() {
		var controller = this;
		Application.organization.getProposalCategories(true).done(function(data) {
			Helper.globalRender(template(controller.templateUrl, {
				categories: Application.organization.proposalCategories
			}));
		}).fail(function(error) {
			Helper.alert(error);
			Helper.globalRender(template(controller.templateUrl, {
				categories: []
			}));
		}).always(function() {
			Helper.execute(controller.callback);
		});
	};

	function create(controller) {
		return function() {
			Helper.singleInputModal({
				title: '提案分类管理',
				name: "提案分类名称",
				placeholder: "请输入分类名称",
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
					ProposalService.category.add(orgId, categoryName).done(function(data) {
						var categoryId = data.result;
						Helper.successToast("添加成功");

						//默认添加关键词回复
						KeywordModel.custom.proposal(categoryId, categoryName);

						modal.close();
						controller.render();
					}).fail(function(error) {
						Helper.alert(error);
					}).always(function() {
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
				title: '提案分类管理',
				name: "提案分类名称",
				placeholder: "请输入分类名称",
				id: categoryId,
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
					ProposalService.category.update(orgId, categoryId, categoryName).done(function(data) {
						Helper.successToast("修改成功，请手动修改关键字自动回复。");
						modal.close();
						controller.render();
					}).fail(function(error) {
						Helper.alert(error);
					}).always(function() {
						Helper.end(_btn);
					});
				}
			});
		};
	}

	module.exports = Controller;
});