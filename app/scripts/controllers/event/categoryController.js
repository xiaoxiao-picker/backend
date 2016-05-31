define(function(require, exports, module) {
	var baseController = require('baseController');
	var template = require('template');
	var bC = new baseController();
	var EventService = require('EventService');
	var OrganizationService = require('OrganizationService');
	var Helper = require("helper");
	template.helper('makedate', Helper.makedate);
	var KeywordModel = require('KeywordModel');

	var orgId, tmp, callback, skip, page, limit, from, targetId;

	var Controller = function() {
		var _controller = this;
		_controller.namespace = "event.categories";
		_controller.actions = {
			create: function() {
				var _btn = this;
				labelModal('', '', addCategory);
			},
			removeLabel: function() {
				var _btn = this,
					categoryId = _btn.attr("data-value");

				if (categoryId) {
					Helper.confirm("删除该分类会将该分类中的活动移至未分类，仍确认删除？", {}, function() {
						Helper.begin(_btn);
						EventService.category.remove(orgId, categoryId).done(function(data) {
							_btn.parents("tr").remove();
							render();
						}).fail(function(error) {
							Helper.errorToast(error);
							Helper.end(_btn);
						});
					});
				} else {
					Helper.alert("该分类为关联组织的活动分类，不能进行删除!");
					return;
				}

			},
			openLabelModal: function() {
				var _btn = this,
					categoryId = _btn.attr("data-value"),
					categoryName = _btn.attr("data-name");

				labelModal(categoryId, categoryName, updateCategory);
			}
		};
	};
	bC.extend(Controller);
	Controller.prototype.init = function(templateName, fn) {
		tmp = templateName;
		callback = fn;
		from = Helper.param.search('from') ? Helper.param.search('from') : "list";
		targetId = Helper.param.search('targetId') ? Helper.param.search('targetId') : "";
		orgId = App.organization.info.id;
		render();
	};

	function render() {
		App.organization.getEventCategories(true).done(function(data) {

			$('div.container.auth-container').html(template(tmp, {
				result: App.organization.eventCategories,
				from: from,
				targetId: targetId
			}));
		}).fail(function(error) {
			Helper.alert(error);
		}).always(function() {
			callback && $.isFunction(callback) && callback();
		});
	}

	// 创建分类
	function addCategory(modal) {
		var _btn = $(this);
		var _input = modal.box.find('.input');
		var categoryName = _input.val();
		var categoryId = _btn.attr("data-value");

		if (Helper.validation.isEmpty(categoryName)) {
			Helper.errorToast("分类名称不能为空");
			return;
		}

		Helper.begin(_btn);
		EventService.category.add(orgId, categoryName).done(function(data) {
			Helper.successToast("添加成功");

			//默认添加关键词回复
			KeywordModel.custom.event(data.result, categoryName);

			modal.close();
			render();
		}).fail(function(error) {
			Helper.errorToast(error);
			Helper.end(_btn);
		});
	}

	// 更新分类
	function updateCategory(modal) {
		var _btn = $(this);
		var _input = modal.box.find('.input');
		var categoryName = _input.val();
		var categoryId = _btn.attr("data-value");

		if (Helper.validation.isEmpty(categoryName)) {
			Helper.errorToast("分类名称不能为空");
			return;
		}

		Helper.begin(_btn);
		if (!categoryId) {
			//更新组织配置信息
			OrganizationService.config.update(orgId, {
				relateOrgsEventDisplayName: categoryName
			}).done(function(data) {
				App.organization.config.relateOrgsEventDisplayName = categoryName;
				Helper.successToast("修改成功");
				modal.close();
				render();
			}).fail(function(error) {
				Helper.alert(error);
				Helper.end(_btn);
			});
		} else {
			EventService.category.update(orgId, categoryId, categoryName).done(function(data) {
				Helper.successToast("修改成功，请手动修改关键字自动回复。");
				modal.close();
				render();
			}).fail(function(error) {
				Helper.errorToast(error);
				Helper.end(_btn);
			});
		}
	}

	function labelModal(categoryId, categoryName, action) {
		Helper.singleInputModal({
			title: '活动分类管理',
			id: categoryId || "",
			name: "活动分类名称",
			value: categoryName || "",
			placeholder: "填写文章文类",
			action: action
		});
	}

	module.exports = Controller;
});