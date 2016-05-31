define(function(require, exports, module) {
	require("plugins/swiper/swiper.css");
	
	var Helper = require("helper");
	var Color = require("Color")
	var template = require("template");
	var basePage = require("scripts/controllers/homepage/templates/Page");
	var Menu = require("scripts/config/Menu");

	var orgId = App.organization.info.id;

	var Page = function(options) {
		options = $.extend({
			name: "",
			isActive: false,
			json: {
				template: "SWIPERNOTE",
				backColor: "rgba(250,250,250,1)",
				backImage: "",
				backMusic: "",
				// 菜单
				menus: [
					// code, name, type, backImage, backColor, icon, url
					new Menu("losts", "失物", "SYSTEM", "http://img.xiaoxiao.la//804c9553-e3d3-457e-a2b4-dc27308bac2c.jpg", "rgba(255,160,0,0.7)", "http://img.xiaoxiao.la//0af3f433-62f5-4d39-b40e-45f8a5cf69e9.png", "/lost/list.html?oid=" + orgId, "oid=" + orgId),
					new Menu("proposal", "提案", "SYSTEM", "http://img.xiaoxiao.la//05f76dca-caef-421d-b8ea-759957c4c449.jpg", "rgba(161,136,127,0.7)", "http://img.xiaoxiao.la//0af3f433-62f5-4d39-b40e-45f8a5cf69e9.png", "/proposal/list.html?oid=" + orgId, "oid=" + orgId),
					new Menu("questionnaires", "问卷", "SYSTEM", "http://img.xiaoxiao.la//4b5e9072-dc03-4638-8563-94708869cfd8.jpg", "rgba(179,136,255,0.7)", "http://img.xiaoxiao.la//0af3f433-62f5-4d39-b40e-45f8a5cf69e9.png", "/questionnaire/list.html?oid=" + orgId, "oid=" + orgId),
					// new Menu("form", "表单", "SYSTEM", "http://img.xiaoxiao.la//710cbd9b-0878-4d9a-8992-e1acaa924000.jpg", "rgba(66,189,65,0.7)", "http://img.xiaoxiao.la//0af3f433-62f5-4d39-b40e-45f8a5cf69e9.png", "/form/list.html?oid=" + orgId, "oid=" + orgId)
				],
				// 轮播图
				carousels: [
					new Menu("votes", "投票", "SYSTEM", "http://img.xiaoxiao.la//206ebe5c-d40b-4767-a1d0-5aa5eac29ca4.jpg", "", "", "/votes.html?oid=" + orgId, "oid=" + orgId),
					new Menu("events", "活动列表", "SYSTEM", "http://img.xiaoxiao.la//969addf2-7baf-4932-8e44-7127647c48e9.jpg", "", "", "/events.html?oid=" + orgId, "oid=" + orgId),
					new Menu("articles", "文章列表", "SYSTEM", "http://img.xiaoxiao.la//b057fca4-2fb0-4424-bf4a-ec007f193a41.jpg", "", "", "/articles.html?oid=" + orgId, "oid=" + orgId)
				]
			}
		}, options);
		options.json.backMusic = options.json.backMusic || options.json.music || "";
		this.name = options.name;
		this.isActive = options.isActive;
		this.json = options.json;
	};
	new basePage().extend(Page);

	Page.prototype.render = function(container, data) {
		var _this = this;
		var menus = _this.makeMenus();
		require.async("plugins/swiper/swiper", function() {

			container.html(template("app/templates/homepage/templates/swiper-note", {
				orgInfo: data.orgInfo,
				page: _this,
				menus: menus
			}));

			// 轮播图数量大于10个之后将不显示页索引
			var pagination = _this.json.carousels.length < 11 ? '.swiper-pagination' : '';
			_this.swiper = new window.Swiper(".swiper-container", {
				autoplay: 0,
				loop: false,

				// 如果需要分页器
				pagination: pagination,

				// 如果需要前进后退按钮
				nextButton: '.swiper-button-next',
				prevButton: '.swiper-button-prev',
				watchSlidesProgress: true,
				watchSlidesVisibility: true,
				// 初始索引
				initialSlide: data.activeType == "CAROUSEL" ? data.activeIndex : 0,
				onSlideChangeEnd: data.onSlideChangeEnd
			});
		});
	};
	Page.prototype.makeMenus = function() {
		var length = this.json.menus.length;
		var menus = [];
		for (var i = 0, menu; i < length; i++) {
			menu = $.extend(true, {}, this.json.menus[i]);
			if (menu.code == "events" || menu.code == "articles") {
				menu.categoryId = menu.hasOwnProperty("categoryId") ? menu.categoryId : (Helper.param.match(menu.param || "", "categoryId") || Helper.param.match(menu.param || "", "category") || "");
			}
			menus.push(menu);
		};
		return menus;
	};

	// 添加新菜单
	Page.prototype.addMenu = function(callback) {
		var menu = new Menu("", "", "SYSTEM", "", "rgba(90,241,88,0.5)", "http://img.xiaoxiao.la//3f8f4057-2b79-48e5-957e-e54b5f95957b.png", "", "");
		this.json.menus.push(menu);
		Helper.execute(callback);
	};

	// 添加轮播图
	Page.prototype.addCarousel = function(callback) {
		var _this = this;
		if (this.json.carousels.length == 10) {
			Helper.confirm("轮播图超过10个后将不显示底部的索引图标，仍继续添加？", addCarousel);
		} else {
			addCarousel();
		}

		function addCarousel() {
			var carousel = new Menu("", "", "SYSTEM", "", "", "", "", "");
			_this.json.carousels.push(carousel);
			Helper.execute(callback);
		}
	};


	// 验证
	Page.prototype.validate = function(errors) {
		var menus = this.json.menus;
		var carousels = this.json.carousels;
		if (Helper.validation.isEmpty(this.name)) {
			Helper.execute(errors.name);
			return false;
		}
		if (Helper.validation.isEmptyNull(this.json.template)) {
			Helper.execute(errors.template);
			return false;
		}
		if (carousels.length < 1) {
			Helper.alert("请至少添加一个轮播图！");
			return false;
		}
		for (var i = 0; i < carousels.length; i++) {
			if (!validateCarousel(i, carousels[i])) {
				return false;
			}
		};
		if (menus.length < 1) {
			Helper.alert("请至少添加一个菜单！");
			return false;
		}
		for (var i = 0; i < menus.length; i++) {
			if (!validateMenu(i, menus[i])) {
				return false;
			}
		};
		return true;

		// 菜单验证
		function validateMenu(index, menu) {
			if (Helper.validation.isEmptyNull(menu.name)) {
				Helper.execute(errors.menuName, {
					index: index,
					menu: menu,
					message: "请填写菜单名称！"
				});
				return false;
			}
			if (Helper.validation.isEmptyNull(menu.type)) {
				Helper.execute(errors.menuType, {
					index: index,
					menu: menu,
					message: "菜单不合法！"
				});
				return false;
			}
			// 图标应该肯定会有
			// if (Helper.validation.isEmptyNull(menu.icon)) {
			// 	Helper.execute(errors.menuIcon, {
			// 		index: index,
			// 		menu: menu,
			// 		message: "请选择菜单图标！"
			// 	});
			// 	return false;
			// }
			if (Helper.validation.isEmptyNull(menu.url)) {
				Helper.execute(errors.menuURL, {
					index: index,
					menu: menu,
					message: "菜单未绑定功能或链接！请选择相关功能或链接并点击“确定”进行绑定。"
				});
				return false;
			}
			return true;
		};

		function validateCarousel(index, carousel) {
			if (Helper.validation.isEmptyNull(carousel.name)) {
				Helper.execute(errors.carouselName, {
					index: index,
					menu: carousel,
					message: "请填写轮播图名称！"
				});
				return false;
			}
			if (Helper.validation.isEmptyNull(carousel.backImage)) {
				Helper.execute(errors.carouselBackImage, {
					index: index,
					menu: carousel,
					message: "请选择轮播图图片！"
				});
				return false;
			}
			if (Helper.validation.isEmptyNull(carousel.type)) {
				Helper.execute(errors.carouselType, {
					index: index,
					menu: carousel,
					message: "轮播图不合法！"
				});
				return false;
			}
			if (Helper.validation.isEmptyNull(carousel.url)) {
				Helper.execute(errors.carouselURL, {
					index: index,
					menu: carousel,
					message: "轮播图菜单未绑定功能或链接！请选择相关功能或链接并点击“确定”进行绑定。"
				});
				return false;
			}
			return true;
		};
	};

	module.exports = function(options) {
		return new Page(options);
	};
});
