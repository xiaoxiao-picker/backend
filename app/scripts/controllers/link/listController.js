define(function(require, exports, module) {
	var baseController = require('baseController');
	var bC = new baseController();

	var OrganizationService = require('OrganizationService');

	var template = require('template');
	var Helper = require("helper");

	var MENUS = require("scripts/config/menus");

	var orgId;

	var controller = function() {
		var _controller = this;
		_controller.namespace = "link.list";
		_controller.actions = {

		}
	};

	bC.extend(controller);
	controller.prototype.init = function() {
		orgId = Application.organization.id;

		var menus = MENUS(orgId).arrayWidthObjAttr("type", "SYSTEM");

		$(menus).each(function(idx, menu) {
			menu.url = Helper.config.pages.frontRoot + '/index.html' + menu.url + "&title=" + menu.name;
		});

		Helper.globalRender(template(this.templateUrl, {
			links: menus,
			count: menus.length
		}));
		copyBoardListenser();
		Helper.execute(this.callback);
	};

	// 复制按钮
	function copyBoardListenser() {
		$(".btn-clipboard").each(function(idx, item) {
			Helper.copyClientboard(item);
		});
	};

	module.exports = controller;

});