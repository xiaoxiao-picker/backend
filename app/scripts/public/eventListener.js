/** 
 * 定义事件监听
 */
define(function(require, exports, module) {
	var formValidate = require("scripts/public/validation");
	/**
	 * 表单失去焦点验证
	 */
	exports.inputBlurValidation = function() {
		$(document).on("blur", "[data-validate-rule]", function() {
			var $this = $(this),
				_type = $this.attr("data-validate-type"),
				_rule = $this.attr("data-validate-rule"),
				_value = $this.val(),
				_tips = $this.attr("data-tips") || $this.attr("placeholder") || "该字段错误";
			formValidate.formValid(_value, _rule, function() {
				if (_type == "out") {
					$this.parents(".form-group").removeClass("has-error");
				} else {
					$this.parents(".form-group").removeClass("has-error");
				}
			}, function() {
				if (_type == "out") {
					$this.parents(".form-group").addClass("has-error");
				} else {
					$this.parents(".form-group").addClass("has-error");
				}
				$this.val("").attr("placeholder", _tips);
			});
		});
	};
	/**
	 * 上传事件监听
	 */
	exports.dragToUpload = function(namespace, uploadFnc) {
		$(document).on("change", ".input-upload", function() {
			var files = this.files;
			$.each(files, function(idx, item) {
				uploadFnc && $.isFunction(uploadFnc) && uploadFnc(item);
			});
		});
		$(document).on("dragleave", ".drag-to-upload", function(evt) {
			evt = evt || window.event;
			preventDefault(evt);
			evt.stopPropagation();
		});
		$(document).on("dragenter", ".drag-to-upload", function(evt) {
			evt = evt || window.event;
			preventDefault(evt);
			evt.stopPropagation();
		});
		$(document).on("dragover", ".drag-to-upload", function(evt) {
			evt = evt || window.event;
			preventDefault(evt);
			evt.stopPropagation();
		});
		$(document).on("drop", ".drag-to-upload", function(evt) {
			evt = evt || window.event;
			preventDefault(evt);
			evt.stopPropagation();
			var files = evt.dataTransfer.files[0];
			$.each(files, function(idx, item) {
				uploadFnc && $.isFunction(uploadFnc) && uploadFnc(item);
			});
		});
	};

	/**
	 * 全局事件监听函数
	 */
	exports.globalEventListener = globalEventListener;
	exports.eventListener = function(eventName, actions) {
		globalEventListener(eventName, "data-xx-action", actions);
	};
	exports.specifiedEventListener = function(container, eventName, dataEventAction, actions) {
		container.on(eventName, "[" + dataEventAction + "]", function(evt) {
			evt = evt || window.event;
			preventDefault(evt);
			var _this = $(this),
				actionName = _this.attr(dataEventAction),
				action = actions[actionName];
			action && $.isFunction(action) && action.call(_this, evt);
		});
	};

	function globalEventListener(eventName, dataEventAction, actions, prevent) {
		$(document).on(eventName, "[" + dataEventAction + "]", function(evt) {
			evt = evt || window.event;
			if (!prevent) preventDefault(evt);
			var _this = $(this),
				actionName = _this.attr(dataEventAction),
				action = actions[actionName];
			action && $.isFunction(action) && action.call(_this, evt);
		});
	};

	function preventDefault(event) {
		if (event.preventDefault)
			event.preventDefault();
		else
			event.returnValue = false;
	};
});