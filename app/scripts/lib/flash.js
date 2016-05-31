define(function(require, exports, module) {
	function browser() {
		return {
			IE: navigator.userAgent.indexOf("MSIE") != -1,
			Firefox: navigator.userAgent.indexOf("Firefox") != -1,
			Chrome: navigator.userAgent.indexOf("Chrome") != -1,
			Safari: navigator.userAgent.indexOf("Safari") != -1,
			Opera: navigator.userAgent.indexOf("Opera") != -1
		};
	};

	function flashChecker() {
		var hasFlash = 0; //是否安装了flash
		var flashVersion = 0; //flash版本

		if (browser().IE) {
			var swf = new ActiveXObject('ShockwaveFlash.ShockwaveFlash');
			if (swf) {
				hasFlash = 1;
				VSwf = swf.GetVariable("$version");
				flashVersion = parseInt(VSwf.split(" ")[1].split(",")[0]);
			}
		} else {
			if (navigator.plugins && navigator.plugins.length > 0) {
				var swf = navigator.plugins["Shockwave Flash"];
				if (swf) {
					hasFlash = 1;
					var words = swf.description.split(" ");
					for (var i = 0; i < words.length; ++i) {
						if (isNaN(parseInt(words[i]))) continue;
						flashVersion = parseInt(words[i]);
					}
				}
			}
		}
		return {
			hasFlash: hasFlash,
			version: flashVersion
		};
	};


	exports.checker = flashChecker;
});