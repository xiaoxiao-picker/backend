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
				template: "SWIPERTILE",
				backColor: "rgba(250,250,250,1)",
				backImage: "",
				backMusic: "",
				// 菜单
				menus: [
					// code, name, type, backImage, backColor, icon, url
					new Menu("losts", "失物", "SYSTEM", "http://img.xiaoxiao.la//055e2e99-b6c3-45ed-92d1-5d694fd1e988.jpg", "rgba(64,196,255,1)", "http://img.xiaoxiao.la//00f0ec29-1faa-4953-97b9-f5f0b7745450.png", "/lost/list.html?oid=" + orgId, "oid=" + orgId),
					new Menu("proposal", "提案", "SYSTEM", "http://img.xiaoxiao.la//6626219f-8849-49c4-b5ff-0ba2a2799c66.jpg", "rgba(179,136,255,1)", "http://img.xiaoxiao.la//7e3d4fd7-65b5-4da2-a74c-18203562124a.png", "/proposal/list.html?oid=" + orgId, "oid=" + orgId),
					new Menu("questionnaires", "问卷", "SYSTEM", "http://img.xiaoxiao.la//2a94c792-f32b-4d7b-85ac-8f9e8e9e4e66.jpg", "rgba(114,213,114,1)", "http://img.xiaoxiao.la//faed0bcd-7268-4664-9ef3-57e5a3ed267f.png", "/questionnaire/list.html?oid=" + orgId, "oid=" + orgId),
					// new Menu("form", "表单", "SYSTEM", "http://img.xiaoxiao.la//b540efb1-f2e8-4613-8f10-0781ed655ab0.jpg", "rgba(255,179,0,1)", "http://img.xiaoxiao.la//e3ec017f-a6a9-4212-9bd3-a594b333354c.png", "/form/list.html?oid=" + orgId, "oid=" + orgId)
				],
				// 轮播图
				carousels: [
					new Menu("events", "活动列表", "SYSTEM", "http://img.xiaoxiao.la//d603869e-c1a5-4d49-94d4-b11332876214.jpg", "", "", "/events.html?oid=" + orgId, "oid=" + orgId),
					new Menu("articles", "文章列表", "SYSTEM", "http://img.xiaoxiao.la//0754a512-5777-4db6-9e5f-a5646b949a4c.jpg", "", "", "/articles.html?oid=" + orgId, "oid=" + orgId),
					new Menu("votes", "投票", "SYSTEM", "http://img.xiaoxiao.la//6ad8a10c-db33-435a-86c8-17ba30427fd5.jpg", "", "", "/votes.html?oid=" + orgId, "oid=" + orgId)
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

			container.html(template("app/templates/homepage/templates/swiper-tile", {
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

	// 添加新菜单
	Page.prototype.addMenu = function(callback) {
		// code, name, type, backImage, backColor, icon, url
		var menu = new Menu("", "", "SYSTEM", "", "rgba(64,196,255,1)", "http://img.xiaoxiao.la//29798d09-2fb3-4c4e-a8fc-3368148968bb.png", "", "");
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

	// 选择菜单背景图片
	Page.prototype.selectMenuBackImage = function(options) {
		options = $.extend(true, {
			cleanButton: true,
			crop: {
				aspectRatio: 750 / 190
			}
		}, options);
		require.async("ImageSelector", function(ImageSelector) {
			ImageSelector(options);
		});
	};

	Page.prototype.makeMenus = function() {
		var menus = [];
		for (var i = 0, menu; i < this.json.menus.length; i++) {
			menu = $.extend(true, {}, this.json.menus[i]);
			menu.css = menuMaker(menu);
			if (menu.code == "events" || menu.code == "articles") {
				menu.categoryId = menu.hasOwnProperty("categoryId") ? menu.categoryId : (Helper.param.match(menu.param || "", "categoryId") || Helper.param.match(menu.param || "", "category") || "");
			}
			menus.push(menu);
		};
		return menus;

		function menuMaker(menu) {
			var color = Color.RGBA(menu.backColor);
			var R = color.R();
			var G = color.G();
			var B = color.B();
			var moz = 'background: -moz-linear-gradient(left, rgba(' + R + ',' + G + ',' + B + ',1) 40%, rgba(255,255,255,0) 90%);'; /* FF3.6+ */
			var webkit = 'background: -webkit-gradient(linear, left top, right top, color-stop(40%,rgba(' + R + ',' + G + ',' + B + ',1)), color-stop(90%,rgba(255,255,255,0)));'; /* Chrome,Safari4+ */
			var safari = 'background: -webkit-linear-gradient(left, rgba(' + R + ',' + G + ',' + B + ',1) 40%,rgba(255,255,255,0) 90%);'; /* Chrome10+,Safari5.1+ */
			var opera = 'background: -o-linear-gradient(left, rgba(' + R + ',' + G + ',' + B + ',1) 40%,rgba(255,255,255,0) 90%);'; /* Opera 11.10+ */
			var ms = 'background: -ms-linear-gradient(left, rgba(' + R + ',' + G + ',' + B + ',1) 40%,rgba(255,255,255,0) 90%);'; /* IE10+ */
			var w3c = 'background: linear-gradient(to right, rgba(' + R + ',' + G + ',' + B + ',1) 40%,rgba(255,255,255,0) 90%);'; /* W3C */
			var ie69 = "filter: progid:DXImageTransform.Microsoft.gradient( startColorstr='#00000000', endColorstr= '#00000000', GradientType = 1);"; /* IE6-9 */

			var backgroundColor = moz + webkit + safari + opera + ms + w3c + ie69;
			return backgroundColor;
		};
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