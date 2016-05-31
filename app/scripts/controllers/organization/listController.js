define(function(require, exports, module) {
	var baseController = require('scripts/baseController');
	var template = require('scripts/template');
	var bC = new baseController();
	var OrganizationService = require('scripts/services/OrganizationService');
	var Helper = require("scripts/public/helper");

	var tmp, callback, orgId, session, limit;

	var Categories;
	var AllRelatedOrganizations;

	var Controller = function() {
		var _controller = this;
		_controller.namespace = "organization.list";
		_controller.actions = {
			remove: function() {
				var _btn = this;
				var exhibitionId = _btn.attr("data-value");

				Helper.confirm("确认将该组织从组织风采中删除？", {}, function() {
					Helper.begin(_btn);
					OrganizationService.exhibition.remove(orgId, exhibitionId).done(function(data) {
						Helper.successToast("删除成功");
						var index = AllRelatedOrganizations.indexOfAttr("id", exhibitionId);
						AllRelatedOrganizations.splice(index, 1);
						renderAllCategories();
					}).fail(function(error) {
						Helper.alert(error);
					}).always(function() {
						Helper.end(_btn);
					});
				});
			},
			moveToCategory: function() {
				var btn = this;
				var categoryId = btn.attr("data-category-id");
				var categoryName = btn.attr("data-category-name");

				// 普通成员列表
				var organizations = AllRelatedOrganizations.arrayWidthOutObjAttrs("categoryId", [categoryId]);
				if (organizations.length == 0) {
					return Helper.errorToast("暂无其他分组的组织！");
				}
				var modal = Helper.modal({
					title: "移动组织至 [ " + categoryName + " ] 分组"
				});
				modal.html(template("app/templates/public/organization-selector", {
					organizations: organizations
				}));
				modal.addAction(".btn-save", "click", function() {
					var btn = this;
					var exhibitionIds = [];
					modal.box.find("input[name='organization']:checked").each(function(idx, input) {
						exhibitionIds.push(input.value);
					});
					if (!exhibitionIds.length) return Helper.errorToast("请选择至少一个组织！");

					Helper.begin(btn);
					OrganizationService.exhibition.updateCategory(orgId, categoryId, exhibitionIds.join(',')).done(function() {
						$(exhibitionIds).each(function(idx, exhibitionId) {
							var exhibition = AllRelatedOrganizations.objOfAttr("id", exhibitionId);
							exhibition.categoryId = categoryId;
						});
						modal.destroy();
						renderAllCategories();
					}).fail(function(error) {
						Helper.alert(error);
					}).always(function() {
						Helper.end(btn);
					});
				});
			},
			showOrgInfo: function() {
				var _btn = this;
				var relation = _btn.attr("data-relation");
				var relateId = _btn.attr("data-value");
				showOrgInfo(relation, relateId);
			}
		};
	};

	bC.extend(Controller);
	Controller.prototype.init = function(templateUrl, callback) {
		this.callback = callback;
		this.templateUrl = templateUrl;
		orgId = App.organization.info.id;
		AllRelatedOrganizations = [];
		this.render();
	};

	Controller.prototype.render = function() {
		var callback = this.callback;
		var templateUrl = this.templateUrl;
		App.organization.getExhibitionCategories().done(function() {
			Categories = App.organization.exhibitionCategories.clone();
			Categories.push({
				id: "",
				name: "未分类"
			});
			Helper.globalRender(template(templateUrl, {
				categories: Categories
			}));

			$.each(Categories, function(idx, category) {
				renderCategoryOrgs(category);
			});

		}).fail(function(error) {
			Helper.alert(error);
		}).always(function() {
			Helper.execute(callback);
		});
	}

	function renderCategoryOrgs(category) {
		OrganizationService.exhibition.getList(orgId, 0, 1000, category.id).done(function(data) {
			var orgs = data.result.data;
			$(orgs).each(function(idx, organization) {
				organization.categoryId = category.id;
				AllRelatedOrganizations.push(organization);
			});
			var count = data.result.total;
			$('#CATEGORY_' + category.id).html(template('app/templates/organization/inner-category-orgs', {
				category: category,
				orgs: orgs,
				count: count
			}));
		}).fail(function(error) {
			Helper.alert(error);
		});
	};

	function renderAllCategories() {
		$(Categories).each(function(idx, category) {
			var organizations = AllRelatedOrganizations.arrayWidthObjAttr("categoryId", category.id);
			$('#CATEGORY_' + category.id).html(template('app/templates/organization/inner-category-orgs', {
				category: category,
				orgs: organizations,
				count: organizations.length
			}));
		});
	}

	function showOrgInfo(relation, relateId) {
		if (relation == 'true') {
			require.async('OrganizationModal', function(OrganizationModal) {
				OrganizationModal(relateId, {});
			});
		} else {
			var options = {
				title: "查看组织信息",
				className: "organization-modal",
				readonly: true
			};
			var modal = Helper.modal(options);

			OrganizationService.exhibition.get(orgId, relateId).done(function(data) {
				modal.html(template("app/templates/organization/info-modal", {
					orgInfo: data.result,
					readonly: options.readonly,
					isExtend: false
				}));
			}).fail(function(error) {
				Helper.alert(error);
			});
		}
	};

	module.exports = Controller;
});