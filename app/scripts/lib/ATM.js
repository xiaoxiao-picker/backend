define(function(require, exports, module) {
	var template = require("template");
	var Helper = require("helper");

	var WalletService = require("WalletService");

	var ATM = function(options) {
		this.options = $.extend({
			title: "我要取款",
			name: "取款金额/百元",
			placeholder: "请输入取款金额",
			success: function() {
				// 取款申请成功
			}
		}, options);

		var modal = Helper.modal(this.options);
		init(modal);
	};

	function init(modal) {
		Application.organization.getWalletAccounts().done(function() {
			var walletAccounts = Application.organization.walletAccounts.clone();
			if (walletAccounts.length == 0) {
				return Helper.confirm("当前组织未添加收款账户，是否现在添加？", function() {
					Helper.go("wallet/accounts");
				});
			}
			var data = $.extend(modal.options, {
				walletAccounts: walletAccounts
			});
			modal.html(template("app/templates/public/ATM/info", data));
			addListener(modal);
		}).fail(function(error) {
			Helper.alert(error);
			modal.destroy();
		});
	}

	function addListener(modal) {
		modal.addAction(".btnSubmit", "click", function(modal) {
			var btn = this;
			var value = +modal.box.find('.input').val();
			var accountId = modal.box.find("input[name=walletAccount]:checked").val();

			if (!accountId) return Helper.alert("请选择收款账户！");

			var regular = /^[0-9]*[1-9][0-9]*$/;
			if (!regular.test(value)) {
				return Helper.errorToast("请输入正确的金额！");
			}

			var money = value * 100;
			if (modal.options.maxValue < money) {
				return Helper.errorToast("余额不足！");
			}

			Helper.begin(btn);
			WalletService.draw(Application.organization.id, accountId, money).done(function(data) {
				Helper.alert("取款申请已提交，请耐心等待审核！");

				modal.options.success.call(modal, btn, money);
			}).fail(function(error) {
				Helper.alert(error);
			}).always(function() {
				Helper.end(btn);
			});
		});
	}

	module.exports = function(options) {
		return new ATM(options);
	};
});