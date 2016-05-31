/**
 * 文本光标控制器
 */
define(function(require, exports, module) {

	function cursorControl(element, namespace) {
		this.element = element;
		this.namespace = namespace;
		this.range = !1;
		this.start = 0;
		this.init();
	};

	cursorControl.prototype = {
		init: function() {
			var _that = this;
			$(_that.element).on("keyup." + _that.namespace, function() {
				this.focus();
				if (document.all) {
					_that.range = document.selection.createRange();
				} else {
					_that.start = _that.getStart();
				}
			});
			$(_that.element).on("mouseup." + _that.namespace, function() {
				this.focus();
				if (document.all) {
					_that.range = document.selection.createRange();
				} else {
					_that.start = _that.getStart();
				}
			});
		},
		getType: function() {
			return Object.prototype.toString.call(this.element).match(/^\[object\s(.*)\]$/)[1];
		},
		getStart: function() {
			if (this.element.selectionStart || this.element.selectionStart == '0') {
				return this.element.selectionStart;
			} else if (window.getSelection) {
				var rng = window.getSelection().getRangeAt(0).cloneRange();
				rng.setStart(this.element, 0);
				return rng.toString().length;
			}
		},
		insertText: function(text) {
			var _that = this;
			this.element.focus();

			if (document.all) {
				document.selection.empty();
				this.range.text = text;
				this.range.collapse();
				this.range.select();
			} else {
				if (this.getType() == 'HTMLDivElement') {
					this.element.innerHTML = this.element.innerHTML.substr(0, this.start) + text + this.element.innerHTML.substr(this.start);
				} else {
					this.element.value = this.element.value.substr(0, this.start) + text + this.element.value.substr(this.start);
					$(this.element).trigger("change");
				};
			}
			_that.start += text.length;
			_that.setCursorPosition(_that.start);
		},
		getText: function() {
			if (document.all) {
				var r = document.selection.createRange();
				document.selection.empty();
				return r.text;
			} else {
				if (this.element.selectionStart || this.element.selectionStart == '0') {
					var text = this.getType() == 'HTMLDivElement' ? this.element.innerHTML : this.element.value;
					return text.substring(this.element.selectionStart, this.element.selectionEnd);
				} else if (window.getSelection) {
					return window.getSelection().toString()
				};
			}
		},
		setCursorPosition: function(pos) {
			var _element = this.element;
			if (_element.setSelectionRange) {
				_element.focus();
				_element.setSelectionRange(pos, pos);
			} else if (_element.createTextRange) {
				var range = _element.createTextRange();
				range.collapse(true);
				range.moveEnd('character', pos);
				range.moveStart('character', pos);
				range.select();
			}
		}
	};

	module.exports = cursorControl;
});