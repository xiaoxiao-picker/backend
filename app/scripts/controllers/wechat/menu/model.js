define(function(require, exports, module) {
	var Helper = require("helper");
	var GUID = require("factory.guid");

	exports.dataToModel = function(data) {
		var menus = data ? data.menus : [];
		$(menus).each(function(i, mainMenu) {
			mainMenu.info = mainMenu.info ? $.parseJSON(mainMenu.info) : {};
			mainMenu.info.guid = mainMenu.info.guid || (new GUID).newGUID();
			mainMenu.subMenus = mainMenu.subMenus || [];
			$(mainMenu.subMenus).each(function(j, subMenu) {
				subMenu.info = subMenu.info ? $.parseJSON(subMenu.info) : {};
				subMenu.info.guid = subMenu.info.guid || (new GUID).newGUID();
				subMenu.info.parentId = mainMenu.info.guid;
			});
		});
		return menus;
	};


	exports.modelToData = function(oMenus) {
		menus = oMenus.clone();
		$(menus).each(function(i, mainMenu) {
			mainMenu.info && (mainMenu.info = mainMenu.info ? JSON.stringify(mainMenu.info) : "");
			mainMenu.subMenus = mainMenu.subMenus || [];
			$(mainMenu.subMenus).each(function(j, subMenu) {
				subMenu.info && (subMenu.info = subMenu.info ? JSON.stringify(subMenu.info) : "");
			});
		});
		return menus;
	};

	exports.validateModel = function(menus) {
		var result = {
			result: true
		};
		if (menus.length < 2) {
			result.result = false;
			result.message = "请至少添加2个主菜单！";
		}
		var menuIndexs = ["一", "二", "三", "四", "五", "六"];
		$(menus).each(function(idx, item) {
			if (Helper.validation.isEmpty(item.name)) {
				result.result = false;
				result.message = "第" + menuIndexs[idx] + "个主菜单名称不能为空！";
				return false;
			}
			if (!item.subMenus || item.subMenus.length == 0) {
				if (Helper.validation.isEmpty(item.content)) {
					result.result = false;
					result.message = "主菜单 【" + item.name + "】 链接不能为空！";
					return false;
				}
				// if (!Helper.validation.isUrl(item.content)) {
				// 	result.result = false;
				// 	result.message = "主菜单 【" + item.name + "】 链接不合法！";
				// 	return false;
				// }
			}

			// 主菜单拥有子菜单
			if (item.subMenus && item.subMenus.length > 0) {
				$(item.subMenus).each(function(idx2, item2) {
					if (Helper.validation.isEmpty(item2.name)) {
						result.result = false;
						result.message = "主菜单 【" + item.name + "】 中的第" + menuIndexs[idx2] + "个子菜单名称不能为空！";
						return false;
					}
					if (Helper.validation.isEmpty(item2.content)) {
						result.result = false;
						result.message = "主菜单 【" + item.name + "】 中的 【" + item2.name + "】 链接不能为空！";
						return false;
					}
				});
			}
			// 如果菜单有误，跳出循环
			if (!result.result) {
				return false;
			}
		});

		return result;
	};


});