define(function(require, exports, module) {
	require("plugins/swiper/swiper.css");

	var Helper = require("helper");
	var template = require("template");
	var basePage = require("scripts/controllers/homepage/templates/Page");
	var Menu = require("scripts/config/Menu");

	var orgId = App.organization.info.id;

	var Page = function(options) {
		options = $.extend({
			name: "",
			isActive: false,
			json: {
				template: "SWIPERGRID",
				backColor: "",
				backImage: "http://img.xiaoxiao.la//f546b550-c058-4b8d-acc2-dec1fe76ffd2.jpg",
				backMusic: "",
				// 菜单
				menus: [
					// code, name, type, backImage, backColor, icon, url
					new Menu("losts", "失物", "SYSTEM", "", "rgba(90,241,88,0.5)", "http://img.xiaoxiao.la//00f0ec29-1faa-4953-97b9-f5f0b7745450.png", "/lost/list.html?oid=" + orgId, "oid=" + orgId),
					new Menu("proposal", "提案", "SYSTEM", "", "rgba(64,196,255,0.5)", "http://img.xiaoxiao.la//7e3d4fd7-65b5-4da2-a74c-18203562124a.png", "/proposal/list.html?oid=" + orgId, "oid=" + orgId),
					new Menu("questionnaires", "问卷", "SYSTEM", "", "rgba(104,137,255,0.5)", "http://img.xiaoxiao.la//f55e3723-af10-4cc2-ab61-0abe042340e5.png", "/questionnaire/list.html?oid=" + orgId, "oid=" + orgId),
					// new Menu("form", "表单", "SYSTEM", "", "rgba(69,90,100,0.7)", "http://img.xiaoxiao.la//e3ec017f-a6a9-4212-9bd3-a594b333354c.png", "/form/list.html?oid=" + orgId, "oid=" + orgId),
					new Menu("orgs", "风采", "SYSTEM", "", "rgba(69,90,100,0.7)", "http://img.xiaoxiao.la//13d2a906-2ff1-45e3-9bb2-ecc72031f0e3.png", "/organization/list.html?oid=" + orgId, "oid=" + orgId),
					new Menu("join", "招新", "SYSTEM", "", "rgba(255,64,129,0.7)", "http://img.xiaoxiao.la//55b809b5-b8c9-4adf-b149-905930300bad.png", "/organization/zone.html?oid=" + orgId, "oid=" + orgId)
				],
				// 轮播图
				carousels: [
					new Menu("votes", "投票", "SYSTEM", "http://img.xiaoxiao.la//9ae015aa-8912-4d3a-a85d-c4c1d3051207.jpg", "", "", "/votes.html?oid=" + orgId, "oid=" + orgId),
					new Menu("events", "活动列表", "SYSTEM", "http://img.xiaoxiao.la//b29ed4ef-6206-4942-858a-34a3e06f7c39.jpg", "", "", "/events.html?oid=" + orgId, "oid=" + orgId),
					new Menu("articles", "文章列表", "SYSTEM", "http://img.xiaoxiao.la//b2139de2-16bc-44e7-a73e-b237bca24f83.jpg", "", "", "/articles.html?oid=" + orgId, "oid=" + orgId)

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

			container.html(template("app/templates/homepage/templates/swiper-grid", {
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
		var menu = new Menu("", "", "SYSTEM", "", "rgba(90,241,88,0.5)", "http://img.xiaoxiao.la//29798d09-2fb3-4c4e-a8fc-3368148968bb.png", "", "");
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