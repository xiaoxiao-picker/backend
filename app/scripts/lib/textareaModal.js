define(function(require, exports, module) {
	var template = require('template');
	var Helper = require("helper");

	function Modal(options) {
		options = $.extend({
			title: "多行文本框",
			placeholder: "请输入内容",
			text: "",
			rows: 5,
			maxLength: -1,
			backdrop: false,
			submit: function() {}
		}, options);

		var modal = Helper.modal(options);

		(function init() {
			modal.html(template("app/templates/public/textarea-modal/info", options));


			var $context = modal.box.find("#Context");
			modal.addAction(".btn-submit", "click", function() {
				var context = $context.val();
				var $btn = $(this);
				options.submit && $.isFunction(options.submit) && options.submit.call(modal, context, $btn);
			});

			if (options.maxLength > 0) {
				var $remain = modal.box.find(".remain");
				modal.addAction("#Context", "change", validateContext);
				modal.addAction("#Context", "keyup", validateContext);

				validateContext();
			}

			function validateContext() {
				var text = $context.val();
				if (text.length > options.maxLength) {
					text = text.substr(0, options.maxLength);
					$context.val(text);
				}
				$remain.text(options.maxLength - text.length);
			}
		})();
	}

	module.exports = function(options) {
		return new Modal(options);
	};
});