define(function(require, exports, module) {
	var baseController = require('baseController');
	var bC = new baseController();

	var template = require('template');

	var HomePageService = require("HomePageService");
	var Helper = require("helper");

	var CONFIG = require('scripts/controllers/homepage/config');

	var orgId = App.organization.info.id;

	var Controller = function() {
		var _controller = this;
		_controller.namespace = "homepage.list";
		_controller.actions = {
			toggle: function() {
				var _input = this;
				var _sourceId = _input.attr("name");
				var _name = _input.attr("data-name");
				var tips = ["<p>微信端返回微首页均为主微首页！</p>", "<p>确认设置 [" + _name + "] 为主微首页？</p>"];
				Helper.confirm(tips.join(' '), function() {
					HomePageService.open(orgId, _sourceId).done(function(data) {
						_controller.render();
						Helper.successToast("已启用 [" + _name + "] 为主微首页！");
					}).fail(function(error) {
						Helper.alert(error);
					});
				}, function() {
					_input.removeAttr("checked");
				});
			},
			remove: function() {
				var _btn = this;
				var sourceId = _btn.attr("data-value");
				var _name = _btn.attr("data-name");
				Helper.confirm("确定删除 [" + _name + "] 微首页主题？", {}, function() {
					Helper.begin(_btn);
					HomePageService.remove(orgId, sourceId).done(function(data) {
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
	/**
	 * 初始化变量，渲染模板
	 */
	Controller.prototype.init = function(templateUrl, callback) {
		this.templateUrl = templateUrl;
		this.callback = callback;
		this.render();
	};
	/**
	 * 渲染函数，所有参数均来自Controller环境
	 */
	Controller.prototype.render = function() {
		var templateUrl = this.templateUrl;
		var callback = this.callback;
		App.organization.getHomepages(true).done(function(data) {
			var sources = App.organization.homepages.clone();
			var count = App.organization.homepages.length;
			$(sources).each(function(idx, source) {
				source.json = JSON.parse(source.json || "{}");
				var temp = CONFIG.templates.objOfAttr("name", source.json.template);
				source.template = temp ? temp.title : "未知模板";
			});
			Helper.globalRender(template(templateUrl, {
				sources: sources,
				count: count
			}));
		}).fail(function(error) {
			Helper.alert(error);
		}).always(function() {
			Helper.execute(callback);
		});
	}

	module.exports = Controller;
});