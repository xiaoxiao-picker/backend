// 日期控件组
define(function(require, exports, module) {
	require("datetimepicker");
	var Helper = require("helper");

	function Group(container, options) {
		options = $.extend({
			minErrorText: "",
			maxErrorText: ""
		}, options);
		var minInput = container.find(".datetimepicker.min");
		var maxInput = container.find(".datetimepicker.max");

		container.find(".datetimepicker").datetimepicker().on("changeDate", function(evt) {
			var targetType = $(this).hasClass("min") ? "MIN" : "MAX";
			var minDate = new Date(minInput.val()).getTime();
			var maxDate = new Date(maxInput.val()).getTime();

			if (minDate > maxDate) {
				if (targetType == "MIN") {
					minInput.val("");
					Helper.errorToast(options.minErrorMessage);
				} else {
					maxInput.val("");
					Helper.errorToast(options.maxErrorMessage);
				}
			}
		});
	}

	module.exports = Group;
});