define(function(require, exports, module) {
	var template = require("template");
	var WechatAuthService = require('WechatAuthService');
	var boxTemp = 'app/templates/public/auth-wechat-modal';

	var Guide = function(options) {
		this.options = $.extend(true, {
			container: $(document.body),
			zIndex: 1030,
			destroy: function() {}
		}, options);

		this.active = false;
		this.container = this.options.container;
		this.namespace = "auth-wechat-guide";

		init(this);
	};


	function init(guide) {
		guide.box = $(template(boxTemp, {
			title: guide.options.title,
			zIndex: guide.options.zIndex,
			className: guide.options.className
		}));
		guide.box.appendTo(guide.container);

		addListener(guide);

		guide.open();
	}

	function addListener(guide) {
		guide.box.on('click.' + guide.namespace, '#BtnAuth', function() {
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
		});
	};

	Guide.prototype.open = function() {
		this.active = true;
		$(document.body).addClass("modal-open");
		this.box.find(".modal-inner").show().addClass("in");
		var autoFocus = this.options.autoFocus;
		if (autoFocus) {
			setTimeout(function() {
				$(autoFocus).trigger("focus");
			}, 500);
		}
	};
	Guide.prototype.close = function() {
		var guide = this;
		this.active = false;
		this.box.find(".modal-inner").removeClass("in");
		setTimeout(function() {
			guide.box.off("." + guide.namespace).remove();
			var length = $(".modal-backdrop ").length;
			if (length === 0) {
				$(document.body).removeClass("modal-open");
			}
		}, 200);

		execute(this.options.destroy); // 执行关闭回调
	};

	function execute(fn, data) {
		fn && $.isFunction(fn) && fn(data);
	}

	function preventDefault(event) {
		if (event.preventDefault) {
			event.preventDefault();
		} else {
			event.returnValue = false;
		}
	};

	module.exports = function(options) {
		return new Guide(options);
	};
});