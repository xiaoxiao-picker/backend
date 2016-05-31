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
				template: "rotate",
				backColor: "",
				backImage: "http://img.xiaoxiao.la//b676c9ed-663b-48cc-9f0c-3078a26cbfe8.jpg",
				backMusic: "",
				menus: [
					// code, name, type, backImage, backColor, icon, url
					// new Menu("form", "表单", "SYSTEM", "", "rgba(255,204,128,0.5)", "http://img.xiaoxiao.la//7e3d4fd7-65b5-4da2-a74c-18203562124a.png", "/form/list.html?oid=" + orgId, "oid=" + orgId),
					new Menu("orgs", "风采", "SYSTEM", "", "rgba(255,204,128,0.5)", "http://img.xiaoxiao.la//acca488d-7ba4-4317-b108-9f56cadf199f.png", "/organization/list.html?oid=" + orgId, "oid=" + orgId),
					new Menu("join", "招新", "SYSTEM", "", "rgba(255,204,128,0.5)", "http://img.xiaoxiao.la//55b809b5-b8c9-4adf-b149-905930300bad.png", "/organization/zone.html?oid=" + orgId, "oid=" + orgId),
					new Menu("votes", "投票", "SYSTEM", "", "rgba(255,204,128,0.5)", "http://img.xiaoxiao.la//54dcb4f9-f120-4125-84b2-c31f26b8abc8.png", "/votes.html?oid=" + orgId, "oid=" + orgId),
					new Menu("events", "活动列表", "SYSTEM", "", "rgba(255,204,128,0.5)", "http://img.xiaoxiao.la//e3ec017f-a6a9-4212-9bd3-a594b333354c.png", "/events.html?oid=" + orgId, "oid=" + orgId),
					new Menu("articles", "文章列表", "SYSTEM", "", "rgba(255,204,128,0.5)", "http://img.xiaoxiao.la//13d2a906-2ff1-45e3-9bb2-ecc72031f0e3.png", "/articles.html?oid=" + orgId, "oid=" + orgId),
					new Menu("losts", "失物", "SYSTEM", "", "rgba(255,204,128,0.5)", "http://img.xiaoxiao.la//00f0ec29-1faa-4953-97b9-f5f0b7745450.png", "/lost/list.html?oid=" + orgId, "oid=" + orgId),
					new Menu("proposal", "提案", "SYSTEM", "", "rgba(255,204,128,0.5)", "http://img.xiaoxiao.la//55b809b5-b8c9-4adf-b149-905930300bad.png", "/proposal/list.html?oid=" + orgId, "oid=" + orgId),
					new Menu("questionnaires", "问卷", "SYSTEM", "", "rgba(255,204,128,0.5)", "http://img.xiaoxiao.la//0ce3588a-c25a-4c76-8d1a-96e9de4ee620.png", "/questionnaire/list.html?oid=" + orgId, "oid=" + orgId)
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
		container.html(template("app/templates/homepage/templates/rotate", {
			orgInfo: data.orgInfo,
			page: _this,
			menus: menus
		}));
	};

	// 添加新菜单
	Page.prototype.addMenu = function(callback) {
		if (this.json.menus.length > 9) {
			Helper.alert("当前模板最多支持9个菜单！");
			return;
		}
		var menu = new Menu("", "", "SYSTEM", "", "rgba(255,204,128,0.5)", "http://img.xiaoxiao.la//29798d09-2fb3-4c4e-a8fc-3368148968bb.png", "", "");
		this.json.menus.push(menu);
		Helper.execute(callback);
	};

	Page.prototype.removeMenu = function(index, callback) {
		var _this = this;
		if (this.json.menus.length <= index) {
			return;
		}
		if (this.json.menus.length <= 5) {
			Helper.alert("至少需要五个菜单！");
			return;
		}
		var menu = this.json.menus[index];
		Helper.confirm("确定删除 [ " + menu.name + " ] 菜单？", function() {
			_this.json.menus.splice(index, 1);
			Helper.execute(callback);
		});
	};

	Page.prototype.makeMenus = function() {
		var length = this.json.menus.length;
		var menus = [];
		for (var i = 0, menu; i < length; i++) {
			menu = $.extend(true, {}, this.json.menus[i]);
			var pos = maker(i);
			menu.left = pos.left;
			menu.top = pos.top;
			if (menu.code == "events" || menu.code == "articles") {
				menu.categoryId = menu.hasOwnProperty("categoryId") ? menu.categoryId : (Helper.param.match(menu.param || "", "categoryId") || Helper.param.match(menu.param || "", "category") || "");
			}
			menus.push(menu);
		};
		return menus;

		function maker(index) {
			return {
				left: (50 - 40 * Math.cos(-0.5 * Math.PI - 2 * (1 / (length - 3)) * (index - 3) * Math.PI)).toFixed(4) + "%",
				top: (50 + 40 * Math.sin(-0.5 * Math.PI - 2 * (1 / (length - 3)) * (index - 3) * Math.PI)).toFixed(4) + "%"
			};
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
		if (menus.length < 6) {
			Helper.alert("至少需要五个菜单！");
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