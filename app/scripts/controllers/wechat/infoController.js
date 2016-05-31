define(function(require, exports, module) {
	var baseController = require('baseController');
	var bC = new baseController();

	var Helper = require("helper");
	var template = require('template');

	var OrganizationService = require('OrganizationService');
	var WechatAuthService = require('WechatAuthService');
	var TaskService = require("TaskService");

	// 微信公众号权限集合
	var WechatScopeCategories = [{
		id: 1,
		name: "消息与菜单权限集"
	}, {
		id: 2,
		name: "用户管理权限集"
	}, {
		id: 3,
		name: "帐号管理权限集"
	}, {
		id: 4,
		name: "网页授权权限集"
	}, {
		id: 5,
		name: "微信小店权限集"
	}, {
		id: 6,
		name: "多客服权限集"
	}, {
		id: 7,
		name: "业务通知权限集"
	}, {
		id: 8,
		name: "微信卡券权限集"
	}, {
		id: 9,
		name: "微信扫一扫权限集"
	}, {
		id: 10,
		name: "微信连WIFI权限集"
	}, {
		id: 11,
		name: "素材管理权限集"
	}, {
		id: 12,
		name: "摇一摇周边权限集"
	}, {
		id: 13,
		name: "微信门店权限集"
	}];

	var Controller = function() {
		var _controller = this;
		_controller.namespace = "wechat.info";
		_controller.actions = {
			// 跳转到绑定页面
			wechatAuth: function() {
				App.getAppId().done(function() {
					WechatAuthService.preAuthCode().done(function(data) {
						var appId = App.AppId;
						var code = data.result.code;
						var redirectUrl = encodeURIComponent(Helper.config.pages.origin + "/auth.html?organizationId=" + App.organization.info.id + "&timeline=" + (new Date()).getTime());
						var url = 'https://mp.weixin.qq.com/cgi-bin/componentloginpage?component_appid=' + appId + '&pre_auth_code=' + code + '&redirect_uri=' + redirectUrl;
						window.location.href = url;
					}).fail(function(error) {
						Helper.alert(error);
					});
				}).fail(function(error) {
					Helper.alert(error);
				});
			},
			// 解除绑定
			unbindThenAuth: function() {
				var btn = $(this);
				Helper.begin(btn);
				$.when(App.getAppId(), WechatAuthService.preAuthCode(), WechatAuthService.unbind(App.organization.id)).done(function(data1, data2, data3) {
					var appId = App.AppId;
					var code = data2.result.code;
					var redirectUrl = encodeURIComponent(Helper.config.pages.origin + "/auth.html?organizationId=" + App.organization.info.id + "&timeline=" + (new Date()).getTime());
					var url = 'https://mp.weixin.qq.com/cgi-bin/componentloginpage?component_appid=' + appId + '&pre_auth_code=' + code + '&redirect_uri=' + redirectUrl;
					window.location.href = url;
				}).fail(function(error) {
					Helper.alert(error);
				}).always(function() {
					Helper.end(btn);
				});
			},
			// 显示解绑说明页面
			unbind: function() {
				var modal = Helper.modal({
					title: "如何解除微信公众号绑定",
					loading: false,
					className: "width-1000"
				}).html(template("app/templates/wechat/unbind-guide", {}));
			},
			// 强制解绑
			confirmBind: function() {
				var btn = this;
				Helper.confirm("确定已在微信后台解除绑定？", {
					yesText: "确定",
					noText: "取消"
				}, function() {
					Helper.begin(btn);
					WechatAuthService.unbind(App.organization.id).done(function(data) {
						App.organization.wechat = null;
						_controller.render();
					}).fail(function(error) {
						Helper.alert(error);
					}).always(function() {
						Helper.end(btn);
					});
				});
			}
		};
	};
	bC.extend(Controller);
	Controller.prototype.init = function() {
		var controller = this;
		var taskId = Helper.param.search("taskId");
		if (!taskId) {
			this.render();
			return;
		}

		makeTaskResult(taskId);

		// 自动进行绑定任务
		function makeTaskResult(taskId) {
			setTimeout(function() {
				TaskService.checkTaskState(taskId).done(function(data) {
					var state = data.result;
					if (state == "OK") {
						Helper.alert("恭喜你，微信绑定成功！！！");
						controller.render();
					} else if (state == "RUNNING") {
						makeTaskResult(taskId);
					} else if (state == "CANCEL") {
						Helper.alert("任务意外中断，请稍后重试！");
						controller.render();
					} else if (state == "ERROR") {
						Helper.alert("任务失败，请稍后重试！");
						controller.render();
					}
				}).fail(function(error) {
					Helper.alert(error);
				});
			}, 500);
		}
	};

	Controller.prototype.render = function() {
		var templateUrl = this.templateUrl;
		var callback = this.callback;
		App.organization.getWechat(true).done(function() {
			var wechat = App.organization.wechat;

			if (!wechat || !wechat.id) {
				Helper.globalRender(template("app/templates/wechat/noWechat", {
					wechat: wechat
				}));
				Helper.execute(callback);
				return;
			}

			template.helper("haveAuthority", function(authorityId, messageType) {
				var checked = wechat.scopeCategories.indexOfAttr("id", authorityId) > -1;
				if (messageType == "title") {
					return checked ? "已授权" : "未授权";
				} else {
					return checked ? "checked" : "";
				}
			});

			// 检查当前微信公众号绑定是否可用（主要是老版本与新版本绑定方式不一样）
			WechatAuthService.isAuthorizer(wechat.id).done(function(data) {
				Helper.globalRender(template(templateUrl, {
					wechat: wechat,
					available: data.result,
					authorities: WechatScopeCategories
				}));
			}).fail(function(error) {
				Helper.alert(error);
			}).always(function() {
				Helper.execute(callback);
			});

		}).fail(function(error) {
			Helper.alert(error);
		}).always(function() {

		});
	};

	module.exports = Controller;
});