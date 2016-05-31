// 颜色、或图片选择器
// 一般作手机背景设置用
define(function(require, exports, module) {
	var colorsObj = require("scripts/config/colors");
	var Color = require("Color");
	var Helper = require("helper");

	var PublicService = require("PublicService");

	var template = require("template");


	function Picker(options) {
		options = $.extend({
			title: "背景设置",
			type: "color", // color,image
			value: "",
			colorFormat: "RGB", // RGB,RGBA
			colorGroupNames: ["red", "pink", "purple", "deeppurple", "indigo", "blue", "lightblue", "cyan", "teal", "green", "lightgreen", "lime", "yellow", "amber", "orange", "deeporange", "brown", "gray", "bluegray"], // 颜色
			className:"color-image-selector"
		}, options);

		var modal = Helper.modal(options);
		modal.type = options.type;

		if (modal.type == "color") {
			modal.color = Color[options.colorFormat](options.value).get();
			modal.image = "";
		} else if (modal.type == "image") {
			modal.color = {
				R: 224,
				G: 0,
				B: 50
			};
			modal.image = options.value;
		}
		modal.colorGroups = getColorGroups(options.colorGroupNames);

		modal.html(template("app/templates/public/color-image-picker/box", {}));
		addListener(modal);
		render(modal);

		return modal;
	};

	function render(picker) {
		if (picker.type == "color") {
			picker.box.find("#SwitchColor").addClass("active").siblings("li").removeClass("active");
			renderColor(picker);
		} else if (picker.type == "image") {
			picker.box.find("#SwitchImage").addClass("active").siblings("li").removeClass("active");
			renderImage(picker);
		} else {
			Helper.alert("错误的类型：" + picker.type);
		}
	};


	function renderColor(picker) {
		picker.box.find(".background-box").html(template("app/templates/public/color-image-picker/color", {
			color: picker.color,
			groups: picker.colorGroups
		}));
	};

	function renderImage(picker) {
		picker.box.find(".background-box").html(template("app/templates/public/color-image-picker/image", {
			image: picker.image
		}));
	};

	function addListener(picker) {
		picker.addAction("#SwitchColor", "click", function() {
			if (picker.type == "color") return;
			picker.type = "color";
			render(picker);
		});
		picker.addAction("#SwitchImage", "click", function() {
			if (picker.type == "image") return;
			picker.type = "image";
			render(picker);
		});
		// 背景图上传
		picker.addAction("#BtnBackImageUpload", "click", function() {
			require.async("ImageSelector", function(ImageSelector) {
				ImageSelector({
					title: "上传图片",
					image: picker.image ? picker.image : "",
					crop: {
						orientation: "thwartwise",
						preview: true,
						aspectRatio: 375 / 667,
						previewWidth: 125,
						previewHeight: 222
					},
					cut: function(image) {
						picker.image = image;
						picker.box.find("#BackgroundImage").css("backgroundImage", "url(" + image + ")");
						this.destroy();
					},
					choose: function(images) {
						picker.image = images[0];
						picker.box.find("#BackgroundImage").css("backgroundImage", "url(" + images[0] + ")");
						this.destroy();
					}
				});
			});
		});
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
			var value;
			if (picker.type == "color")
				value = picker.color;
			else if (picker.type == "image")
				value = picker.image;
			else {
				Helper.alert("错误的类型：" + picker.type);
				return;
			}
			picker.options.confirm && $.isFunction(picker.options.confirm) && picker.options.confirm.call(picker, picker.type, value);
		});
		picker.addAction(".BtnCancel", "click", function() {
			picker.options.cancel && $.isFunction(picker.options.cancel) && picker.options.cancel.call(picker);
		});



		if (picker.options.colorFormat == "RGBA") {
			picker.addAction("input[type=range]", "change", function() {
				var alpha = +$(this).val();
				if (alpha > 100 || alpha < 0) {
					Helper.errorToast("透明度取值范围必须在0-100之间！");
					return;
				}
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