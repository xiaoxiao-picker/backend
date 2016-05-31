define(function(require, exports, module) {
	require("plugins/zeroclipboard/ZeroClipboard");
	var Helper = require("helper");

	module.exports = function(url, options) {
		options = $.extend({
			title: "图片查看",
			loading: false,
			offsetY: -80,
			description: ""
		}, options);
		var html = "<div class='center'><img class='image' src='./images/spinner.gif' /></div><footer class='center text-gray'>" + options.description + "<div class='buttons' style='padding-top:15px;'><button id='CopyUrl' class='btn btn-xx-green' data-clipboard-text=" + url + ">复制网址</button></div></footer>";

		var modal = Helper.modal(options);
		modal.html(html);
		Helper.copyClientboard(document.getElementById("CopyUrl"));

		var image = new Image();
		var imageURL = Helper.generateQRCode(url, App.getSession());
		image.src = imageURL;
		image.onload = function() {
			modal.box.find("img.image").attr("src", imageURL);
			modal.locate();
		};
		return modal;
	};
});