define(function(require, exports, module) {
	var baseController = require('baseController');
	var bC = new baseController();

	var OrganizationService = require('OrganizationService');
	var WechatService = require('WechatService');

	var Helper = require("helper");
	var template = require('template');

	var Controller = function() {
		var _controller = this;
		_controller.namespace = "wechat.guide";
		_controller.actions = {
			waiting: function() {
				Helper.alert("更多微首页模板正在努力开发中，敬请期待！");
			}
		};
	};
	bC.extend(Controller);
	Controller.prototype.init = function(templateUrl, callback) {
		this.templateUrl = templateUrl;
		this.callback = callback;
		this.render();
	};

	Controller.prototype.render = function() {
		var templateUrl = this.templateUrl;
		var callback = this.callback;
		Helper.globalRender(template(templateUrl, {}));
		Helper.execute(callback);
	}

	module.exports = Controller;
});