define(function(require, exports, module) {
	var baseController = require('baseController');
	var bC = new baseController();
	var template = require('template');
	var Helper = require("helper");

	var WechatResourceService = require('WechatResourceService');

	var skip, limit = 12;
	var organizationId = Application.organization.id;

	var panelBodySelector = ".resource-weixin-video-content .panel-body";

	var Controller = function() {
		var controller = this;
		controller.namespace = "resource.weixin.video";
		controller.actions = {
			// 同步微信素材
			update: function() {
				var $btn = this;
				Helper.begin($btn);
				WechatResourceService.video.synchronize(organizationId).done(function(data) {
					skip = 0;
					Application.loader.begin();
					controller.render(Application.loader.end);
				}).fail(function(error) {
					Helper.alert(error);
				}).always(function() {
					Helper.end($btn);
				});
			},
		};
	};

	bC.extend(Controller);
	Controller.prototype.init = function() {
		skip = 0;
		this.render();
	};
	Controller.prototype.render = function(callback) {
		callback || (callback = this.callback);
		Helper.globalRender(template('app/templates/resource/weixin/video/list', {}));
		WechatResourceService.video.getList(organizationId, skip, limit).done(function(data) {
			var videoes = data.result.data;
			var total = data.result.total;
			$(panelBodySelector).html(template("app/templates/resource/weixin/video/videoes", {
				videoes: videoes
			}));
		}).fail(function(error) {
			Helper.alert(error);
		}).always(function() {
			Helper.execute(callback);
		});
	};


	module.exports = Controller;

});