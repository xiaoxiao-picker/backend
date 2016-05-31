define(function(require, exports, module) {
	require("plugins/select2/select2.js");

	var Helper = require("helper");

	var baseController = require('baseController');
	var bC = new baseController();

	var template = require('template');

	var OrganizationService = require('OrganizationService');
	var HomePageService = require("HomePageService");
	var ArticleService = require("ArticleService");
	var EventService = require("EventService");

	var CONFIG = require("scripts/controllers/homepage/config");

	var pageRoot = "scripts/controllers/homepage/templates/";

	var orgId;
	var OrgInfo;

	var sourceId, HomePageInfo;

	// 是否关联过组织
	var HasRelatedOrgs;

	var Controller = function() {
		this.actions = {
			openTemplateSelector: openTemplateSelector,
			openTemplateNameEditor: function() {
				openTemplateNameEditor();
			},
			openMusicBox: openMusicBox,
			openBackgroundSetting: openBackgroundSetting,

			// 菜单
			createMenu: createMenu,
			removeMenu: removeMenu,
			checkMenu: checkMenu,

			// 轮播图
			addCarousel: addCarousel,
			removeCarousel: removeCarousel,
			checkCarousel: checkCarousel,

			selectMenu: selectMenu,

			// actions for menu
			updateMenuName: updateMenuName,
			openIconSelector: openIconSelector,
			openColorPicker: openColorPicker,
			openBackImage: openBackImage,
			updateMenu: updateMenu,
			resetMenu: resetMenu,
			switchToSystemMenu: switchToSystemMenu,
			switchToThirdPartyApp: switchToThirdPartyApp,
			switchToCustom: switchToCustom,

			saveHomePage: saveHomePage

		};
	};
	bC.extend(Controller);
	Controller.prototype.init = function(templateUrl, callback) {
		this.templateUrl = templateUrl;
		this.callback = callback;
		OrgInfo = App.organization.info;
		orgId = App.organization.info.id;
		sourceId = Helper.param.hash('sourceId');
		HomePageInfo = undefined;

		// 判断浏览器，低版本浏览器提示更新
		if (window.Modernizr && (!window.Modernizr.svg || !window.Modernizr.rgba)) {
			Helper.alert('您当前浏览器版本过低，请下载chrome或firefox等现代浏览器访问本页面！');
			Helper.execute(callback);
			return;
		}

		var url = Helper.config.pages.frontRoot + "/index.html#organization/" + orgId + "/index&pid=" + sourceId;
		Helper.globalRender(template(templateUrl, {
			sourceId: sourceId,
			orgId: orgId,
			url: url,
			qrcode: Helper.generateQRCode(url, App.getSession())
		}));

		Helper.copyClientboard(document.getElementById("CopyUrl"));

		Helper.execute(callback);

		if (sourceId == "add") {
			openTemplateSelector();
			return;
		}

		// 获取当前主题信息
		(function renderHomePageInfo() {
			HomePageService.get(orgId, sourceId).done(function(data) {
				data.result.json = $.parseJSON(data.result.json);
				require.async(pageRoot + data.result.json.template, function(Page) {
					HomePageInfo = Page(data.result);
					renderHomePage();
				});
			}).fail(function(error) {
				Helper.alert(error);
			});
		})();

	};

	// 渲染微首页
	function renderHomePage(options) {
		options = $.extend({
			orgInfo: OrgInfo,
			activeType: "MENU",
			activeIndex: 0,
			// 轮播图切换时回调
			onSlideChangeEnd: function(swiper) {
				var $form = $("#MenuSettingBox>.personalized-form");
				var index = +$form.attr("data-value");
				var type = $form.attr("data-type");
				if (!(type == "CAROUSEL" && swiper.activeIndex == index)) {
					renderCarouselEditor(swiper.activeIndex);
				}
			}
		}, options);
		var container = $("#HomePageContainer");
		HomePageInfo.render(container, options);
	};
	// 渲染菜单详情
	function renderMenuEditor(index) {
		var menu = HomePageInfo.json.menus[index];

		if (menu.code == "form") {
			Helper.alert("原有的“表单”和“问卷”这两个功能合并为一个功能，新功能命名为“问卷表单”，整合原有两者的优势，化繁为简！");
			menu.code = "questionnaires";
		}

		$("#MenuSettingBox").html(template("app/templates/homepage/menuEditor", {
			index: index,
			menu: menu,
			type: "MENU"
		}));

		if (menu.code == "xiaolianbang") {
			menu.type = "CUSTOM";
		}

		if (menu.type == "SYSTEM") {
			if (menu.code) {
				renderSystemMenu("MENU", menu);
			} else {
				renderSystemMenuSelector("MENU", menu);
			}
		} else if (menu.type == "THIRDPARTAPP") {
			if (menu.code) {
				renderThirdPartAppMenu("MENU", menu);
			} else {
				renderThirdPartAppMenuSelector("MENU", menu);
			}
		} else if (menu.type == "CUSTOM") {
			renderCustomMenu("MENU", menu);
		} else {
			renderSystemMenuSelector("MENU", menu);
		}
	};
	// 渲染轮播图详情
	function renderCarouselEditor(index) {
		var menu = HomePageInfo.json.carousels[index];

		$("#MenuSettingBox").html(template("app/templates/homepage/menuEditor", {
			index: index,
			menu: menu,
			type: "CAROUSEL"
		}));

		if (menu.type == "SYSTEM") {
			if (menu.code) {
				renderSystemMenu("CAROUSEL", menu);
			} else {
				renderSystemMenuSelector("CAROUSEL", menu);
			}
		} else if (menu.type == "THIRDPARTAPP") {
			if (menu.code) {
				renderThirdPartAppMenu("CAROUSEL", menu);
			} else {
				renderThirdPartAppMenuSelector("CAROUSEL", menu);
			}
		} else if (menu.type == "CUSTOM") {
			renderCustomMenu("CAROUSEL", menu);
		} else {
			renderSystemMenuSelector("CAROUSEL", menu);
		}
	};

	function renderSystemMenuSelector(menuType, menu) {
		var menus = CONFIG.menus;
		// 取系统模块菜单
		menus = menus.arrayWidthObjAttr("type", "SYSTEM");
		// 过滤掉个人菜单
		menus = menus.arrayWidthOutObjAttrs("code", ["home", "history", "userzone"]);

		$("#MenuEditorBox").html(template("app/templates/homepage/baseMenusBox", {
			menus: menus
		}));
	};

	function renderThirdPartAppMenuSelector(menuType, menu) {
		var menus = CONFIG.menus;
		// 取系统模块菜单
		menus = menus.arrayWidthObjAttr("type", "THIRDPARTAPP");

		$("#MenuEditorBox").html(template("app/templates/homepage/third-party-app-box", {
			menus: menus
		}));
	};

	function renderSystemMenu(menuType, menu) {
		if (menu.code == "events") {
			App.organization.getEventCategories().done(function() {
				var categories = App.organization.eventCategories.clone();
				render2(categories);
			}).fail(function(error) {
				Helper.alert(error);
			});
		} else if (menu.code == "articles") {
			App.organization.getArticleCategories().done(function() {
				var categories = App.organization.articleCategories.clone();
				render2(categories);
			}).fail(function(error) {
				Helper.alert(error);
			});
		} else if (menu.code == "proposal") {
			App.organization.getProposalCategories().done(function() {
				var categories = App.organization.proposalCategories.clone();
				render2(categories);
			}).fail(function(error) {
				Helper.alert(error);
			});
		} else if (menu.code == "orgs") {
			App.organization.getExhibitionCategories().done(function() {
				var categories = App.organization.exhibitionCategories.clone();
				render2(categories);
			}).fail(function(error) {
				Helper.alert(error);
			});
		} else if (menu.code == "mxz-jiaowu") {
			App.organization.getRelatedMXZSchools().done(function() {
				var schools = App.organization.relatedMXZSchools.clone();
				if (!schools || schools.length == 0) {
					Helper.alert("使用 【课表/成绩】 查询功能需要在 【功能管理】 -> 【查课表/查成绩】 中添加学校列表以供学生选择。");
				}
				render();
			}).fail(function(error) {
				Helper.alert(error);
			});
		} else {
			render();
		}

		function render(options) {
			$("#MenuEditorBox").html(template("app/templates/homepage/baseMenuBox", {
				type: menuType,
				menu: menu,
				menuSource: CONFIG.menus.objOfAttr("code", menu.code),
				options: options,
				template: HomePageInfo.json.template
			}));
		};

		function render2(opts) {
			var options = $.extend([], opts);
			options.splice(0, 0, {
				id: "",
				name: "全部"
			});
			var category = menu.categoryId || "";

			$(options).each(function(idx, option) {
				option.value = option.id;
				option.selected = option.id == category;
			});

			render(options);
			$("#Categories").select2();
		};
	};

	function renderThirdPartAppMenu(menuType, menu) {
		$("#MenuEditorBox").html(template("app/templates/homepage/third-party-app", {
			type: menuType,
			menu: menu,
			menuSource: CONFIG.menus.objOfAttr("code", menu.code),
			template: HomePageInfo.json.template
		}));
	};

	function renderCustomMenu(menuType, menu) {
		$("#MenuEditorBox").html(template("app/templates/homepage/customMenuBox", {
			type: menuType,
			menu: menu,
			template: HomePageInfo.json.template
		}));
	};

	/**
	 * actions
	 */
	// 打开模板选择器
	function openTemplateSelector() {
		var modal = Helper.modal({
			title: "个性化主题中心",
			className: "modal-module-selector"
		});
		modal.html(template("app/templates/homepage/module-selector", {
			templates: CONFIG.templates
		}));
		modal.addAction(".btn-select-template", "click", function() {
			var btn = this;
			var name = this.attr("data-value");
			var templates = CONFIG.templates;
			var template = templates.objOfAttr("name", name);
			if (!template) {
				Helper.alert("模板不存在！");
				return;
			}
			require.async(pageRoot + name, function(Page) {
				HomePageInfo = Page(HomePageInfo);
				// 如果当前微首页菜单数已超过上限，则自动取前面菜单
				var menus = HomePageInfo.json.menus;
				if (template.limit && template.limit.max && menus && menus.length > template.limit.max) {
					HomePageInfo.json.menus = HomePageInfo.json.menus.splice(0, template.limit.max);
				}
				// 重新渲染微首页
				renderHomePage();
				// 关闭模板选择器
				modal.destroy();
			});
		});
	};

	// 微首页主题名称填写
	function openTemplateNameEditor(save) {
		var btn = this;
		var modal = Helper.modal({
			title: "微首页主题名称"
		});
		modal.html(template("app/templates/public/single-input-modal", {
			name: "主题名称",
			placeholder: "取一个好点的主题名称吧",
			value: HomePageInfo.name || ""
		}));
		modal.addAction(".btn-save", "click", function() {
			var name = $.trim(modal.box.find("input.input").val());
			if (Helper.validation.isEmpty(name)) {
				Helper.errorToast("主题名称不能为空！");
				return;
			}
			HomePageInfo.name = name;
			modal.destroy();
			renderHomePage();
			if (save) {
				saveHomePage.call(btn);
			}
		});
	};

	function openMusicBox() {
		require.async("MusicBox", function(MusicBox) {
			MusicBox(HomePageInfo.json.backMusic, {
				title: '选择微首页背景音乐',
				success: function(url) {
					HomePageInfo.json.backMusic = url;
					this.destroy();
				}
			});
		});
	};

	function openBackgroundSetting() {
		require.async("ColorImagePicker", function(ColorImagePicker) {
			ColorImagePicker({
				title: "微首页背景设置",
				type: HomePageInfo.json.backColor ? "color" : "image",
				value: HomePageInfo.json.backColor || HomePageInfo.json.backImage || "",
				confirm: function(type, value) {
					if (type == "color") {
						HomePageInfo.json.backImage = "";
						HomePageInfo.json.backColor = "rgba(" + this.color.R + "," + this.color.G + "," + this.color.B + "," + 1 + ")";
						renderHomePage();
					} else if (type == "image") {
						if (!this.image) {
							Helper.alert("图片不能为空！");
							return;
						}
						HomePageInfo.json.backColor = "";
						HomePageInfo.json.backImage = this.image;
						renderHomePage();
					}
					this.destroy();
				},
				cancel: function() {
					this.destroy();
				}
			});
		});
	};


	// 查看菜单
	function checkMenu() {
		var index = +this.attr("data-index");
		renderMenuEditor(index);
	};
	// 添加菜单
	function createMenu() {
		HomePageInfo.addMenu(function() {
			renderHomePage();
			renderMenuEditor(HomePageInfo.json.menus.length - 1);
		});
	};
	// 删除菜单
	function removeMenu() {
		var index = +this.attr("data-index");
		HomePageInfo.removeMenu(index, function() {
			renderHomePage();
			if (HomePageInfo.json.menus.length) {
				renderMenuEditor(0);
			}
		});
	};
	// 查看轮播图
	function checkCarousel() {
		var index = +this.attr("data-value");
		renderCarouselEditor(index);
	};
	// 添加轮播图
	function addCarousel() {
		var index = HomePageInfo.json.carousels.length;
		HomePageInfo.addCarousel(function() {
			renderHomePage({
				activeType: "CAROUSEL",
				activeIndex: index
			});
			HomePageInfo.swiper.slideTo(index, 1000, false);
			renderCarouselEditor(index);
		});
	};
	// 删除轮播图
	function removeCarousel() {
		var index = +this.attr("data-value");
		HomePageInfo.removeCarousel(index, function() {
			if (HomePageInfo.json.carousels.length) {
				renderHomePage({
					activeType: "CAROUSEL",
					activeIndex: 0
				});
				renderCarouselEditor(0);
			}
		});
	};



	// 选择菜单模板
	function selectMenu() {
		var code = this.attr("data-code");
		var $form = this.parents(".personalized-form");
		var index = +$form.attr("data-value");
		var type = $form.attr("data-type");
		var menu = HomePageInfo.json[type.toLowerCase() + "s"][index];
		menu.code = code;
		if (type == "MENU") {
			renderMenuEditor(index);
		} else if (type == "CAROUSEL") {
			renderCarouselEditor(index);
		}
	};
	// 修改菜单名称
	function updateMenuName() {
		var $form = this.parents(".personalized-form");
		var index = +$form.attr("data-value");
		var type = $form.attr("data-type");
		var name = $.trim(this.val());
		var menu = HomePageInfo.json[type.toLowerCase() + "s"][index];
		menu.name = name;
		renderHomePage({
			activeType: type,
			activeIndex: index
		});
	};
	// 更新菜单地址
	function updateMenu() {
		var $form = this.parents(".personalized-form");
		var index = +$form.attr("data-value");
		var type = $form.attr("data-type");
		var menu = HomePageInfo.json[type.toLowerCase() + "s"][index];

		if (Helper.validation.isEmpty(menu.name)) {
			Helper.alert("名称不能为空！");
			return;
		}

		if (menu.type == "CUSTOM") {
			var url = $.trim(this.parents(".personalized-form").find(".CustomMenuUrl").val());
			if (Helper.validation.isEmpty(url)) {
				Helper.alert("自定义链接不能为空！");
				return;
			}
			menu.url = url;
			menu.param = "";
		} else {
			var menuSource = CONFIG.menus.objOfAttr("code", menu.code);
			menu.url = menuSource.url + "?oid=" + orgId;
			menu.param = "oid=" + orgId;
			if (menu.code == "articles" || menu.code == "events" || menu.code == "proposal"|| menu.code == "orgs") {
				var category = $("#Categories").val();
				if (category) {
					menu.url = menu.url + "&categoryId=" + category;
					menu.param += "&categoryId=" + category;
					menu.categoryId = category;
				}
			}
		}
		if (type == "MENU") {
			renderMenuEditor(index);
		} else if (type == "CAROUSEL") {
			renderCarouselEditor(index);
		}
	};
	// 重置菜单
	function resetMenu() {
		var $form = this.parents(".personalized-form");
		var index = +$form.attr("data-value");
		var type = $form.attr("data-type");
		var menu = HomePageInfo.json[type.toLowerCase() + "s"][index];
		if (menu.type == "CUSTOM") {
			menu.type = "SYSTEM";
		}
		menu.code = "";
		menu.url = "";
		if (type == "MENU") {
			renderMenuEditor(index);
		} else if (type == "CAROUSEL") {
			renderCarouselEditor(index);
		}
	};

	// 切换菜单为系统模块菜单
	function switchToSystemMenu() {
		var $form = this.parents(".personalized-form");
		var index = +$form.attr("data-value");
		var type = $form.attr("data-type");
		var menu = HomePageInfo.json[type.toLowerCase() + "s"][index];
		menu.type = "SYSTEM";
		if (type == "MENU") {
			renderMenuEditor(index);
		} else if (type == "CAROUSEL") {
			renderCarouselEditor(index);
		}
	};
	// 切换菜单为第三方应用菜单
	function switchToThirdPartyApp() {
		var $form = this.parents(".personalized-form");
		var index = +$form.attr("data-value");
		var type = $form.attr("data-type");
		var menu = HomePageInfo.json[type.toLowerCase() + "s"][index];
		menu.type = "THIRDPARTAPP";
		if (type == "MENU") {
			renderMenuEditor(index);
		} else if (type == "CAROUSEL") {
			renderCarouselEditor(index);
		}
	};
	// 切换菜单为自定义菜单
	function switchToCustom() {
		var $form = this.parents(".personalized-form");
		var index = +$form.attr("data-value");
		var type = $form.attr("data-type");
		var menu = HomePageInfo.json[type.toLowerCase() + "s"][index];
		menu.type = "CUSTOM";
		if (type == "MENU") {
			renderMenuEditor(index);
		} else if (type == "CAROUSEL") {
			renderCarouselEditor(index);
		}
	};
	// 图标选择器
	function openIconSelector() {
		var _btn = this;
		var $form = this.parents(".personalized-form");
		var index = +$form.attr("data-value");
		var type = $form.attr("data-type");
		var menu = HomePageInfo.json[type.toLowerCase() + "s"][index];
		require.async("ImageSelector", function(ImageSelector) {
			ImageSelector({
				value: menu.icon,
				systemCode: "ICON_FLAT",
				cut: function(image) {
					menu.icon = image;
					_btn.find("img").attr("src", image);
					renderHomePage({
						activeType: type,
						activeIndex: index
					});
					this.destroy();
				},
				choose: function(images) {
					var image = images[0];
					menu.icon = image;
					_btn.find("img").attr("src", image);
					renderHomePage({
						activeType: type,
						activeIndex: index
					});
					this.destroy();
				}
			});
		});
	};
	// 颜色选择器
	function openColorPicker() {
		var _btn = this;
		var $form = this.parents(".personalized-form");
		var index = +$form.attr("data-value");
		var type = $form.attr("data-type");
		var menu = HomePageInfo.json[type.toLowerCase() + "s"][index];
		require.async("ColorPicker", function(ColorPicker) {
			ColorPicker({
				value: menu.backColor,
				format: HomePageInfo.json.template == "SWIPERTILE" ? "RGB" : "RGBA",
				select: function(color) {
					color.A = HomePageInfo.json.template == "SWIPERTILE" ? 1 : color.A;
					var css = "rgba(" + color.R + "," + color.G + "," + color.B + "," + color.A + ")";
					menu.backColor = css;
					_btn.css("background", css);
					renderHomePage({
						activeType: type,
						activeIndex: index
					});
					this.destroy();
				},
				cancel: function() {
					this.destroy();
				}
			});
		});
	};
	// 菜单背景图片选择器
	function openBackImage() {
		var _btn = this;
		var $form = this.parents(".personalized-form");
		var index = +$form.attr("data-value");
		var type = $form.attr("data-type");
		var menu;
		if (type == "MENU") {
			menu = HomePageInfo.json.menus[index];
			HomePageInfo.selectMenuBackImage({
				title: "设置菜单背景图片",
				cut: cut,
				choose: choose,
				clean: clean
			});
		} else if (type == "CAROUSEL") {
			menu = HomePageInfo.json.carousels[index];
			HomePageInfo.selectCarouselBackImage({
				title: "设置轮播图图片",
				cut: cut,
				choose: choose
			});
		}

		function cut(image) {
			menu.backImage = image;
			renderHomePage({
				activeType: type,
				activeIndex: index
			});
			_btn.attr("src", image);
			this.destroy();
		}

		function choose(images) {
			menu.backImage = images[0];
			renderHomePage({
				activeType: type,
				activeIndex: index
			});
			_btn.attr("src", images[0]);
			this.destroy();
		}

		function clean() {
			menu.backImage = "";
			renderHomePage({
				activeType: type,
				activeIndex: index
			});
			_btn.attr("src", "");
			this.destroy();
		}

	};

	// 保存
	function saveHomePage(callback) {
		var _btn = this;
		var errors = {
			// 微首页名字为空，则要求填写名称
			name: function() {
				openTemplateNameEditor.call(_btn, true);
			},
			// 必须先选择模板
			template: openTemplateSelector,
			// 出错应该能指向具体错误的菜单，并提示具体错误
			menuName: menuError,
			menuIcon: menuError,
			menuURL: menuError,
			menuType: menuError,
			// 轮播图错误处理
			carouselName: carouselError,
			carouselType: carouselError,
			carouselURL: carouselError,
			carouselBackImage: carouselError
		};
		if (!HomePageInfo) {
			openTemplateSelector();
			return;
		}
		if (!HomePageInfo.validate(errors)) return;

		Helper.begin(_btn);
		var save;
		if (sourceId == "add") {
			save = HomePageService.add(orgId, HomePageInfo.name, HomePageInfo.parseToData()).done(function(data) {
				sourceId = data.result;
				Helper.go("#homepage/" + sourceId);
				Helper.execute(success, "微首页创建成功！");
				App.organization.getHomepages();
			});
		} else {
			save = HomePageService.update(orgId, sourceId, HomePageInfo.name, HomePageInfo.parseToData()).done(function(data) {
				Helper.execute(success, "微首页修改成功！");
			});
		}
		save.fail(function(error) {
			Helper.alert(error);
		}).always(function() {
			Helper.end(_btn);
		});

		function success(message) {
			Helper.execute(callback);
			Helper.confirm(message, {
				yesText: "返回列表",
				noText: "继续编辑"
			}, function() {
				Helper.go("#homepage/list");
			});
		}

		function menuError(options) {
			Helper.alert(options.message);
			renderMenuEditor(options.index);
		};

		function carouselError(options) {
			Helper.alert(options.message);
			renderCarouselEditor(options.index);
		};
	};

	// 保存微首页信息并执行回调
	function save(success, error, always) {
		if (sourceId == "add") {
			HomePageService.add(orgId, HomePageInfo.name, HomePageInfo.parseToData()).done(function(data) {
				sourceId = data.result;
				Helper.go("#homepage/" + sourceId);
				Helper.execute(success, "微首页创建成功！");
			}).fail(function(errorMessage) {
				Helper.execute(error, errorMessage);
			}).always(function() {
				Helper.execute(always);
			});
		} else {
			HomePageService.update(orgId, sourceId, HomePageInfo.name, HomePageInfo.parseToData()).done(function(data) {
				Helper.execute(success, "微首页修改成功！");
			}).fail(function(errorMessage) {
				Helper.execute(error, errorMessage);
			}).always(function() {
				Helper.execute(always);
			});
		}
	};

	module.exports = Controller;
});