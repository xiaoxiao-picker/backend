define(function(require, exports, module) {
	
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
				template: "win8",
				backColor: "",
				backImage: "http://img.xiaoxiao.la//5ccf1e4a-bcaa-4744-b43b-329259aee965.jpg",
				backMusic: "",
				menus: [
					// code, name, type, backImage, backColor, icon, url
					new Menu("events", "活动列表", "SYSTEM", "", "rgba(234,128,252,0.5)", "http://img.xiaoxiao.la//fd50f278-d491-4f91-95dd-f713fccb1125.png", "/events.html?oid=" + orgId,"oid="+orgId),
					new Menu("articles", "文章列表", "SYSTEM", "", "rgba(234,128,252,0.5)", "http://img.xiaoxiao.la//e3ec017f-a6a9-4212-9bd3-a594b333354c.png", "/articles.html?oid=" + orgId,"oid="+orgId),
					new Menu("votes", "投票", "SYSTEM", "", "rgba(234,128,252,0.5)", "http://img.xiaoxiao.la//faed0bcd-7268-4664-9ef3-57e5a3ed267f.png", "/votes.html?oid=" + orgId,"oid="+orgId),
					new Menu("proposal", "提案", "SYSTEM", "", "rgba(234,128,252,0.5)", "http://img.xiaoxiao.la//7e3d4fd7-65b5-4da2-a74c-18203562124a.png", "/proposal/list.html?oid=" + orgId,"oid="+orgId),
					new Menu("questionnaires", "问卷", "SYSTEM", "", "rgba(234,128,252,0.5)", "http://img.xiaoxiao.la//f55e3723-af10-4cc2-ab61-0abe042340e5.png", "/questionnaire/list.html?oid=" + orgId,"oid="+orgId),
					// new Menu("form", "表单", "SYSTEM", "", "rgba(234,128,252,0.5)", "http://img.xiaoxiao.la//aa859526-011f-4ef4-acbe-75e298189545.png", "/form/list.html?oid=" + orgId,"oid="+orgId),
					new Menu("orgs", "风采", "SYSTEM", "", "rgba(234,128,252,0.5)", "http://img.xiaoxiao.la//acca488d-7ba4-4317-b108-9f56cadf199f.png", "/organization/list.html?oid=" + orgId,"oid="+orgId),
					new Menu("join", "招新", "SYSTEM", "", "rgba(234,128,252,0.5)", "http://img.xiaoxiao.la//13d2a906-2ff1-45e3-9bb2-ecc72031f0e3.png", "/organization/zone.html?oid=" + orgId,"oid="+orgId)
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
		data.orgInfo.extend={};
		container.html(template("app/templates/homepage/templates/win8", {
			orgInfo: data.orgInfo,
			page: _this,
			menus: menus
		}));
	};

	// 添加新菜单
	Page.prototype.addMenu = function(callback) {
		var menu = new Menu("", "", "SYSTEM", "", "rgba(234,128,252,0.5)", "http://img.xiaoxiao.la//29798d09-2fb3-4c4e-a8fc-3368148968bb.png", "","");
		this.json.menus.push(menu);
		Helper.execute(callback);
	};

	Page.prototype.makeMenus = function() {
		var menus = [];
		for (var i = 0, menu; i < this.json.menus.length; i++) {
			var json = maker(i);
			menu = $.extend(true, {
				action: "checkMenu",
				width: json.width,
				className: json.className
			}, this.json.menus[i]);
			if (menu.code == "events" || menu.code == "articles") {
				menu.categoryId = menu.hasOwnProperty("categoryId") ? menu.categoryId : (Helper.param.match(menu.param || "", "categoryId") || Helper.param.match(menu.param || "", "category") || "");
			}

			menus.push(menu);
		};
		var json = maker(menus.length);
		menus.push({
			action: "createMenu",
			name: "添加菜单",
			width: json.width,
			className: json.className
		});
		return menus;

		function maker(index) {
			index = index % 8;
			var boxWidth = 250;
			var times1 = {
				width: Math.floor(boxWidth / 3 - 10),
				className: "times1"
			};
			var times2 = {
				width: Math.floor(boxWidth / 3 * 2 - 10),
				className: "times2"
			};
			var times3 = {
				width: Math.floor(boxWidth - 10),
				className: "times3"
			};
			return [times2, times1, times3, times1, times1, times1, times1, times2][index];
		}
	};

	// 验证
	Page.prototype.validate = function(errors) {
		var menus = this.json.menus;
		if (Helper.validation.isEmpty(this.name)) {
			Helper.execute(errors.name);
			return false;
		}
		if (Helper.validation.isEmptyNull(this.json.template)) {
			Helper.execute(errors.template);
			return false;
		}
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
	};

	module.exports = function(options) {
		return new Page(options);
	};
});
