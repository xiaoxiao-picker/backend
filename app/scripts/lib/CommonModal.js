define(function(require, exports, module) {
	var template = require('template');
	var Helper = require("helper");

	exports.singleInputModal = function(options) {
		var _options = $.extend({
			title: options.title,
			actions: {
				'.btn-save': {
					event: 'click',
					fnc: options.action
				}
			}
		});

		var modal = Helper.modal(_options);
		modal.html(template('app/templates/public/single-input-modal', options));

		// 输入框获取焦点
		setTimeout(function() {
			var $input = modal.box.find("input.form-control");
			var input = $input.get(0);
			if (input.setSelectionRange) {
				input.setSelectionRange(input.value.length, input.value.length);
				input.focus();
			}
		}, 500);

		return modal;
	};

});