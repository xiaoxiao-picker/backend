define(function(require, exports, module) {
	// 默认上墙皮肤
	function getSkins() {
		return [{
			name: "xunyicao",
			type: "official", // 官方皮肤
			backImg: "http://img.xiaoxiao.la/xx_sys_bg01.jpg",
			backCss: "bacground-color:#fff;",
			fontColor: "#fff",
			selected: false
		}, {
			name: "earth",
			type: "official", // 官方皮肤
			backImg: "http://img.xiaoxiao.la/xx_sys_bg02.jpg",
			backCss: "bacground-color:#fff;",
			fontColor: "#fff",
			selected: false
		}, {
			name: "chouxiang",
			type: "official", // 官方皮肤
			backImg: "http://img.xiaoxiao.la/xx_sys_bg03.jpg",
			backCss: "bacground-color:#fff;",
			fontColor: "#fff",
			selected: false
		}, {
			name: "caodi",
			type: "official", // 官方皮肤
			backImg: "http://img.xiaoxiao.la/xx_sys_bg04.jpg",
			backCss: "bacground-color:#fff;",
			fontColor: "#fff",
			selected: false
		}, {
			name: "gouweibacao",
			type: "official", // 官方皮肤
			backImg: "http://img.xiaoxiao.la/xx_sys_bg05.jpg",
			backCss: "bacground-color:#fff;",
			fontColor: "#fff",
			selected: false
		}, {
			name: "xiangrikui",
			type: "official", // 官方皮肤
			backImg: "http://img.xiaoxiao.la/xx_sys_bg06.jpg",
			backCss: "bacground-color:#fff;",
			fontColor: "#fff",
			selected: false
		}, {
			name: "custom",
			type: "custom", // 自定义皮肤
			backImg: "",
			backCss: "bacground-color:#fff;",
			fontColor: "#fff",
			selected: false
		}];
	};

	// 获取官方皮肤
	exports.getSkins = getSkins;

	// 根据属性和值获取官方皮肤
	exports.get = function(key, value) {
		var skins = getSkins();
		for (var i = 0, len = skins.length; i < len; i++) {
			if (skins[i][key] === value) {
				return skins[i];
			}
		}
		return null;
	};
});