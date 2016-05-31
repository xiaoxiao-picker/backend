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
				template: "huali",
				backColor: "",
				backImage: "http://img.xiaoxiao.la//7e4e0d3e-c5e7-44e6-81ba-24ccec5bf1af.jpg",
				backMusic: "",
				menus: [
					// code, name, type, backImage, backColor, icon, url
					new Menu("votes", "投票", "SYSTEM", "", "rgba(178,255,89,0.5)", "http://img.xiaoxiao.la//fd50f278-d491-4f91-95dd-f713fccb1125.png", "/votes.html?oid=" + orgId, "oid=" + orgId),
					new Menu("events", "活动", "SYSTEM", "", "rgba(178,255,89,0.5)", "http://img.xiaoxiao.la//e3ec017f-a6a9-4212-9bd3-a594b333354c.png", "/events.html?oid=" + orgId, "oid=" + orgId),
					new Menu("articles", "文章", "SYSTEM", "", "rgba(178,255,89,0.5)", "http://img.xiaoxiao.la//49c2b162-a667-4ff0-b743-75e87db8cdcf.png", "/articles.html?oid=" + orgId, "oid=" + orgId),
					new Menu("losts", "失物", "SYSTEM", "", "rgba(178,255,89,0.5)", "http://img.xiaoxiao.la//00f0ec29-1faa-4953-97b9-f5f0b7745450.png", "/lost/list.html?oid=" + orgId, "oid=" + orgId),
					new Menu("proposal", "提案", "SYSTEM", "", "rgba(178,255,89,0.5)", "http://img.xiaoxiao.la//7e3d4fd7-65b5-4da2-a74c-18203562124a.png", "/proposal/list.html?oid=" + orgId, "oid=" + orgId),
					new Menu("questionnaires", "问卷", "SYSTEM", "", "rgba(178,255,89,0.5)", "http://img.xiaoxiao.la//0ce3588a-c25a-4c76-8d1a-96e9de4ee620.png", "/questionnaire/list.html?oid=" + orgId, "oid=" + orgId)
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
		container.html(template("app/templates/homepage/templates/huali", {
			orgInfo: data.orgInfo,
			page: _this,
			menus: menus
		}));
	};

	// 添加新菜单
	Page.prototype.addMenu = function(callback) {
		var menu = new Menu("", "", "SYSTEM", "", "rgba(178,255,89,0.5)", "http://img.xiaoxiao.la//65cdec22-3a2b-451c-ac7d-3ef24e77ad9f.png", "", "");
		this.json.menus.push(menu);
		Helper.execute(callback);
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