define(function(require, exports, module) {
	var baseController = require('baseController');
	var bC = new baseController();

	var template = require('template');
	var WalletService = require("WalletService");
	var Helper = require("helper");

	var banks = require("config.bank")();

	var accountId, accountInfo;

	var Controller = function() {
		var _controller = this;
		_controller.namespace = "wallet.account.edit";
		_controller.actions = {
			selectAccountType: function() {
				accountInfo.type = this.val();
				var $bankContainer = this.parents(".xx-inner-body").find(".bank-container");
				if (accountInfo.type == "ALIPAY") {
					$bankContainer.addClass("hide");
					$("#accountTitle").text("支付宝账号");
				} else if (accountInfo.type == "BANK") {
					$bankContainer.removeClass("hide");
					if (!accountInfo.name) {
						accountInfo.name = banks[0].code;
						$($bankContainer.find(".bank").removeClass("active").get(0)).addClass("active");
						$("#accountTitle").text("银行账号");
					}
				}
			},
			selectBank: function() {
				var bankCode = this.attr("data-bank-code");
				accountInfo.name = bankCode;
				this.parents(".bank-container").find(".bank").removeClass("active");
				this.find(".bank").addClass("active");
			},
			addImage: function() {
				var btn = this;
				require.async("ImageSelector", function(ImageSelector) {
					ImageSelector({
						title: "上传相关证明图片",
						cut: function(imageUrl) {
							this.destroy();
							addImage(imageUrl);
						},
						choose: function(imageUrls) {
							this.destroy();
							addImage(imageUrls[0]);
						}
					});
				});

				function addImage(image) {
					accountInfo.images.push(image);
					btn.before('<div class="image"><img src="' + image + '@200w_120h_1e_1l" /><button class="btn-close" data-xx-action="removeImage" data-image-url="' + image + '"><span class="fa fa-close"></span></button></div>');
				}
			},
			removeImage: function() {
				var image = $(this).attr("data-image-url");
				accountInfo.images.remove(image);
				$(this).parents(".image").slideUp(200, function() {
					$(this).remove();
				});
			},
			save: function() {
				var btn = this;
				accountInfo.userName = btn.parents("form").find("input.userName").val();
				accountInfo.account = btn.parents("form").find("input.account").val();
				if (!validateAccountInfo()) return;


				if (accountId == "add") {
					Helper.begin(btn);
					WalletService.account.add(Application.organization.id, accountInfoToData()).done(function(data) {
						Helper.alert("添加成功！", function() {
							Helper.go("wallet/accounts");
						});
					}).fail(function(error) {
						Helper.alert(error);
					}).always(function() {
						Helper.end(btn);
					});
				} else {
					Helper.confirm("更新后账户需要重新审核，确定更新？", function() {
						Helper.begin(btn);
						WalletService.account.update(accountId, accountInfoToData()).done(function(data) {
							Helper.alert("更新成功！", function() {
								Helper.go("wallet/accounts");
							});
						}).fail(function(error) {
							Helper.alert(error);
						}).always(function() {
							Helper.end(btn);
						});
					});
				}
			}
		};
	};
	bC.extend(Controller);
	Controller.prototype.init = function(templateUrl, callback) {
		this.templateUrl = templateUrl;
		this.callback = callback;

		accountId = Helper.param.hash("accountId");

		this.render();
	};

	Controller.prototype.render = function() {
		var templateUrl = this.templateUrl;
		var callback = this.callback;

		var getAccountInfo = accountId == "add" ? (function() {
			accountInfo = {
				userName: "",
				name: "",
				type: "ALIPAY",
				account: "",
				images: []
			};
		})() : WalletService.account.get(accountId).done(function(data) {
			accountInfo = dataToAccountInfo(data.result);
		});



		$.when(getAccountInfo).done(function() {
			$(banks).each(function(idx, bank) {
				bank.active = bank.code == accountInfo.name;
			});
			Helper.globalRender(template(templateUrl, {
				accountId: accountId,
				accountInfo: accountInfo,
				banks: banks
			}));
		}).fail(function(error) {
			Helper.alert(error);
		}).always(function() {
			Helper.execute(callback);
		});
	};


	function dataToAccountInfo(data) {
		data.images = data.photos ? data.photos.split(",") : [];
		return data;
	}


	function validateAccountInfo() {
		if (!accountInfo.type) {
			Helper.alert("请选择账户类型！");
			return false;
		}
		if (accountInfo.type == "BANK" && !accountInfo.name) {
			Helper.alert("请选择银行！");
			return false;
		}
		if (Helper.validation.isEmptyNull(accountInfo.userName)) {
			Helper.alert("请填写账户姓名！");
			return false;
		}
		if (!accountInfo.account) {
			Helper.alert("请填写" + (accountInfo.type == "BANK" ? "银行" : "支付宝") + "账号");
			return false;
		}
		if (accountInfo.type == "BANK" && !Helper.validation.isBankAccount(accountInfo.account)) {
			Helper.alert("请填写正确的银行账号！");
			return false;
		}
		if (accountInfo.images.length == 0) {
			Helper.alert("请至少上传一张相关证件照片！");
			return false;
		}

		return true;
	};

	function accountInfoToData() {
		var data = {
			userName: accountInfo.userName,
			name: accountInfo.name,
			type: accountInfo.type,
			account: accountInfo.account,
			photos: accountInfo.images.join(",")
		};
		return data;
	}

	module.exports = Controller;
});