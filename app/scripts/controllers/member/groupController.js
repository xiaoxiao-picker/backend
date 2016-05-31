define(function(require, exports, module) {
	var baseController = require('baseController');
	var bC = new baseController();
	var template = require('template');
	var MemberService = require('MemberService');
	var Helper = require("helper");

	var scope;

	var Controller = function() {
		var _controller = this;
		_controller.namespace = "member.group";
		_controller.actions = {
			create: function() {
				var modal = openGroupModal("");
				modal.addAction(".btn-save", "click", function() {
					var btn = this;
					var name = modal.box.find("input.input").val();
					if (Helper.validation.isEmpty(name)) {
						return Helper.errorToast("分组名称不能为空！");
					}
					Helper.begin(btn);
					MemberService.group.add(scope.orgId, name).done(function(data) {
						_controller.render();
						Helper.successToast("添加成功！");
						modal.destroy();
					}).fail(function(error) {
						Helper.alert(error);
					}).always(function() {
						Helper.end(btn);
					});
				});
			},

			update: function() {
				var id = this.attr("data-value");
				var name = this.attr("data-name");
				var modal = openGroupModal(name);
				modal.addAction(".btn-save", "click", function() {
					var btn = this;
					var name = modal.box.find("input.input").val();
					if (Helper.validation.isEmpty(name)) {
						return Helper.errorToast("分组名称不能为空！");
					}
					Helper.begin(btn);
					MemberService.group.update(scope.orgId, id, name).done(function(data) {
						_controller.render();
						Helper.successToast("修改成功！");
						modal.destroy();
					}).fail(function(error) {
						Helper.alert(error);
					}).always(function() {
						Helper.end(btn);
					});
				});
			},

			remove: function() {
				var _btn = this;
				var groupId = _btn.attr("data-value");
				Helper.confirm("删除后该分组成员若无其他分组将会被放入未分组，仍确认删除？", function() {
					Helper.begin(_btn);
					MemberService.group.remove(scope.orgId, groupId).done(function(data) {
						_controller.render();
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
		this.templateUrl = templateUrl;
		this.callback = callback;

		scope = {
			orgId: App.organization.info.id
		};

		this.render();
	};

	Controller.prototype.render = function() {
		var templateUrl = this.templateUrl;
		var callback = this.callback;
		MemberService.group.list(scope.orgId, -1, -1).done(function(data) {
			Helper.globalRender(template(templateUrl, {
				groups: data.result
			}));
		}).fail(function(error) {
			Helper.alert(error);
		}).always(function() {
			Helper.execute(callback);
		});
	};

	function openGroupModal(name) {
		var modal = Helper.modal({
			title: "成员分组管理"
		});
		modal.html(template("app/templates/public/single-input-modal", {
			name: "分组名",
			value: name,
			placeholder: "请填写成员分组名称"
		}));
		return modal;
	}
	module.exports = Controller;
});