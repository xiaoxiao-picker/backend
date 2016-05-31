define(function(require, exports, module) {
	require("plugins/select2/select2.js");

	var baseController = require('baseController');
	var bC = new baseController();

	var OrganizationService = require('OrganizationService');
	var WechatService = require('WechatService');
	var ArticleService = require('ArticleService');
	var EventService = require('EventService');
	var HomePageService = require("HomePageService");

	var configMenus = require("scripts/config/menus");
	var GUID = require("factory.guid");

	var Helper = require("helper");
	var template = require('template');

	var dataModel = require("scripts/controllers/wechat/menu/model");

	var orgId, publicId;

	var menuInfo; // 当前操作的菜单

	// 基础模块
	var Modules;

	// 当前菜单集合
	var Menus;


	var Controller = function() {
		var _controller = this;
		_controller.namespace = "wechat..menu";
		_controller.actions = {
			// 创建菜单
			createMenu: function() {
				var parentId = this.attr("data-parent-id");
				var menuId = (new GUID).newGUID();
				var menu = {
					name: "",
					content: "",
					menuType: "VIEW",
					info: {
						guid: menuId
					}
				}
				if (parentId) {
					var parentMenu = getMenu(parentId);
					parentMenu.subMenus = parentMenu.subMenus || [];
					parentMenu.content = "I am a main button !";
					menu.info.parentId = parentId;
					parentMenu.subMenus.push(menu);
				} else {
					Menus.push(menu);
				}

				renderMenus();
				renderMenuInfo(menu);
			},
			// 查看菜单详情
			checkMenu: function() {
				var menuId = this.attr("data-menu-id");
				var menu = getMenu(menuId);
				renderMenuInfo(menu);
			},
			// 删除菜单
			removeMenu: function() {
				var menuId = this.parents(".d-menu").attr("data-menu-id");
				var menu = getMenu(menuId);
				var msg = !menu.info.parentId ? "删除主菜单同时会删掉其子菜单，仍继续？" : "确定删除该子菜单？";


				Helper.confirm(msg, function() {
					removeMenu(menuId);
					renderMenus();
				});
			},
			// 取消绑定
			cancel: function() {
				var menuId = this.parents(".personalized-form").attr("data-menu-id");
				var menu = getMenu(menuId);
				menu.info.code = "";
				menu.content = "";
				renderMenuInfo(menu);
			},
			// 重新绑定
			resetBind: function() {
				var menuId = this.parents(".personalized-form").attr("data-menu-id");
				var menu = getMenu(menuId);
				Helper.confirm("确定重新绑定菜单？", function() {
					menu.name = "";
					menu.info.code = "";
					menu.info.type = "";
					menu.content = "";
					renderMenuInfo(menu);
					renderMenus();
				});
			},
			// 只修改菜单名称
			updateMenuName: function() {
				var menuId = this.parents(".personalized-form").attr("data-menu-id");
				var menu = getMenu(menuId);

				var isParentMenu = !menu.info.parentId;
				if (isParentMenu) {
					menu.content = "I am a main button !";
				}

				var maxMenuName = isParentMenu ? 8 : 14;

				var name = $.trim(this.val());
				name = makeMenuName(name, maxMenuName);
				if (this.val() != name) {
					this.val(name);
				}

				menu.name = name;
				renderMenus();

				function makeMenuName(name, maxLength) {
					if (Helper.getCharLength(name) > maxLength) {
						name = name.substring(0, name.length - 1);
						// Helper.errorToast("该菜单名称长度不能超过" + maxLength + "字符！");
						return makeMenuName(name, maxLength);
					}
					return name;
				}
			},
			changedCategory: function() {
				var menuId = this.parents(".personalized-form").attr("data-menu-id");
				var menu = getMenu(menuId);
				var categoryId = this.val();
				menu.info.categoryId = categoryId ? categoryId : "";
				renderMenuInfo(menu);
			},
			changeHomepage: function() {
				var menuId = this.parents(".personalized-form").attr("data-menu-id");
				var menu = getMenu(menuId);
				var homepageId = this.val();
				menu.info.homepageId = homepageId ? homepageId : "";
				renderMenuInfo(menu);
			},


			// 官方模块、自定义链接切换
			switchToCustom: function() {
				var menuId = this.parents(".personalized-form").attr("data-menu-id");
				var menu = getMenu(menuId);
				menu.content = "";
				menu.info.code = "";
				menu.info.type = "CUSTOM";
				renderMenuInfo(menu);
			},
			switchToBase: function() {
				var menuId = this.parents(".personalized-form").attr("data-menu-id");
				var menu = getMenu(menuId);
				menu.content = "";
				menu.info.code = "";
				menu.info.type = "SYSTEM";
				renderMenuInfo(menu);
			},
			switchToThirdPartyApp: function() {
				var menuId = this.parents(".personalized-form").attr("data-menu-id");
				var menu = getMenu(menuId);
				menu.content = "";
				menu.info.code = "";
				menu.info.type = "THIRDPARTAPP";
				renderMenuInfo(menu);
			},
			//选中对应官方模块
			selectModule: function() {
				var code = this.attr("data-code");
				var source = Modules.objOfAttr("code", code);
				var menuId = this.parents(".personalized-form").attr("data-menu-id");
				var menu = getMenu(menuId);
				var guid = menu.info.guid;
				menu.info.code = code;
				menu.info.type = source.type;
				menu.content = "";
				renderMenuInfo(menu);
			},
			// 选择第三方应用
			selectThirdPartyApp: function() {
				var menuId = this.parents(".personalized-form").attr("data-menu-id");
				var menu = getMenu(menuId);

				var code = this.attr("data-code");
				// var source = Modules.objOfAttr("code", code);

				menu.info.code = code;
				renderMenuInfo(menu);
			},
			// 保存自定义菜单
			saveCustomMenu: function() {
				var menuId = this.parents(".personalized-form").attr("data-menu-id");
				var menu = getMenu(menuId);

				var url = $.trim($("#MenuUrl").val());

				if (Helper.validation.isEmptyNull(url)) {
					Helper.alert("自定义链接不能为空！");
					return;
				}

				menu.content = url;

				renderMenuInfo(menu);
				renderMenus();
			},

			// 保存菜单
			saveMenu: function() {
				var menuId = this.parents(".personalized-form").attr("data-menu-id");
				var menu = getMenu(menuId);


				if (Helper.validation.isEmptyNull(menu.name)) {
					Helper.alert("菜单名称不能为空！");
					return;
				}

				// 如果 parentId 为 0 时，即为主菜单，主菜单不需要设置 menuUrl
				if (menu.subMenus && menu.subMenus.length > 0) {
					if (Helper.getCharLength(menu.name) > 8) {
						Helper.alert("主菜单名称长度不能超过4个汉字或8个字符！");
						return;
					}
				} else {
					if (Helper.getCharLength(menu.name) > 14) {
						Helper.alert("子菜单名称长度不能超过7个汉字或14个字符！");
						return;
					}
				}

				var source = Modules.objOfAttr("code", menu.info.code);
				menu.content = source.url;

				renderMenuInfo(menu);
				renderMenus();
			},

			// 发布自定义菜单至微信服务器
			publishCustomMenu: function() {
				var _btn = this;
				// 验证自定义菜单的合法性
				var result = dataModel.validateModel(Menus);
				if (!result.result) {
					Helper.alert(result.message);
					return;
				}
				makeMenusContent(Menus);
				Helper.confirm("菜单发布成功之后将覆盖原有菜单，确定发布么？", function() {
					var menus = dataModel.modelToData(Menus);
					Helper.begin(_btn);
					WechatService.menu.set(publicId, JSON.stringify(menus)).done(function(data) {
						Helper.alert("发布成功！", function() {
							_controller.render();
						});
					}).fail(function(error) {
						Helper.alert(error);
					}).always(function() {
						Helper.end(_btn);
					});
				});
			},
			moveLeft: function() {
				var menuId = $(this).attr("data-menu-id");
				var index = indexOfMenu(Menus.clone(), menuId);
				var nextIndex = index == 0 ? Menus.length - 1 : index - 1;
				swapItems(Menus, index, nextIndex);
				renderMenus();
			},
			moveRight: function() {
				var menuId = $(this).attr("data-menu-id");
				var index = indexOfMenu(Menus.clone(), menuId);
				var nextIndex = (index + 1) == Menus.length ? 0 : index + 1;
				swapItems(Menus, index, nextIndex);
				renderMenus();
			},
			moveDown: function() {
				var menuId = $(this).parents(".d-menu").attr("data-menu-id");
				var parentMenuId = $(this).parents(".d-menu").attr("data-parent-id");
				var parentMenu = getMenu(parentMenuId);
				var index = indexOfMenu(parentMenu.subMenus, menuId);
				var nextIndex = (index + 1) == parentMenu.subMenus.length ? 0 : index + 1;
				swapItems(parentMenu.subMenus, index, nextIndex);
				renderMenus();
			},
			moveUp: function() {
				var menuId = $(this).parents(".d-menu").attr("data-menu-id");
				var parentMenuId = $(this).parents(".d-menu").attr("data-parent-id");
				var parentMenu = getMenu(parentMenuId);
				var index = indexOfMenu(parentMenu.subMenus, menuId);
				var nextIndex = index == 0 ? parentMenu.subMenus.length - 1 : index - 1;
				swapItems(parentMenu.subMenus, index, nextIndex);
				renderMenus();
			}
		};
	};
	bC.extend(Controller);
	Controller.prototype.init = function(templateUrl, callback) {
		this.templateUrl = templateUrl;
		this.callback = callback;
		orgId = App.organization.info.id;

		Modules = configMenus(orgId);

		this.render();
	};

	Controller.prototype.render = function() {
		var templateUrl = this.templateUrl;
		var callback = this.callback;

		App.organization.getWechat().done(function(data) {
			if (!App.organization.wechat || !App.organization.wechat.id) {
				Helper.alert("当前组织尚未设置微信授权，请先授权！", function() {
					Helper.go("wechat/info");
				});
				return;
			}

			if (!App.organization.wechat.scopeCategories.objOfAttr("id", 1)) {
				var message = "<p style='margin-bottom:10px;text-align:left;'>未获得【消息与菜单】相关功能权限！</p>";
				message += "<p style='text-align:left;line-height:20px;'>消息与菜单功能只能授权给一个第三方平台，如果想在校校平台使用【消息与菜单】功能，请到【微信公众平台】取消授权占用【消息与菜单】权限的第三方平台和校校，并重新授权给校校。</p>";
				Helper.alert(message);
			}

			publicId = App.organization.wechat.id;
			Helper.globalRender(template(templateUrl, {
				wechat: App.organization.wechat
			}));

			initMenu();
		}).fail(function(error) {
			Helper.alert(error);
		}).always(function() {
			Helper.execute(callback);
		});
	};

	// 初始化菜单，从服务器读取菜单数据
	function initMenu() {
		WechatService.menu.get(publicId).done(function(data) {
			Menus = dataModel.dataToModel(data.result);
			$("#MenusBox").html(template("app/templates/wechat/menu/menus", {
				organization: App.organization.info,
				user: App.user.info
			}));
			renderMenus();
		}).fail(function(error) {
			Helper.alert(error);
		});
	};


	// 渲染菜单
	function renderMenus() {
		var menus = Menus.clone();
		var activeMainMenuId;
		var activeMenuId = $("#MenuSettingBox .personalized-form").attr("data-menu-id");
		if (activeMenuId) {
			var menu = getMenu(activeMenuId);
			if (menu) {
				activeMainMenuId = menu.info.parentId || menu.info.guid;
			}
		}

		$("#MenusBox .phone-footer").html(template("app/templates/wechat/menu/inner-menus", {
			organization: App.organization.info,
			user: App.user.info,
			menus: menus,
			activeMainMenuId: activeMainMenuId
		}));
	};

	// 渲染菜单编辑器
	function renderMenuInfo(menu) {
		var source = Modules.objOfAttr("code", menu.info.code);
		if (!source) {
			menu.info.code = "";
		}
		$("#MenuSettingBox").html(template("app/templates/wechat/menu/menu-editor", {
			menu: menu,
			modules: Modules,
			source: source || {}
		}));

		if (menu.info.type == "SYSTEM") {
			if (menu.info.code) {
				if (menu.info.code == "form") {
					menu.info.code = "questionnaires";
				}
				renderSystemMenu(menu);
			} else {
				renderSystemMenuSelector(menu);
			}
		} else if (menu.info.type == "THIRDPARTAPP") {
			if (menu.info.code) {
				renderThirdPartAppMenu(menu);
			} else {
				renderThirdPartAppMenuSelector(menu);
			}
		} else if (menu.info.type == "CUSTOM") {
			renderCustomMenu(menu);
		} else {
			renderSystemMenuSelector(menu);
		}

		renderMenus();
	};

	function renderSystemMenuSelector(menu) {
		var modules = Modules.clone();
		// 取系统模块菜单
		modules = modules.arrayWidthObjAttr("type", "SYSTEM");
		// 过滤掉个人菜单
		modules = modules.arrayWidthOutObjAttrs("code", ["history", "userzone"]);

		$("#MenuEditorBox").html(template("app/templates/wechat/menu/base-menus-box", {
			modules: modules,
			menu: menu
		}));
	};

	function renderThirdPartAppMenuSelector(menu) {
		var modules = Modules.clone();
		// 取系统模块菜单
		modules = modules.arrayWidthObjAttr("type", "THIRDPARTAPP");

		$("#MenuEditorBox").html(template("app/templates/wechat/menu/third-part-app-box", {
			modules: modules
		}));
	};

	function renderSystemMenu(menu) {
		$("#MenuEditorBox").html(template("app/templates/wechat/menu/base-menu-box", {
			menu: menu,
			source: Modules.objOfAttr("code", menu.info.code)
		}));
		renderMenuCategory(menu);
	};

	function renderThirdPartAppMenu(menu) {
		$("#MenuEditorBox").html(template("app/templates/wechat/menu/third-part-app", {
			menu: menu,
			source: Modules.objOfAttr("code", menu.info.code)
		}));
	};

	function renderCustomMenu(menu) {
		$("#MenuEditorBox").html(template("app/templates/wechat/menu/custom-menu-box", {
			menu: menu
		}));
	};



	/**
	 * 渲染未选择菜单时提示信息模板
	 */
	function renderEmptyBox3() {
		$("#MenuSettingBox").html(template("app/templates/wechat/menu/emptyMenu", {}));
	};

	/**
	 * 如果菜单为活动或者文章，需要渲染select控件
	 */
	function renderMenuCategory(menu) {
		if (Helper.param.search(menu.content ? menu.content : "", "justShowRelates")) {
			menu.info.justShowRelates = true;
		}

		if (menu.info.code == "events") {
			menu.info.categoryId = menu.info.categoryId || Helper.param.search(menu.content ? menu.content : "", "category");
			renderEventCategories(menu.info.categoryId || "");
		} else if (menu.info.code == "articles") {
			menu.info.categoryId = menu.info.categoryId || Helper.param.search(menu.content ? menu.content : "", "category");
			renderArticleCategories(menu.info.categoryId || "");
		} else if (menu.info.code == "proposal") {
			menu.info.categoryId = menu.info.categoryId || Helper.param.search(menu.content ? menu.content : "", "category");
			renderProposalCategories(menu.info.categoryId || "");
		} else if (menu.info.code == "home") {
			var tempId = Helper.param.search(menu.content ? menu.content : "", "mid");
			menu.info.homepageId = menu.info.homepageId || tempId;
			renderHomepages(menu.info.homepageId);
		} else if (menu.info.code == "orgs") {
			var categoryId = menu.info.categoryId || "";
			App.organization.getExhibitionCategories().done(function() {
				var categories = App.organization.exhibitionCategories.clone();
				categories.splice(0, 0, {
					id: "",
					name: "全部"
				});
				$(categories).each(function(idx, item) {
					item.value = item.id;
					item.selected = item.id == categoryId;
				});
				$("#Categories").html(template("app/templates/public/option", {
					options: categories
				})).select2();

				var selectedOption = categories.objOfAttr("selected", true);
				var mod = Modules.objOfAttr("code", "orgs") || {};
				$("#ModuleTitle").text(mod.name + (selectedOption ? "(" + selectedOption.name + ")" : ""));
			}).fail(function(error) {
				Helper.alert(error);
			});
		} else if (menu.info.code == "mxz-jiaowu") {
			App.organization.getRelatedMXZSchools().done(function() {
				var schools = App.organization.relatedMXZSchools.clone();
				if (!schools || schools.length == 0) {
					Helper.alert("使用 【课表/成绩】 查询功能需要在 【功能管理】 -> 【查课表/查成绩】 中添加学校列表以供学生选择。");
				}
			}).fail(function(error) {
				Helper.alert(error);
			});
		}
	};

	/**
	 * 文章分类下拉框渲染
	 */
	function renderArticleCategories(value) {
		var organization = App.organization;
		organization.getArticleCategories().done(function() {
			var options = organization.articleCategories.clone();
			options.splice(0, 0, {
				id: "",
				name: "全部"
			});

			$(options).each(function(idx, item) {
				item.value = item.id;
				item.selected = item.id == value;
			});
			$("#Categories").html(template("app/templates/public/option", {
				options: options
			})).select2();


			var selectedOption = options.objOfAttr("selected", true);
			var mod = Modules.objOfAttr("code", "events") || {};
			$("#ModuleTitle").text(mod.name + (selectedOption ? "(" + selectedOption.name + ")" : ""));
		}).fail(function(error) {
			Helper.alert(error);
		});
	}

	function renderEventCategories(value) {
		var organization = App.organization;
		organization.getEventCategories().done(function() {
			var options = organization.eventCategories.clone();
			options.splice(0, 0, {
				id: "",
				name: "全部"
			});

			$(options).each(function(idx, item) {
				item.value = item.id;
				item.selected = item.id == value;
			});
			$("#Categories").html(template("app/templates/public/option", {
				options: options
			})).select2();

			var selectedOption = options.objOfAttr("selected", true);
			var mod = Modules.objOfAttr("code", "events") || {};
			$("#ModuleTitle").text(mod.name + (selectedOption ? "(" + selectedOption.name + ")" : ""));
		}).fail(function(error) {
			Helper.alert(error);
		});
	}

	function renderProposalCategories(value) {
		var organization = App.organization;
		organization.getProposalCategories().done(function() {
			var options = organization.proposalCategories.clone();
			options.splice(0, 0, {
				id: "",
				name: "全部"
			});

			$(options).each(function(idx, item) {
				item.value = item.id;
				item.selected = item.id == value;
			});
			$("#Categories").html(template("app/templates/public/option", {
				options: options
			})).select2();

			var selectedOption = options.objOfAttr("selected", true);
			var mod = Modules.objOfAttr("code", "proposal") || {};
			$("#ModuleTitle").text(mod.name + (selectedOption ? "(" + selectedOption.name + ")" : ""));
		}).fail(function(error) {
			Helper.alert(error);
		});
	}

	// 微首页模板选择
	function renderHomepages(tempId) {
		App.organization.getHomepages().done(function() {
			var homepages = App.organization.homepages.clone();
			var options = [{
				value: "",
				name: "默认（主）微首页"
			}];
			$(homepages).each(function(idx, item) {
				options.push({
					value: item.id,
					name: item.name,
					selected: item.id == tempId
				});
			});

			$("#HOMETEMPLATES").html(template("app/templates/public/option", {
				options: options
			})).select2();
		}).fail(function(error) {
			Helper.alert(error);
		});
	};



	function getMenu(guid) {
		for (var i = 0, mainMenu; i < Menus.length; i++) {
			mainMenu = Menus[i];
			if (mainMenu.info.guid == guid) {
				return mainMenu;
			}
			var subMenus = Menus[i].subMenus || [];
			for (var j = 0, subMenu; j < subMenus.length; j++) {
				subMenu = subMenus[j];
				if (subMenu.info.guid == guid) {
					return subMenu;
				}
			};
		};

		return null;
	}

	function removeMenu(guid) {
		var menu = getMenu(guid);
		if (menu.info.parentId) {
			var parentMenu = getMenu(menu.info.parentId);
			for (var i = 0, menu; i < parentMenu.subMenus.length; i++) {
				if (parentMenu.subMenus[i].info.guid == guid) {
					parentMenu.subMenus.splice(i, 1);
					break;
				}
			};
		} else {
			for (var i = 0, menu; i < Menus.length; i++) {
				if (Menus[i].info.guid == guid) {
					Menus.splice(i, 1);
					break;
				}
			};
		}
	}

	function makeMenusContent(menus) {
		$(menus).each(function(i, mainMenu) {
			if (mainMenu.subMenus && mainMenu.subMenus.length > 0) {
				mainMenu.content = "I am a main button !"
				$(mainMenu.subMenus).each(function(j, subMenu) {
					(subMenu.info.type == "SYSTEM") && makeSystemMenuContent(subMenu);
				});
			} else {
				(mainMenu.info.type == "SYSTEM") && makeSystemMenuContent(mainMenu);
			}
		});
	};

	function makeSystemMenuContent(menu) {
		var source = Modules.objOfAttr("code", menu.info.code);

		if (menu.info.code == "home") {
			menu.content = Helper.config.pages.frontRoot + source.url + "&pid=" + menu.info.homepageId + "&title=" + menu.name;
		} else if (menu.info.code == "events" || menu.info.code == "articles"|| menu.info.code == "proposal" || menu.info.code == "orgs") {
			menu.content = Helper.config.pages.frontRoot + source.url + "&categoryId=" + (menu.info.categoryId || "") + "&title=" + menu.name;
		} else {
			menu.content = Helper.config.pages.frontRoot + source.url + "&title=" + menu.name;
		}
	};

	function indexOfMenu(menus, guid) {
		for (var i = 0; i < menus.length; i++) {
			if (menus[i].info.guid == guid) {
				return i;
			}
		};
		return -1;
	}
	// 交换数组元素
	function swapItems(arr, index1, index2) {
		arr[index1] = arr.splice(index2, 1, arr[index1])[0];
		return arr;
	};

	module.exports = Controller;
});