define(function(require, exports, module) {
	var baseController = require('baseController');
	var bC = new baseController();

	var template = require('template');
	var WalletService = require("WalletService");
	var Helper = require("helper");

	var Controller = function() {
		var controller = this;
		controller.namespace = "wallet.account.list";
		controller.actions = {
			remove: function() {
				var btn = this;
				var accountId = btn.attr("data-account-id");
				var account = Application.organization.walletAccounts.objOfAttr("id", accountId);
				if (!account) return Helper.alert("账户不存在！");

				Helper.confirm("确定删除【" + {
					ALIPAY: "支付宝",
					BANK: "银行卡"
				}[account.type] + "】账户【" + account.name + "】?", function() {
					Helper.begin(btn);
					WalletService.account.remove(account.id).done(function() {
						btn.parents("tr").slideUp(200, function() {
							this.remove();
							controller.render();
						});
					}).fail(function(error) {
						Helper.alert(error);
					}).always(function() {
						Helper.end(btn);
					});
				});
			},
			// 设置为默认账户
			setDefault: function() {
				var $input = this;
				var accountId = $input.val();
				var account = Application.organization.walletAccounts.objOfAttr("id", accountId);
				if (!account) return Helper.alert("账户不存在！");

				$input.attr("disabled","disabled");
				WalletService.account.active(accountId).done(function(data) {
					controller.render();
				}).fail(function(error) {
					Helper.alert(error);
					$input.removeAttr("disabled");
				});
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
		App.organization.getWalletAccounts(true).done(function(data) {
			var accounts = Application.organization.walletAccounts.clone();
			Helper.globalRender(template(templateUrl, {
				accounts: accounts
			}));
		}).fail(function(error) {
			Helper.alert(error);
		}).always(function() {
			Helper.execute(callback);
		});
	};

	module.exports = Controller;
});