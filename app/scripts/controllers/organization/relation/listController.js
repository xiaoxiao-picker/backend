define(function(require, exports, module) {
	var baseController = require('baseController');
	var template = require('template');
	var bC = new baseController();
	var OrganizationService = require('OrganizationService');
	var Helper = require("helper");

	var orgId;

	var Groups = ["管理", "学校官方", "社团联", "学生会", "部门", "学术", "艺术", "体育", "实践", "公益", "其他"];
	var RelationOrgs;

	var Controller = function() {
		var _controller = this;
		_controller.namespace = "relatedorg.list";
		_controller.actions = {
			showOrgInfo: function() {
				var _btn = this,
					orgId = _btn.attr("data-value");

				require.async('OrganizationModal', function(OrganizationModal) {
					OrganizationModal(orgId, {});
				});
			},
			remove: function() {
				var _btn = this;
				var relateOrgId = _btn.attr("data-value");
				var orgType = _btn.attr("data-type");
				var orgName = _btn.attr("data-name");

				Helper.confirm("确认解除与 " + orgName + " 的关联？", {}, function() {
					Helper.begin(_btn);
					OrganizationService.relation.remove(orgId, relateOrgId).done(function(data) {
						Helper.successToast("已成功解除与 " + orgName + " 的关联");

						//删除对应分组的元素
						$.each(RelationOrgs, function(idx, groupOrg) {
							$.each(groupOrg.orgs, function(o_index, org) {
								if (org.id == relateOrgId) {
									groupOrg.orgs.splice(o_index, 1);

									//当该分组无对应数据时，删除该分组项
									if (groupOrg.orgs.length == 0) {
										RelationOrgs.splice(idx, 1);
										$("#Group_" + groupOrg.index).remove();
									} else {
										$("#Group_" + groupOrg.index).replaceWith(template('app/templates/organization/relation/group-orgs', {
											groupOrg: groupOrg
										}));
									}

									return false;
								};
							});
						});

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
	Controller.prototype.init = function(templateUrl, callback) {
		this.callback = callback;
		this.templateUrl = templateUrl;
		orgId = App.organization.info.id;
		RelationOrgs = [];
		this.render();
	};

	Controller.prototype.render = function() {
		var callback = this.callback;
		var templateUrl = this.templateUrl;
		OrganizationService.relation.getList(orgId).done(function(data) {
			var relationOrgs = data.result;

			Helper.globalRender(template(templateUrl, {
				groups: Groups
			}));

			getGroupOrgs(relationOrgs);

			//渲染分组
			if (RelationOrgs.length > 0) {
				//遍历分组列表
				$(RelationOrgs).each(function(idx, groupOrg) {
					renderGroupOrgs(groupOrg);
				});
			} else {
				$(".list-empty").removeClass('hide');
			}
		}).fail(function(error) {
			Helper.alert(error);
		}).always(function() {
			Helper.execute(callback);
		});
	};

	// 遍历数组进行分组排序
	function getGroupOrgs(orgs) {
		RelationOrgs = [];
		$(Groups).each(function(index, group) {
			var groupOrgs = [];
			$(orgs).each(function(o_index, org) {
				if (!org.orgType && group == "其他") {
					groupOrgs.push(org);
					return;
				};

				if (org.orgType == group) {
					groupOrgs.push(org);
				};
			});

			//当该分组有对应数据时，添加该分组项
			if (groupOrgs.length > 0) {
				RelationOrgs.push({
					index: index,
					type: group,
					orgs: groupOrgs
				});
			}
		});
	};

	// 渲染分组内列表
	function renderGroupOrgs(groupOrg) {

		if (groupOrg.type != "社团联" && groupOrg.type != "学生会" && groupOrg.type != "部门") {
			groupOrg.type = groupOrg.type + "类组织";
		};

		$("#GroupContainer").append(template('app/templates/organization/relation/group-orgs', {
			groupOrg: groupOrg
		}));
	}

	module.exports = Controller;
});