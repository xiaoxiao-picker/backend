define(function(require, exports, module) {
	function Menu(code, name, type, backImage, backColor, icon, url, param) {
		this.code = code;
		this.name = name;
		this.type = type;
		this.backImage = backImage;
		this.backColor = backColor;
		this.icon = icon;
		this.url = url;
		this.param = param;
	};
	module.exports = Menu;
});