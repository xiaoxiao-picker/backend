define(function(require, exports, module) {

	/**
	 *
	 * 使用日期选择器时时间之间需要有大小比较
	 * 这个方法耦合太高了，有时间好好优化下
	 * --TODO
	 */
	exports.compare = function(_input, errorToast) {
		// date 为时间戳格式
		var date=new Date(_input.val()).getTime();
		var targetId = _input.attr("data-targetId"),
			rule = _input.attr("data-compare-rule"),
			tips = _input.attr("data-compare-tips");

		if (!targetId || !rule) {
			return;
		}

		var targetDate = $("#" + targetId).val();

		if (targetDate == "") {
			return;
		}
		targetDate = new Date(targetDate).getTime();

		if (rule == "less") {
			if (date > targetDate) {
				errorToast(tips || "");
				_input.val("");
				return;
			}
		} else if (rule == "more") {
			if (date < targetDate) {
				_input.val("");
				errorToast(tips || "");
				return;
			}
		}
	};
});