define(function(require, exports, module) {
	var baseController = require('baseController');
	var bC = new baseController();

	var OrganizationService = require('OrganizationService');
	var HomePageService = require("HomePageService");

	var template = require('template');
	var Helper = require("helper");

	var orgId;

	var Controller = function() {
		var _controller = this;
		_controller.namespace = "homepage.guide";
		_controller.actions = {

		};
	};
	bC.extend(Controller);
	/**
	 * 初始化变量，渲染模板
	 */
	Controller.prototype.init = function(templateUrl, callback) {
		this.templateUrl = templateUrl;
		this.callback = callback;
		orgId = App.organization.info.id;

		this.render();
	};
	/**
	 * 渲染函数，所有参数均来自Controller环境
	 */
	Controller.prototype.render = function() {
		var callback = this.callback;
		HomePageService.getActive(orgId).done(function(data) {
			var homepage = data.result;
			if (homepage) {
				Helper.go("homepage/" + homepage.id);
				return;
			}
			if (App.organization.config.isFirstSetHomePage) {
				Helper.go("homepage/0");
				OrganizationService.config.update(orgId, {
					isFirstSetHomePage: false
				}).done(function(data) {
					App.organization.config.isFirstSetHomePage = false;
				}).fail(function(error) {
					Helper.errorToast(error);
				});
			}
		}).fail(function(error) {
			Helper.alert(error);
		}).always(function() {
			Helper.execute(callback);
		});
	}

	module.exports = Controller;
});