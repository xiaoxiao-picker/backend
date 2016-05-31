/**
 *	图片裁剪工具
 */
define(function(require, exports, module) {
	require("plugins/jcrop/js/jquery.Jcrop.min");
	require("plugins/jcrop/css/jquery.Jcrop.min.css");

	var Helper = require("helper");
	var flash = require("scripts/lib/flash");
	var PublicService = require("PublicService");
	var template = require("template");

	var boxTemp = "app/templates/public/image-crop/box";

	var jcrop_api;

	var ImageCrop = function(imageUrl, options) {
		options = $.extend({
			title: "上传图片",
			action: "",
			tips: "",
			preview: false, //是否需要预览
			orientation: "vertical", //默认为竖屏 thwartwise  vertical
			jcrop: { // jcrop 的配置信息
				previewWidth: 100,
				previewHeight: 100,
				borderRadius: false
			}
		}, options);

		var modal = Helper.modal(options);
		modal.image = {
			url: imageUrl,
			key: getImageKey(imageUrl)
		};
		render(modal);

		return modal;
	}

	function render(imagecrop) {

		imagecrop.html(template(boxTemp, {
			options: imagecrop.options,
			imageUrl: imagecrop.image.url
		}));

		jcropListenser(imagecrop);
		addListener(imagecrop);
	};

	/**
	 *	图片裁剪事件监听
	 */
	function jcropListenser(imagecrop) {
		if (jcrop_api) {
			jcrop_api.destroy();
		}
		var boundx, boundy;
		var $preview = $('#Preview_Pane');
		var $pcnt = $preview.find('.preview-container');
		var $pimg = $pcnt.find('img');
		var xsize = $pcnt.width();
		var ysize = $pcnt.height();
		$("#ImageCrop_Image").Jcrop({
			onChange: updatePreview,
			onSelect: updatePreview,
			onRelease: release,
			aspectRatio: imagecrop.options.jcrop.aspectRatio,
			boxWidth: imagecrop.options.orientation == "thwartwise" ? 350 : 535,
			boxHeight: 295
		}, function() {
			jcrop_api = this;
			// Use the API to get the real image size
			var bounds = this.getBounds();
			boundx = bounds[0];
			boundy = bounds[1];
			var w = imagecrop.options.jcrop.previewWidth;
			var h = imagecrop.options.jcrop.previewHeight;
			var point1 = {
				x: boundx / 4, //(boundx - w) / 2,
				y: boundy / 4 //(boundy - h) / 2
			};
			var point2 = {
				x: boundx / 2, //(boundx - w) / 2 + w,
				y: boundy / 2 //(boundy - h) / 2 + h
			};
			jcrop_api.animateTo([point1.x, point1.y, point2.x, point2.y]);

		});

		function updatePreview(c) {
			if (parseInt(c.w) > 0) {
				var rx = xsize / c.w;
				var ry = ysize / c.h;

				$pimg.css({
					width: Math.round(rx * boundx) + 'px',
					height: Math.round(ry * boundy) + 'px',
					marginLeft: '-' + Math.round(rx * c.x) + 'px',
					marginTop: '-' + Math.round(ry * c.y) + 'px'
				});

				imagecrop.image.x1 = Math.round(c.x);
				imagecrop.image.y1 = Math.round(c.y);
				imagecrop.image.x2 = Math.round(c.x2);
				imagecrop.image.y2 = Math.round(c.y2);
				imagecrop.image.w = Math.round(c.w);
				imagecrop.image.h = Math.round(c.h);
			}
		};

		function release() {
			imagecrop.image.x1 = 0;
			imagecrop.image.y1 = 0;
			imagecrop.image.x2 = 0;
			imagecrop.image.y2 = 0;
			imagecrop.image.w = 0;
			imagecrop.image.h = 0;
		}
	};

	/**
	 *	事件监听
	 */
	function addListener(imagecrop) {
		// 保存
		imagecrop.addAction("#ImageCrop_Btn", "click", function() {
			var _btn = $(this);

			var validateResult = validate(imagecrop);
			if (validateResult.status != "SUCCESS") {
				Helper.alert(validateResult.message);
				return;
			}
			Helper.begin(_btn);
			PublicService.imageUpload2(imagecrop.image).done(function(data) {
				var imageUrl = data.result;
				imagecrop.options.cut && $.isFunction(imagecrop.options.cut) && imagecrop.options.cut.call(imagecrop, imageUrl);
			}).fail(function(error) {
				Helper.alert(error);
			}).always(function() {
				Helper.end(_btn);
			});

		});
	}

	/**
	 *	检测属性值
	 */
	function validate(imagecrop) {
		var image = imagecrop.image;
		if (!image.key) {
			return {
				status: "ERROR",
				message: "图片不存在！"
			};
		}
		if (!image.w || !image.h) {
			return {
				status: "ERROR",
				message: "选区不能为空！"
			};
		}
		return {
			status: "SUCCESS"
		};
	}

	/**
	 *	获取图片key
	 */
	function getImageKey(url) {
		if (!url) return null;
		var Reg = new RegExp("http\\:\\/\\/img\\.xiaoxiao\\.la[\\/]+([\\w\\d-]+\\.[\\w]+)[\\@]?");
		var result = url.match(Reg);
		return result ? result[1] : null;
	}


	module.exports = ImageCrop;
});