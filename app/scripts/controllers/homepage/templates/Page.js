// 所有微首页对象均继承该对象
define(function(require, exports, module) {
	
	var Helper = require("helper");
	var extend = function(subClass, superClass) {
		var F = function() {};
		F.prototype = superClass.prototype;
		subClass.prototype = new F();
		subClass.prototype.constructor = subClass;
		subClass.superclass = superClass.prototype; //加多了个属性指向父类本身以便调用父类函数
		if (superClass.prototype.constructor == Object.prototype.constructor) {
			superClass.prototype.constructor = superClass;
		}
	}

	var Page = function() {};
	// 添加新菜单，请重写该方法
	Page.prototype.addMenu = function(callback) {
		var menu = {};
		this.json.menus.push(menu);
		Helper.execute(callback);
	};
	// 删除菜单，需要时重写
	Page.prototype.removeMenu = function(index, callback) {
		var _this = this;
		if (this.json.menus.length <= index) {
			return;
		}
		if (this.json.menus.length <= 1) {
			Helper.alert("至少需要一个菜单！");
			return;
		}
		var menu = this.json.menus[index];
		Helper.confirm("确定删除 [ " + menu.name + " ] 菜单？", function() {
			_this.json.menus.splice(index, 1);
			Helper.execute(callback);
		});
	};
	// 添加轮播图，请重写该方法
	Page.prototype.addCarousel = function(callback) {
		var carousel = {};
		this.json.carousels.push(carousel);
		Helper.execute(callback);
	};
	// 删除轮播图
	Page.prototype.removeCarousel = function(index, callback) {
		var _this = this;
		if (this.json.carousels.length <= index) {
			return;
		}
		if (this.json.carousels.length <= 1) {
			Helper.alert("至少需要一个轮播图！");
			return;
		}
		var carousel = this.json.carousels[index];
		Helper.confirm("确定删除 [ " + carousel.name + " ] 轮播图？", function() {
			_this.json.carousels.splice(index, 1);
			Helper.execute(callback);
		});
	};

	// 选择菜单背景图片
	Page.prototype.selectMenuBackImage = function(options) {
		options = $.extend(true, {
			cleanButton: true
		}, options);
		require.async("ImageSelector", function(ImageSelector) {
			ImageSelector(options);
		});
	};
	// 选择轮播图背景图片
	Page.prototype.selectCarouselBackImage = function(options) {
		options = $.extend(true, {
			crop: {
				aspectRatio: 375 / 200
			}
		}, options);
		require.async("ImageSelector", function(ImageSelector) {
			ImageSelector(options);
		});
	};

	// 数据处理
	Page.prototype.parseToData = function() {
		return JSON.stringify(this.json);
	};

	Page.prototype.extend = function(obj) {
		extend(obj, Page);
	};

	module.exports = Page;
});
