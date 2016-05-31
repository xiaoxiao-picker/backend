define(function(require, exports, module) {
	exports.config = require("config");
	exports.GUID = require("factory.guid");

	var validation = require('validation');
	exports.getFormData = validation.getFormData;
	exports.validation = validation;

	exports.formatCurrency = require("scripts/public/formatCurrency");

	exports.makedate = function(d, format) {
		format = format ? format : "yyyy-MM-dd";
		return d ? new Date(parseInt(d)).Format(format) : "";
	};

	exports.param = require("scripts/public/param");
	exports.objectFilter = require("scripts/public/objectFilter");



	exports.pagecount = function(total, limit) {
		return total % limit == 0 ? total / limit : Math.floor(total / limit) + 1;
	};
	exports.pagination = function(count, limit, page) {
		return {
			iTotalPage: count % limit == 0 ? count / limit : Math.floor(count / limit) + 1,
			iCurPage: page,
			limit: limit,
			page: page,
			hash: (location.hash.indexOf('page=') != -1) ? location.hash.replace(/page\=([\d]+)/, "") : location.hash + "&"
		};
	};

	exports.begin = function(btn) {
		btn.addClass("loading").removeClass("else").attr("disabled", "disabled");
	};
	exports.end = function(btn) {
		btn.removeClass("loading").removeClass("else").removeAttr("disabled");
	};
	exports.process = function(btn) {
		btn.addClass("else").removeClass("loading").attr("disabled", "disabled");
	};
	/**
	 * 取消event默认事件
	 */
	exports.preventDefault = function(event) {
		if (event.preventDefault) {
			event.preventDefault();
		} else {
			event.returnValue = false;
		}
	};



	var eventListener = require('eventListener');
	exports.listeners = eventListener;
	exports.eventListener = eventListener.eventListener;
	exports.globalEventListener = eventListener.globalEventListener;
	exports.specifiedEventListener = eventListener.specifiedEventListener;

	// 弹出框组件
	var Alert = require('Alert');

	function lyAlert(message, options, callback) {
		if ($.isFunction(options)) {
			callback = options;
		}
		options = $.extend({}, options);
		Alert.alert(message, options, callback);
	};

	function lyConfirm(message, options, successCallback, errorCallback) {
		if ($.isFunction(options)) {
			errorCallback = successCallback;
			successCallback = options;
		}
		options = $.extend({}, options);
		Alert.confirm(message, options, successCallback, errorCallback);
	};
	exports.alert = lyAlert;
	exports.confirm = lyConfirm;

	// 提示组
	var Toast = require('Toast');

	function successToast(message) {
		Toast.toast(message, {
			theme: 'success',
			position: 'center'
		});
		return true;
	};
	var errorToast = function(message) {
		Toast.toast(message, {
			theme: 'danger',
			position: 'center'
		});
		return false;
	};
	exports.successToast = successToast;
	exports.errorToast = errorToast;

	var Modal = require("Modal");
	exports.modal = Modal;

	var CommonModal = require('CommonModal');
	exports.singleInputModal = CommonModal.singleInputModal;



	// 二维码生成器
	exports.generateQRCode = require("generateQRCode");


	// 跳转 hash
	exports.go = function(hash) {
		window.location.hash = hash;
	};
	exports.goBack = function() {
		window.history.back();
	};

	// 执行函数
	exports.execute = function(fnc, data) {
		fnc && $.isFunction(fnc) && fnc(data);
	};

	// 全局渲染函数
	exports.globalRender = function(html) {
		$('div.container.auth-container').html(html).css({
			opacity: 0
		}).animate({
				opacity: 1
			}, 1000);
	};



	/**
	 * 复制到剪贴板 ZeroClipboard 由home.html页面引入
	 * btn 复制按钮 DOM对象
	 * options 其他参数
	 */

	var flash = require("scripts/lib/flash");

	var hasFlash = flash.checker().hasFlash;
	exports.copyClientboard = function(btn, options) {
		options = $.extend({
			aftercopy: function(event) {
				successToast('复制成功！');
			},
			error: function() {
				errorToast("复制失败，请手动复制！");
			}
		}, options);

		if (!hasFlash) {
			$(btn).on("click.copyclientboard", function() {
				errorToast("复制功能需要您安装flash，请手动复制！");
			});
			return;
		}

		try {
			require.async("plugins/zeroclipboard/ZeroClipboard", function() {
				var client = new ZeroClipboard(btn);
				client.on("ready", function(readyEvent) {
					client.on("aftercopy", options.aftercopy);
				});
				client.on("error", function() {
					$(btn).on("click.copyclientboard", function() {
						options.error();
					});
				});
			});
		} catch (error) {
			window.console && console.log && console.log(error);
		}
	};

	// 计算字符串所占字节数
	exports.getCharLength = function(s) {
		var l = 0;
		var a = s.split("");
		for (var i = 0; i < a.length; i++) {
			if (a[i].charCodeAt(0) < 299) {
				l++;
			} else {
				l += 2;
			}
		}
		return l;
	};
});