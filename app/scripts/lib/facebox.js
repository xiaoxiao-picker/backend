define(function(require, exports, module) {

	
	var cursorController = require("scripts/lib/cursorController");

	var faces = [{
		name: "微笑",
		gif: './../images/faces/e100.gif',
		className: 'face-1-1'
	}, {
		name: "撇嘴",
		gif: './../images/faces/e101.gif',
		className: 'face-1-2'
	}, {
		name: "色",
		gif: './../images/faces/e102.gif',
		className: 'face-1-3'
	}, {
		name: "发呆",
		gif: './../images/faces/e103.gif',
		className: 'face-1-4'
	}, {
		name: "得意",
		gif: './../images/faces/e104.gif',
		className: 'face-1-5'
	}, {
		name: "流泪",
		gif: './../images/faces/e105.gif',
		className: 'face-1-6'
	}, {
		name: "害羞",
		gif: './../images/faces/e106.gif',
		className: 'face-1-7'
	}, {
		name: "闭嘴",
		gif: './../images/faces/e107.gif',
		className: 'face-1-8'
	}, {
		name: "睡",
		gif: './../images/faces/e108.gif',
		className: 'face-1-9'
	}, {
		name: "大哭",
		gif: './../images/faces/e109.gif',
		className: 'face-1-10'
	}, {
		name: "尴尬",
		gif: './../images/faces/e110.gif',
		className: 'face-1-11'
	}, {
		name: "发怒",
		gif: './../images/faces/e111.gif',
		className: 'face-1-12'
	}, {
		name: "调皮",
		gif: './../images/faces/e112.gif',
		className: 'face-1-13'
	}, {
		name: "呲牙",
		gif: './../images/faces/e113.gif',
		className: 'face-1-14'
	}, {
		name: "惊讶",
		gif: './../images/faces/e114.gif',
		className: 'face-1-15'
	}, {
		name: "难过",
		gif: './../images/faces/e115.gif',
		className: 'face-2-1'
	}, {
		name: "酷",
		gif: './../images/faces/e116.gif',
		className: 'face-2-2'
	}, {
		name: "冷汗",
		gif: './../images/faces/e117.gif',
		className: 'face-2-3'
	}, {
		name: "抓狂",
		gif: './../images/faces/e118.gif',
		className: 'face-2-4'
	}, {
		name: "吐",
		gif: './../images/faces/e119.gif',
		className: 'face-2-5'
	}, {
		name: "偷笑",
		gif: './../images/faces/e120.gif',
		className: 'face-2-6'
	}, {
		name: "可爱",
		gif: './../images/faces/e121.gif',
		className: 'face-2-7'
	}, {
		name: "白眼",
		gif: './../images/faces/e122.gif',
		className: 'face-2-8'
	}, {
		name: "傲慢",
		gif: './../images/faces/e123.gif',
		className: 'face-2-9'
	}, {
		name: "饥饿",
		gif: './../images/faces/e124.gif',
		className: 'face-2-10'
	}, {
		name: "困",
		gif: './../images/faces/e125.gif',
		className: 'face-2-11'
	}, {
		name: "惊恐",
		gif: './../images/faces/e126.gif',
		className: 'face-2-12'
	}, {
		name: "流汗",
		gif: './../images/faces/e127.gif',
		className: 'face-2-13'
	}, {
		name: "憨笑",
		gif: './../images/faces/e128.gif',
		className: 'face-2-14'
	}, {
		name: "大兵",
		gif: './../images/faces/e129.gif',
		className: 'face-2-15'
	}, {
		name: "奋斗",
		gif: './../images/faces/e130.gif',
		className: 'face-3-1'
	}, {
		name: "咒骂",
		gif: './../images/faces/e131.gif',
		className: 'face-3-2'
	}, {
		name: "疑问",
		gif: './../images/faces/e132.gif',
		className: 'face-3-3'
	}, {
		name: "嘘",
		gif: './../images/faces/e133.gif',
		className: 'face-3-4'
	}, {
		name: "晕",
		gif: './../images/faces/e134.gif',
		className: 'face-3-5'
	}, {
		name: "折磨",
		gif: './../images/faces/e135.gif',
		className: 'face-3-6'
	}, {
		name: "衰",
		gif: './../images/faces/e136.gif',
		className: 'face-3-7'
	}, {
		name: "骷髅",
		gif: './../images/faces/e137.gif',
		className: 'face-3-8'
	}, {
		name: "敲打",
		gif: './../images/faces/e138.gif',
		className: 'face-3-9'
	}, {
		name: "再见",
		gif: './../images/faces/e139.gif',
		className: 'face-3-10'
	}, {
		name: "擦汗",
		gif: './../images/faces/e140.gif',
		className: 'face-3-11'
	}, {
		name: "抠鼻",
		gif: './../images/faces/e141.gif',
		className: 'face-3-12'
	}, {
		name: "鼓掌",
		gif: './../images/faces/e142.gif',
		className: 'face-3-13'
	}, {
		name: "糗大了",
		gif: './../images/faces/e143.gif',
		className: 'face-3-14'
	}, {
		name: "坏笑",
		gif: './../images/faces/e144.gif',
		className: 'face-3-15'
	}, {
		name: "左哼哼",
		gif: './../images/faces/e145.gif',
		className: 'face-4-1'
	}, {
		name: "右哼哼",
		gif: './../images/faces/e146.gif',
		className: 'face-4-2'
	}, {
		name: "哈欠",
		gif: './../images/faces/e147.gif',
		className: 'face-4-3'
	}, {
		name: "鄙视",
		gif: './../images/faces/e148.gif',
		className: 'face-4-4'
	}, {
		name: "委屈",
		gif: './../images/faces/e149.gif',
		className: 'face-4-5'
	}, {
		name: "快哭了",
		gif: './../images/faces/e150.gif',
		className: 'face-4-6'
	}, {
		name: "阴险",
		gif: './../images/faces/e151.gif',
		className: 'face-4-7'
	}, {
		name: "亲亲",
		gif: './../images/faces/e152.gif',
		className: 'face-4-8'
	}, {
		name: "吓",
		gif: './../images/faces/e153.gif',
		className: 'face-4-9'
	}, {
		name: "可怜",
		gif: './../images/faces/e154.gif',
		className: 'face-4-10'
	}, {
		name: "菜刀",
		gif: './../images/faces/e155.gif',
		className: 'face-4-11'
	}, {
		name: "西瓜",
		gif: './../images/faces/e156.gif',
		className: 'face-4-12'
	}, {
		name: "啤酒",
		gif: './../images/faces/e157.gif',
		className: 'face-4-13'
	}, {
		name: "篮球",
		gif: './../images/faces/e158.gif',
		className: 'face-4-14'
	}, {
		name: "乒乓",
		gif: './../images/faces/e159.gif',
		className: 'face-4-15'
	}, {
		name: "咖啡",
		gif: './../images/faces/e160.gif',
		className: 'face-5-1'
	}, {
		name: "饭",
		gif: './../images/faces/e161.gif',
		className: 'face-5-2'
	}, {
		name: "猪头",
		gif: './../images/faces/e162.gif',
		className: 'face-5-3'
	}, {
		name: "玫瑰",
		gif: './../images/faces/e163.gif',
		className: 'face-5-4'
	}, {
		name: "凋谢",
		gif: './../images/faces/e164.gif',
		className: 'face-5-5'
	}, {
		name: "示爱",
		gif: './../images/faces/e165.gif',
		className: 'face-5-6'
	}, {
		name: "爱心",
		gif: './../images/faces/e166.gif',
		className: 'face-5-7'
	}, {
		name: "心碎",
		gif: './../images/faces/e167.gif',
		className: 'face-5-8'
	}, {
		name: "蛋糕",
		gif: './../images/faces/e168.gif',
		className: 'face-5-9'
	}, {
		name: "闪电",
		gif: './../images/faces/e169.gif',
		className: 'face-5-10'
	}, {
		name: "炸弹",
		gif: './../images/faces/e170.gif',
		className: 'face-5-11'
	}, {
		name: "刀",
		gif: './../images/faces/e171.gif',
		className: 'face-5-12'
	}, {
		name: "足球",
		gif: './../images/faces/e172.gif',
		className: 'face-5-13'
	}, {
		name: "瓢虫",
		gif: './../images/faces/e173.gif',
		className: 'face-5-14'
	}, {
		name: "便便",
		gif: './../images/faces/e174.gif',
		className: 'face-5-15'
	}, {
		name: "月亮",
		gif: './../images/faces/e175.gif',
		className: 'face-6-1'
	}, {
		name: "太阳",
		gif: './../images/faces/e176.gif',
		className: 'face-6-2'
	}, {
		name: "礼物",
		gif: './../images/faces/e177.gif',
		className: 'face-6-3'
	}, {
		name: "拥抱",
		gif: './../images/faces/e178.gif',
		className: 'face-6-4'
	}, {
		name: "强",
		gif: './../images/faces/e179.gif',
		className: 'face-6-5'
	}, {
		name: "弱",
		gif: './../images/faces/e180.gif',
		className: 'face-6-6'
	}, {
		name: "握手",
		gif: './../images/faces/e181.gif',
		className: 'face-6-7'
	}, {
		name: "胜利",
		gif: './../images/faces/e182.gif',
		className: 'face-6-8'
	}, {
		name: "抱拳",
		gif: './../images/faces/e183.gif',
		className: 'face-6-9'
	}, {
		name: "勾引",
		gif: './../images/faces/e184.gif',
		className: 'face-6-10'
	}, {
		name: "拳头",
		gif: './../images/faces/e185.gif',
		className: 'face-6-11'
	}, {
		name: "差劲",
		gif: './../images/faces/e186.gif',
		className: 'face-6-12'
	}, {
		name: "爱你",
		gif: './../images/faces/e187.gif',
		className: 'face-6-13'
	}, {
		name: "NO",
		gif: './../images/faces/e188.gif',
		className: 'face-6-14'
	}, {
		name: "OK",
		gif: './../images/faces/e189.gif',
		className: 'face-6-15'
	}, {
		name: "爱情",
		gif: './../images/faces/e190.gif',
		className: 'face-7-1'
	}, {
		name: "飞吻",
		gif: './../images/faces/e191.gif',
		className: 'face-7-2'
	}, {
		name: "跳跳",
		gif: './../images/faces/e192.gif',
		className: 'face-7-3'
	}, {
		name: "发抖",
		gif: './../images/faces/e193.gif',
		className: 'face-7-4'
	}, {
		name: "怄火",
		gif: './../images/faces/e194.gif',
		className: 'face-7-5'
	}, {
		name: "转圈",
		gif: './../images/faces/e195.gif',
		className: 'face-7-6'
	}, {
		name: "磕头",
		gif: './../images/faces/e196.gif',
		className: 'face-7-7'
	}, {
		name: "回头",
		gif: './../images/faces/e197.gif',
		className: 'face-7-8'
	}, {
		name: "跳绳",
		gif: './../images/faces/e198.gif',
		className: 'face-7-9'
	}, {
		name: "挥手",
		gif: './../images/faces/e199.gif',
		className: 'face-7-10'
	}, {
		name: "激动",
		gif: './../images/faces/e200.gif',
		className: 'face-7-11'
	}, {
		name: "街舞",
		gif: './../images/faces/e201.gif',
		className: 'face-7-12'
	}, {
		name: "献吻",
		gif: './../images/faces/e202.gif',
		className: 'face-7-13'
	}, {
		name: "左太极",
		gif: './../images/faces/e203.gif',
		className: 'face-7-14'
	}, {
		name: "右太极",
		gif: './../images/faces/e204.gif',
		className: 'face-7-15'
	}];

	var FaceBox = function(element, options) {
		this.namespace = "face-box";
		this.element = element;
		this.show = false;
		this.options = $.extend({}, options);

		init(this);
	};

	function init(facebox) {
		facebox.content = new cursorController(facebox.element);
	}

	FaceBox.prototype.render = function(container) {
		var facebox = this;
		facebox.show = true;

		facebox.box = $('<div id="faceContainer" class="faces-wrapper"></div>');
		var _html = "";
		$(faces).each(function(idx, face) {
			_html += '<span class="face ' + face.className + '" title="' + face.name + '" data-name="' + face.name + '" data-gifurl="' + face.gif + '"></span>';
		});
		facebox.box.append(_html);

		facebox.box.appendTo(container);

		addListener(facebox);
	};

	function addListener(facebox) {
		$(document).on("click." + facebox.namespace, ".face", function() {
			var face = $(this);
			var gif = face.attr("data-gifurl"),
				name = face.attr("data-name");
			//var img = '<img src="' + gif + '" width="20" height="20" />';
			//insertImg(_content,img);

			var img = '/' + name + '';
			facebox.content.insertText(img);
		});

		$(document).on("click." + facebox.namespace, "div", function(evt) {
			preventDefault(evt);
			if ($(evt.target).is(".faces-wrapper") || $(evt.target).parents(".faces-wrapper").length > 0) {
				return false;
			}
			facebox.destroy();
		});
	}

	FaceBox.prototype.destroy = function() {
		var facebox = this;
		facebox.show = false;
		facebox.box && facebox.box.remove();
		$(document).off("." + facebox.namespace);

	};

	function preventDefault(event) {
		event=event||window.event;
		if (event.preventDefault)
			event.preventDefault();
		else
			event.returnValue = false;
	};

	module.exports = function(element, options) {
		return new FaceBox(element, options);
	};
});
