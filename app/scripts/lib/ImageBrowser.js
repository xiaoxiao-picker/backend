/**
 *	图片浏览器
 */
define(function(require, exports, module) {
	var	Helper = require("helper");
	var template = require("template");

	var boxTemp = "app/templates/public/image-browser/box";

	var ImageBrowser = function(pictures, options) {
		this.namespace = "image-browser";
		this.template = options.template || template;
		this.container = options.container || $(document.body);
		this.box = options.box || $(this.template('app/templates/public/shadow-box', {}));
		this.pictures = pictures;
		this.options = $.extend({
			currenIndex: 0,			//当前查看图片索引
		}, options);

		render(this);
	}

	function render(browser) {
		var curPicture = browser.pictures[browser.options.currenIndex];

		browser.container.append(browser.box);

		browser.box.find(".inner-box").html(browser.template(boxTemp, {
			picture: curPicture,
			currenIndex: +browser.options.currenIndex,
			count: browser.pictures.length
		}));

		addListener(browser);
	}

	function addListener(browser) {

		//关闭按钮
		browser.box.on('click.' + browser.namespace, '.btn-close', function(evt) {

			browser.destroy();
		});

		//点击遮罩关闭
		browser.box.on('click.' + browser.namespace, '.box-bg', function(evt) {
			
			browser.destroy();
		});

		//查看上一个
		browser.box.on('click.' + browser.namespace, '.btn-last', function(evt) {

			var _btn = $(this);
			var count = browser.pictures.length;

			if (!browser.options.currenIndex) {
				return;
			}

			browser.options.currenIndex--;
			if (!browser.options.currenIndex) {
				_btn.addClass('disabled');
			}

			var nextBtn = browser.box.find(".btn-next");
			if (browser.options.currenIndex < count - 1 && nextBtn.hasClass('disabled')) {
				nextBtn.removeClass('disabled');
			}

			renderImage();
		});

		//查看下一个
		browser.box.on('click.' + browser.namespace, '.btn-next', function(evt) {

			var _btn = $(this);
			var count = browser.pictures.length;

			if (browser.options.currenIndex == count - 1) {
				return;
			}
			
			browser.options.currenIndex++;
			if (browser.options.currenIndex == count - 1) {
				_btn.addClass('disabled');
			}

			var lastBtn = browser.box.find(".btn-last");
			if (browser.options.currenIndex && lastBtn.hasClass('disabled')) {
				lastBtn.removeClass('disabled');
			}

			renderImage();
		});

		function renderImage() {
			browser.container.find('#CurrentPage').text(browser.options.currenIndex + 1);

			var curPicture = browser.pictures[browser.options.currenIndex];
			browser.container.find("#ImageWrapper").attr('src', curPicture.imageUrl);
		}

		//点击图片
		browser.box.on('click.' + browser.namespace, '#ImageWrapper', function(evt) {
			preventDefault(evt);
			
		});
	}

	ImageBrowser.prototype.destroy = function() {
		var browser = this;
		browser.box.off("." + browser.namespace);
		browser.box.remove();
		browser = null;
	}

	function preventDefault(event) {
		event = event || window.event;
		if (event.preventDefault)
			event.preventDefault();
		else
			event.returnValue = false;

		if(event.stopPropagation)
			event.stopPropagation();
	};

	module.exports = function(pictures, options) {
		return new ImageBrowser(pictures, options);
	}
});