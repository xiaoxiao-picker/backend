// 颜色选择器
define(function(require, exports, module) {
	var colorsObj = require("scripts/config/colors");
	var Color = require("Color");
	var Helper = require("helper");
	var template = require("template");


	function Picker(options) {
		options = $.extend({
			title: "选择颜色",
			value: "",
			format: "RGBA",
			groups: ["red", "pink", "purple", "deeppurple", "indigo", "blue", "lightblue", "cyan", "teal", "green", "lightgreen", "lime", "yellow", "amber", "orange", "deeporange", "brown", "gray", "bluegray"], // 颜色
		}, options);

		options.className = "width-500 " + options.format;
		var modal = Helper.modal(options);
		modal.colorGroups = getColorGroups(options.groups);
		addListener(modal);
		render(modal);
	};

	function render(picker) {
		var color = Color[picker.options.format](picker.options.value).get();
		picker.color = color;
		picker.html(template("app/templates/public/color-picker/box", {
			color: color,
			groups: picker.colorGroups
		}));
	};



	function addListener(picker) {
		picker.addAction(".color", "click", function() {
			var colorBox = $(this);
			colorBox.parents(".colors-box").find(".color").removeClass("active");
			colorBox.addClass("active");
			// color值由颜色和透明度共同决定
			picker.color.R = +colorBox.attr("data-r");
			picker.color.G = +colorBox.attr("data-g");
			picker.color.B = +colorBox.attr("data-b");
		});
		picker.addAction(".BtnSubmit", "click", function() {
			picker.options.select && $.isFunction(picker.options.select) && picker.options.select.call(picker, picker.color);
		});

		picker.addAction(".BtnCancel", "click", function() {
			picker.options.cancel && $.isFunction(picker.options.cancel) && picker.options.cancel.call(picker);
		});

		if (picker.options.format == "RGBA") {
			picker.addAction("input[type=range]", "change", function() {
				var alpha = +$(this).val();
				if (alpha > 100 || alpha < 0) {
					Helper.errorToast("透明度取值范围必须在0-100之间！");
					return;
				}
				picker.box.find("#LabelOpacity").text(alpha + "%");
				picker.color.A = alpha / 100;
				picker.color.O = alpha;
			});
		}
	};

	function getColorGroups(groups) {
		var colorGroups = [];
		$(groups).each(function(idx, group) {
			colorGroups.push(colorsObj[group]());
		});
		return colorGroups;
	};

	module.exports = Picker;
});