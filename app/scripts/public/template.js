define(function(require, exports, module) {
	var formatCurrency = require("scripts/public/formatCurrency");
	var template = require("scripts/template");
	var banks = require("config.bank")();

	template.helper("organizationId", function() {
		return Application.organization.id;
	});
	template.helper("session", function() {
		return Application.getSession();
	});
	template.helper("application", function(object) {
		if (object == "session") {
			return Application.getSession();
		} else if (object == "organizationId") {
			return Application.organization.id;
		} else if (object == "frontRoot") {
			// 同Helper.config.frontRoot 在文件scripts/public/config.js中
			return (window.location.host.indexOf("xiaoxiao") > -1) ? 'http://front.xiaoxiao.la' : 'http://front.signvelop.com';
		} else {
			return "";
		}
	});

	// 时间格式转化
	template.helper('makedate', function(d, format) {
		format = format ? format : "yyyy-MM-dd";
		return d ? new Date(parseInt(d)).Format(format) : "";
	});

	template.helper('makedateSpan', function(d, format, spanFormat) {
		format = format ? format : "MM-dd";
		spanFormat = spanFormat ? spanFormat : "yyyy-MM-dd";
		try {
			var date = new Date(parseInt(d));
			return '<span tooltip title="' + date.Format(spanFormat) + '">' + date.Format(format) + '</span>';
		} catch (error) {
			return "";
		}
	});


	// 图片过滤器
	template.helper("imageUrl", function(imageUrl, param, errorImage) {
		return imageUrl ? (imageUrl + param) : (errorImage || "");
	});

	// 用户名
	template.helper("userName", function(user, defaultUserName) {
		return user ? (user.name || user.nickname || user.phoneNumber || defaultUserName) : defaultUserName;
	});

	// 列表索引
	template.helper("index", function(i, page, limit) {
		i = (+i);
		return ((i + 1) + (page - 1) * limit) < 10 ? "0" + ((i + 1) + (page - 1) * limit) : ((i + 1) + (page - 1) * limit);
	});

	// 货币格式化
	template.helper("formatCurrency", function(number, limit) {
		return formatCurrency(number, limit);
	});

	template.helper("bankAccount", function(account) {
		var length = Math.ceil(account.length / 4);
		var arr = [];
		for (var i = 0; i < length; i++) {
			arr.push(account.substr(4 * i, 4));
		};
		return arr.join(" ");
	});

	template.helper("walletAccountType", function(accountType, bankCode) {
		if (accountType == "ALIPAY") {
			return "支付宝"
		} else {
			var bank = banks.objOfAttr("code", bankCode);
			return bank ? bank.name : bankCode;
		}
	});

	module.exports = template;
});