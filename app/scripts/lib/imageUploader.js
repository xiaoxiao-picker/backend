
// OA暂时不使用html5上传
define(function(require, exports, module) {
	var Helper = require("helper");

	var compress = { // 质量压缩法
		quality: function(image, quality, format) {
			var mimeType = "image/jpeg";
			if (format == "png") {
				mimeType = "image/png";
			}
			var canvas = document.createElement("canvas");
			canvas.width = image.naturalWidth;
			canvas.height = image.naturalHeight;
			var context = canvas.getContext("2d");
			context.drawImage(image, 0, 0);
			image = null;
			var imageData = canvas.toDataURL(mimeType, quality / 100);
			var newImage = new Image();

			newImage.src = imageData;
			return newImage;
		},
		size: function(image, size, format) {
			var mimeType = "image/jpeg";
			if (format == "png") {
				mimeType = "image/png";
			}
			var maxWidth = size.maxWidth;
			var maxHeight = size.maxHeight;

			var canvas = document.createElement("canvas");
			image.width *= maxHeight / image.height;
			image.height = maxHeight;
			canvas.width = image.width;
			canvas.height = image.height;
			var context = canvas.getContext("2d");
			context.drawImage(image, 0, 0, image.width, image.height);
			image = null;
			var imageData = canvas.toDataURL(mimeType);
			var newImage = new Image();

			newImage.src = imageData;
			return newImage;
		}
	};

	function ImageUploader($input, compressType) {
		if (!window.FileReader) {
			Helper.alert("由于您当前浏览器版本太低不支持H5上传，请使用现代浏览器使用本系统！！！");
			return;
		}
		this.input = $input;
		this.compressType = compressType;
		init(this);
	}

	function init(uploader) {
		var input = uploader.input;
		var compressType = uploader.compressType;
		input.on("change.image.uploader", function() {
			var files = input.get(0).files;
			var stimes = new Array(files.length);
			for (var i = 0, file; i < files.length; i++) {
				file = files[i];
				if (!file.type.match("image/*")) {
					continue;
				}

				stimes[i] = new Date().getTime();
				var reader = new FileReader();
				reader.onload = (function(index) {
					return function(e) {
						var image = new Image();
						// image.width=winWidth;
						// image.height=winHeight;
						image.src = e.target.result;
						// var newImage=compress(image,1);
						// newImage.width=winWidth;
						var newImage = compress[compressType](image, 500);
						document.body.appendChild(newImage);
						// alert(newImage);
						// alert(new Date().getTime()-stimes[index]);
					}
				})(i);
				reader.readAsDataURL(file);

			}
		});
	}

	module.exports = function(input, compressType) {
		return new ImageUploader(input, compressType);
	};
});