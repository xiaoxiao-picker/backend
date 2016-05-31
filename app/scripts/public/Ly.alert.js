define(function(require, exports, module) {
	var Alert = function(type, message, options) {
		this.type = type;
		this.message = message;
		this.options = $.extend({
			title: "校校提示",
			effects: 'scale'
		}, options);

		init(this);
	};

	function init($alert) {
		var title = $alert.options.title || '校校提示';
		var yesText = $alert.options.yesText || '确定';
		var noText = $alert.options.noText || '取消';

		$alert.box = $('<div class="ly-message-box-container"></div>');
		var footerHtml;

		if ($alert.type == "alert") {
			footerHtml = '<button class="ly-btn ly-btn-yes btn"><span class="inside-loading"><i class="fa fa-spinner rolling font-18"></i></span><span class="inside-text">' + yesText + '</span></button>';
		} else if ($alert.type == "confirm") {
			footerHtml = '<button class="ly-btn ly-btn-yes btn"><span class="inside-loading"><i class="fa fa-spinner rolling font-18"></i></span><span class="inside-text">' + yesText + '</span></button><button class="ly-btn ly-btn-no btn "><span class="inside-loading"><i class="fa fa-spinner rolling font-18"></i></span><span class="inside-text">' + noText + '</span></button>';
		}

		var html = ['<span class="ly-message-mid"></span>',
			'<div class="ly-message-box ' + $alert.options.effects + '">',
			'<div class="ly-message-box-header">',
			$alert.options.title,
			'</div>',
			'<div class="ly-message-box-body">',
			'<div class="ly-message-content">' + $alert.message + '</div>',
			'</div>',
			'<div class="ly-message-box-footer">',
			footerHtml,
			'</div>',
			'</div>'
		].join('');

		$alert.box.html(html);

		$alert.box.on("click", ".ly-btn-yes", function() {
			$alert.destroy($alert.options.success);
		});
		$alert.box.on("click", ".ly-btn-no", function() {
			$alert.destroy($alert.options.error);
		});

		$alert.box.appendTo(document.body);

		var btnYes = $alert.box.find(".ly-btn-yes");
		var btnNo = $alert.box.find(".ly-btn-no");

		// 确定按钮获取焦点，防止Enter键触发其他button的click事件
		btnYes.trigger("focus");

		if (window.SmartEvent) {
			// SmartEvent 在application.js中定义，旨在全局管理键盘快捷键事件
			// esc
			SmartEvent.add(27, function() {
				if (!$alert) return;
				btnNo.trigger("click");
				SmartEvent.remove(13, SmartEvent["13"].length - 1);
			});
			// Enter
			SmartEvent.add(13, function() {
				if (!$alert) return;
				btnYes.trigger("click");
				SmartEvent.remove(27, SmartEvent["27"].length - 1);
			});
		}
	}

	Alert.prototype.destroy = function(callback) {
		var $alert = this;
		$alert.box.find(".ly-message-box").animate({
			marginBottom: 100,
			opacity: 0.5
		}, 200, function() {
			callback && $.isFunction(callback) && callback.call($alert);
			$alert.box.remove();
		});
	};

	exports.alert = function(message, options, callback) {
		options.success = callback;
		return new Alert("alert", message, options);

	};
	exports.confirm = function(message, options, success, error) {
		options.success = success;
		options.error = error;
		return new Alert("confirm", message, options);
	};
});