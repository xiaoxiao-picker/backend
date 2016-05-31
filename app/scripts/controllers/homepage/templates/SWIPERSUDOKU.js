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
				template: "SWIPERSUDOKU",
				backColor: "rgba(232,232,232,1)",
				backImage: "",
				backMusic: "",
				// 菜单
				menus: [
					// code, name, type, backImage, backColor, icon, url
					new Menu("events", "活动", "SYSTEM", "", "rgba(3,169,244,1)", "http://img.xiaoxiao.la//c6294930-4700-47ea-ad9e-a6b515f72c5b.png", "/events.html?oid=" + orgId, "oid=" + orgId),
					new Menu("articles", "文章", "SYSTEM", "", "rgba(114,213,114,1)", "http://img.xiaoxiao.la//f1329fe3-271c-4830-8c0e-2473a7fe7c7a.png", "/articles.html?oid=" + orgId, "oid=" + orgId),
					new Menu("losts", "失物", "SYSTEM", "", "rgba(255,213,79,1)", "http://img.xiaoxiao.la//333f5617-4a60-4765-858e-98a98f848f66.png", "/lost/list.html?oid=" + orgId, "oid=" + orgId),
					new Menu("proposal", "提案", "SYSTEM", "", "rgba(186,104,200,1)", "http://img.xiaoxiao.la//656cbfeb-87b7-4491-9e67-7bdd6ca80085.png", "/proposal/list.html?oid=" + orgId, "oid=" + orgId),
					new Menu("questionnaires", "问卷", "SYSTEM", "", "rgba(255,64,129,1)", "http://img.xiaoxiao.la//d24c6ee2-d896-4a76-9e82-1bc6c18daf8e.png", "/questionnaire/list.html?oid=" + orgId, "oid=" + orgId),
					// new Menu("form", "表单", "SYSTEM", "", "rgba(255,171,64,1)", "http://img.xiaoxiao.la//b6c367a3-df0c-4963-ae58-0dc723675f88.png", "/form/list.html?oid=" + orgId, "oid=" + orgId),
					new Menu("orgs", "风采", "SYSTEM", "", "rgba(114,213,114,1)", "http://img.xiaoxiao.la//f5ca3b76-624b-4680-a7bf-d7fdf2f9c5a1.png", "/organization/list.html?oid=" + orgId, "oid=" + orgId),
					new Menu("join", "招新", "SYSTEM", "", "rgba(207,216,220,1)", "http://img.xiaoxiao.la//6ac8da9c-82a0-44f1-b0f8-c754e18f1e72.png", "/organization/zone.html?oid=" + orgId, "oid=" + orgId),
					new Menu("notices", "公告", "SYSTEM", "", "rgba(128,222,234,1)", "http://img.xiaoxiao.la//fce8d8ad-688e-4e0e-94d1-7ebaab581b3c.png", "/user/notices.html?oid=" + orgId, "oid=" + orgId)
				],
				// 轮播图
				carousels: [
					new Menu("votes", "投票", "SYSTEM", "http://img.xiaoxiao.la//23ca6be1-fcd8-4f80-8d63-9f4b520f72e8.jpg", "", "", "/votes.html?oid=" + orgId, "oid=" + orgId),
					new Menu("feedback", "意见", "SYSTEM", "http://img.xiaoxiao.la//9c5e2149-8161-4100-82d0-28c5f7f8d5a9.jpg", "", "", "/feedback/list.html?oid=" + orgId, "oid=" + orgId),
					new Menu("notices", "公告", "SYSTEM", "http://img.xiaoxiao.la//3d44bfc4-06e1-445d-8610-be75ac674649.jpg", "", "", "/user/notices.html?oid=" + orgId, "oid=" + orgId)
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

			container.html(template("app/templates/homepage/templates/swiper-sudoku", {
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
		var menu = new Menu("", "", "SYSTEM", "", "rgba(66,189,65,0.7)", "http://img.xiaoxiao.la//d2d81326-8fca-4b57-96b1-ab70d3636a3f.png", "", "");
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
