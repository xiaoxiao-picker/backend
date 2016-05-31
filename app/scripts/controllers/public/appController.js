define(function(require, exports, module) {
	var namespace = "app";
	var template = require('template');
	var OrganizationService = require("OrganizationService");
	var Helper = require("helper");

	var actions = {
		home: function() {
			if ($('body').hasClass('modal-open2')) {
				NotificationBox.close();
			}
			Helper.go('#index');
		},
		userEdit: function() {
			var userId = App.user.info.id;
			
			if ($('body').hasClass('modal-open2')) {
				NotificationBox.close();
			}
			Helper.go('#user/edit');
		},
		logout: function() {
			Helper.confirm("确定退出账号？", {}, function() {
				App.logout(function(){
					App.auth();
				});
			});
		},
		switchOrg: function(orgId) {
			var orgId = this.attr("data-value");
			if (!orgId) {
				Helper.alert("数据错误，请联系管理员");
				return;
			}
			var orgs = App.organizations;
			$.each(orgs, function(idx, item) {
				if (item.id == orgId) {
					has = true;
					store.set("currentOrganization",orgId);
					window.location.reload();
					return;
				}
			});
			if (!has)
				Helper.alert("组织不存在！");
		},
		createOrg: function() {
			OrganizationService.createOrganization().done(function(data) {
				store.set("currentOrganization",orgId);
				window.location.reload();
			}).fail(function(error) {
				Helper.alert(error);
			});
		},
		removeOrg: function() {
			var _btn = this,
				orgId = _btn.attr("data-value");
			Helper.confirm("确定删除该组织？", {}, function() {
				_btn.attr("disabled", "disabled");
				OrganizationService.remove(orgId).done(function(data) {
					_btn.parents(".org-wrapper").remove();
				}).fail(function(error) {
					Helper.alert(error);
				}).always(function() {
					_btn.removeAttr("data-value");
					_btn = null;
				});
			});
		},
		showNotificationCenter: function() {
			if ($('body').hasClass('notification-open')) {
				NotificationBox.destroy();
			}else {
				NotificationBox.render();
			}
		},
		goPage: function() {
			var _btn = this,
				hash = _btn.attr("data-hash");

			var pageIndex = +$("#PageInput").val();

			window.location.href = hash + "page=" + pageIndex;
		}
	};

	Helper.globalEventListener("click." + namespace, "data-xx-action", actions);
	Helper.globalEventListener("change." + namespace, "data-xx-change-action", actions);
});
