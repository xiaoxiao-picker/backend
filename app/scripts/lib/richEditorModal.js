define(function(require, exports, module) {
	var Helper = require("helper");
	var template = require("template");

	var RichTextEditor = require("ueditor");
	var editor;

	function Modal(options) {
		options = $.extend({
			title: "富文本编辑器",
			zIndex: 10040,
			text: "",
			backdrop: false,
			destroy: function() {
				editor.destroy();
			}
		}, options);
		var modal = Helper.modal(options);

		render(modal);

		return modal;
	}

	function render(modal) {
		modal.html(template("app/templates/public/rich-editor/info", modal.options));
		addListener(modal);
	}

	function addListener(modal) {
		editor = RichTextEditor.init("RichEditorContext");

		modal.addAction(".btn-submit", "click", function() {
			var btn = $(this);
			var text = $.trim(editor.getContent());
			modal.options.submit && $.isFunction(modal.options.submit) && modal.options.submit.call(modal, text, btn);
		});
	};

	module.exports = function(options) {
		return new Modal(options);
	};
});