define(function(require, exports, module) {
	var Helper = require("helper");
	var cursorController = require("scripts/lib/cursorController");


	var LinkBox = function(element, options) {
		this.namespace = "link-box";
		this.element = element;
		this.show = false;
		this.options = $.extend({}, options);

		init(this);
	};

	function init(linkbox) {
		linkbox.content = new cursorController(linkbox.element);
	}

	LinkBox.prototype.render = function(container) {
		var linkbox = this;
		linkbox.show = true;

		linkbox.box = $('<div id="linkContainer" class="link-wrapper" onclick="javascript:return false;"></div>');
		linkbox.box.append('<div class="title"><strong>添加超链接</strong></div><div class="form-body"><div class="form-group"><label><span>链接文字：</span><input class="xx-input-text linkName" type="text" value=""></label></div><div class="form-group"><label><span>链接地址：</span><input class="xx-input-text linkUrl" type="text" value="http://" placeholder="http://"></label></div></div><div class="buttons center"><button class="btn btn-xx-green addlink" style="margin-right: 20px;">添加</button><button class="btn btn-xx-red removelink">取消</button></div>');
		linkbox.box.appendTo(container);

		addListener(linkbox);
	};

	function addListener(linkbox) {

		linkbox.box.on("click." + linkbox.namespace, ".addlink", function(evt) {
			preventDefault(evt);
			var _btn = $(this);
			var _name = $.trim(_btn.parents(".link-wrapper").find(".linkName").val());
			var _url = $.trim(_btn.parents(".link-wrapper").find(".linkUrl").val());

			if (Helper.validation.isEmpty(_name)) {
				Helper.errorToast("链接文字不能为空！");
				return;
			}
			if (Helper.validation.isEmpty(_url)) {
				Helper.errorToast("链接地址不能为空！");
				return;
			}
			if (!Helper.validation.isUrl(_url)) {
				Helper.errorToast("链接地址格式不对！");
				return;
			}

			var link = '<a href="' + _url + '">' + _name + '</a>';
			linkbox.content.insertText(link);
			linkbox.destroy();
		});

		linkbox.box.on("click." + linkbox.namespace, ".removelink", function(evt) {
			preventDefault(evt);
			linkbox.destroy();
		});

		linkbox.box.on("click." + linkbox.namespace, function(evt) {
			preventDefault(evt);
			var target = $(this);
			if ($(evt.target).is(".link-wrapper") || $(evt.target).parents(".link-wrapper").length > 0) {
				return false;
			}
			linkbox.destroy();

		});
	};

	LinkBox.prototype.destroy = function() {
		var linkbox = this;
		linkbox.show = false;
		linkbox.box && linkbox.box.remove();
		linkbox.box.off("." + linkbox.namespace);
	};

	function preventDefault(event) {
		event=event||window.event;
		if (event.preventDefault)
			event.preventDefault();
		else
			event.returnValue = false;
	};

	module.exports = function(element, options) {
		return new LinkBox(element, options);
	};
});