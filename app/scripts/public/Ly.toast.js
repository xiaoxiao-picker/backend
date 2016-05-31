/**
 * 模仿android toast 提示
 */
define(function(require, exports, module) {
	var toastNumber = 0;
	var Toast = function() {
		this.options = {
			delay: 1000,
			theme: 'default', //['default','theme','success','danger']
			position: 'right' //['left','center','right']
		};
	};
	Toast.prototype.init = function(message, options) {
		var _this = this;
		_this.message = message;
		_this.options = $.extend(_this.options, options);
	};
	Toast.prototype.createHTML = function() {
		var messageBox = $('<div class="ly-toast-box-container" style="top:' + (10 + toastNumber * 40) + 'px"></div>');
		// var messageBox = $('<div class="ly-toast-box-container unselect"></div>');
		var html = ['<div class="ly-toast-box ' + this.options.theme + ' ' + this.options.position + '" >',
			'<div class="ly-toast-box-body">',
			this.message,
			'</div>',
			'</div>',
			'</div>'
		].join('');
		messageBox.html(html);
		this.messageBox = messageBox;
		this.eventListener();
	};
	Toast.prototype.eventListener = function() {
		var _this = this,
			delay, timer;
		_this.messageBox.on('mouseover', '.ly-toast-box-body', function() {
			clearTimeout(timer);
		}).on('mouseout', '.ly-toast-box-body', function() {
			autoclose();
		});
		delay = _this.options.delay;
		autoclose();

		function autoclose() {
			delay && (timer = setTimeout(function() {
				_this.messageBox.animate({
					top: -10,
					opacity: 0
				}, 1000, 'swing', function() {
					_this.messageBox.off('mouseover').off('mouseout').remove();
				});
				toastNumber--;
			}, delay));
		}
	};

	Toast.prototype.render = function(message, options) {
		this.init(message, options);
		this.createHTML();
		this.messageBox.appendTo(document.body);
		toastNumber++;
	};

	exports.toast = function(message, options) {
		(new Toast()).render(message, options)
	};
});