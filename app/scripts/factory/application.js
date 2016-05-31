define(function(require, exports, module) {
	var PublicService = require('PublicService');
	var OrganizationService = require("OrganizationService");
	var WechatAuthService = require('WechatAuthService');

	var Helper = require("helper");

	var User = require("factory.user");
	var Organization = require("factory.organization");


	var Application = (function() {
		/**
		 * 私有变量
		 */
		var session = null;
		return function() {
			this.organization = {};
			this.organizations = [];
			this.setSession = function(iSession) {
				session = iSession;
				store.set("userSession", iSession);
			};
			/**
			 * fix 手动清除 '/' 下的userSession cookie
			 * @return {[type]} [description]
			 */
			this.clearSession = function() {
				session = null;
				store.remove("userSession");
			};
			this.getSession = function() {
				return session;
			};
		};
	})();

	// 初始化应用程序
	// 1、根据Session取得用户登录状态
	// 2、获取用户所管理的组织集合
	// 3、设置用户当前管理的组织
	// 4、获取当前组织的配置信息
	Application.prototype.init = function(callback) {
		var application = this;
		application.authSession(function() {
			application.getOrganizations().done(function() {
				application.setActiveOrganization();
				if (!application.organization || !application.organization.id) return;
				application.organization.getConfig().done(function() {
					Helper.execute(callback);
				});
			});
		});
	};

	Application.prototype.authSession = function(callback) {
		var application = this;
		var session = store.get("userSession");
		if (!session) {
			application.auth(callback);
			return;
		}
		this.setSession(session);
		return PublicService.authSession(session).done(function(data) {
			if (!data.result) {
				application.auth(callback);
				return;
			}
			var userId = data.result.id;
			application.user = User(userId);
			application.user.info = data.result;
			Helper.execute(callback);
		}).fail(function(error) {
			Helper.alert(error);
		});
	};

	Application.prototype.getOrganizations = function() {
		var application = this;
		var userId = this.user.id;
		return OrganizationService.getOwnedOrganizations(userId).done(function(data) {
			var organizations = data.result;
			$(organizations).each(function(idx, organization) {
				App.organizations.push(Organization(organization.id, {
					info: organization
				}));
			});
		});
	};
	Application.prototype.setActiveOrganization = function(orgId) {
		var application = this;
		var organizations = this.organizations;
		if (!organizations || organizations.length == 0) {
			// Helper.alert("您当前暂无可管理的组织，您可以创建一个组织进行管理！");
			window.location.href = "./guide.html";
			return;
		}
		//在缓存中查找默认的操作组织
		var activeId = orgId || store.get("ActiveOrganizationId");

		var activeOrganization = organizations.objOfAttr("id", activeId);
		if (!activeOrganization) {
			activeOrganization = organizations[0];
		}

		application.organization = activeOrganization;
	};

	Application.prototype.getAppId = function(refresh) {
		var application = this;
		if (refresh || !application.AppId) {
			return WechatAuthService.commentAppId().done(function(data) {
				application.AppId = data.result;
			});
		} else {
			var defer = $.Deferred();
			defer.resolve();
			return defer.promise();
		}
	};

	Application.prototype.getConfig = function(refresh) {
		var application = this;
		if (refresh || !application.config) {
			return PublicService.getConfigInfo().done(function(data) {
				application.config = data.result;
			});
		} else {
			var defer = $.Deferred();
			defer.resolve();
			return defer.promise();
		}
	};

	Application.prototype.loader = {
		begin: function() {
			$('div.nav-loading').show();
		},
		end: function() {
			$('div.nav-loading').hide();
		}
	};

	// 要求登陆
	// 在本系统中添加一个弹出层登陆模块，登陆后执行callback回调
	Application.prototype.auth = function(callback) {
		window.location.href = "./index.html"
	};
	// 登出系统，销毁session并清除浏览器记录
	Application.prototype.logout = function(callback) {
		PublicService.logout();
		this.clearSession();
		Helper.execute(callback);
	};


	var application = (function() {
		return new Application();
	})();

	module.exports = application;
});