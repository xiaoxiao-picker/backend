define(function(require, exports, module) {
	var template = require('template');
	var Helper = require("helper");
	var OrganizationService = require("OrganizationService");

	var Application = require('factory.application');


	var SE = require("smartEvent");

	var handle = false; //标识程序是否处于处理状态

	// 初始化用户，全局唯一的用户示例
	var App = window.App = Application;
	App.authSession(function() {
		if (!window.SmartEvent) {
			var SmartEvent = window.SmartEvent = new SE();
			SmartEvent.init();
		}

		App.getOrganizations().done(function() {
			$('div.front-loading').after(template('app/templates/guide', {
				orgs: App.organizations
			})).remove();
		});
	});

	var actions = {
		create: function() {
			if (handle) return;
			var _btn = this.find(".xx-btn");
			Helper.begin(_btn);
			OrganizationService.add().done(function(data) {
				store.set("ActiveOrganizationId", data.result);
				window.location.href = './home.html#edit';
			}).fail(function(error) {
				Helper.errorToast(error);
			}).always(function() {
				Helper.end(_btn);
			});
		},
		remove: function() {
			if (handle) return;
			var _btn = this;
			var orgId = _btn.attr("data-value");

			Helper.confirm("<p>确定删除该组织？</p><p>若该组织已绑定微信公众号，删除后将会解除绑定。</p>", {}, function() {
				Helper.begin(_btn);
				OrganizationService.remove(orgId).done(function(data) {
					Helper.successToast("删除该组织成功");
					_btn.parents(".option-wrapper").remove();
				}).fail(function(error) {
					Helper.errorToast(error);
				}).always(function() {
					Helper.end(_btn);
				});
			});
		},
		select: function() {
			if (handle) return;
			var _btn = this;
			var orgId = _btn.attr("data-value");
			store.set("ActiveOrganizationId", orgId);
			window.location.href = './home.html';
		}
	};

	Helper.globalEventListener("click", "data-xx-action", actions);
});