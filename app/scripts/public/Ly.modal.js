define(function(require, exports, module) {
	require("plugins/jquery.easing");
	require("array");
	var template = require("template");

	// 储存Modal对象集合
	var Modals = [];

	var Modal = function(options) {
		// 若不传options参数则提供clear方法
		if (Object.prototype.toString.call(options) === '[object Undefined]') return;

		this.options = $.extend(true, {
			container: $(document.body),
			template: "app/templates/public/modal/container",
			className: "",
			loading: true,
			title: "弹出层",
			width: '',
			zIndex: 1030,
			position: "center",
			offsetY: 0,
			backdrop: true,
			autoFocus: false, // 自动获取焦点元素[false|'selector']
			actions: {}, // 行为注入
			destroy: function() {}
		}, options);

		// modal层的状态，true为打开状态，false为关闭状态
		this.active = false;
		this.container = this.options.container;
		this.namespace = "modal." + new Date().getTime();
		init(this);
	};


	function init(modal) {
		modal.box = $(template(modal.options.template, modal.options));
		modal.box.appendTo(modal.container);

		// 添加头部关闭按钮
		modal.options.actions[".modal-header>button.close,.btn-close"] = {
			event: "click",
			fnc: function() {
				modal.close();
			}
		};
		addListener(modal);
		modal.open();
		Modals.push(modal);
	}

	function addListener(modal) {
		// 点击遮罩关闭
		modal.options.backdrop && (modal.box.on("click." + modal.namespace, ".modal-shadow", function() {
			modal.close();
		}));

		// 行为注入
		$.each(modal.options.actions, function(selector, action) {
			action.prevent = action.prevent === false ? false : true;
			action.event = action.event || "click";
			modal.box.on(action.event + "." + modal.namespace, selector, function(evt) {
				action.prevent && (preventDefault(evt));
				action.fnc && $.isFunction(action.fnc) && action.fnc.call($(this), modal, evt);
			});
		});
	}



	Modal.prototype.open = function() {
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
	Modal.prototype.close = function() {
		var modal = this;
		this.active = false;
		this.box.find(".modal-inner").removeClass("in");
		setTimeout(function() {
			modal.box.off("." + modal.namespace).remove();
			var length = $(".modal-backdrop ").length;
			if (length === 0) {
				$(document.body).removeClass("modal-open");
			}
		}, 200);

		Modals.remove(this); // 从队列中删除该modal
		execute(this.options.destroy); // 执行关闭回调
	};
	Modal.prototype.destroy = function() {
		this.close();
	};
	Modal.prototype.toggle = function() {
		this[this.active ? "close" : "open"]();
	};
	Modal.prototype.html = function(html) {
		var modal = this;
		this.box.find(".modal-content.content").html(html);
		// if (this.options.position == "center") {
		// 	setTimeout(function() {
		// 		modal.locate();
		// 	}, 100);
		// }
	};
	Modal.prototype.locate = function() {
		var modal = this;
		var winHeight = $(window).height();
		var $content = modal.box.find(".modal-dialog");
		var height = $content.height();

		$content.css({
			marginTop: (height < (winHeight - 50) ? ((winHeight - height) / 2) : 10) + modal.options.offsetY
		});
	};


	Modal.prototype.addAction = function(selector, eventType, fnc, prevent) {
		var _this = this;
		prevent = prevent === false ? false : true;
		_this.box.on(eventType + "." + _this.namespace, selector, function(evt) {
			prevent && (preventDefault(evt));
			fnc.call($(this), _this, evt);
		});
	};

	// 返回modal集合
	Modal.prototype.getModals = function() {
		return Modals;
	};
	// 关闭所有modal
	Modal.prototype.clear = function() {
		while (Modals.length > 0) {
			Modals[0].close();
		}
	};


	module.exports = function(options) {
		return new Modal(options);
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
});