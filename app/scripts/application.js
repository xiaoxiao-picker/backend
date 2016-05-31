//
//                   _ooOoo_
//                  o8888888o
//                  88" . "88
//                  (| -_- |)
//                  O\  =  /O
//               ____/`---'\____
//             .'  \\|     |//  `.
//            /  \\|||  :  |||//  \
//           /  _||||| -:- |||||-  \
//           |   | \\\  -  /// |   |
//           | \_|  ''\---/''  |   |
//           \  .-\__  `-`  ___/-. /
//         ___`. .'  /--.--\  `. . __
//      ."" '<  `.___\_<|>_/___.'  >'"".
//     | | :  `- \`.;`\ _ /`;.`/ - ` : | |
//     \  \ `-.   \_ __\ /__ _/   .-` /  /
//======`-.____`-.___\_____/___.-`____.-'======
//                   `=---='
//^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^
//            佛祖保佑       永无BUG


/**
 * 项目的入口文件，主要负责一下职责：
 * 1. app的初始化工作，包括基础模块的注入、Application对象的初始化
 * 2. hash层变化的监听
 * 3. 解析路由
 * 4. 任务分发，即控制controller层的init执行和actions绑定
 * 5. 菜单相关事件的处理
 */
define(function(require, exports, module) {
	require('hashchange');
	require('array');
	require('date');
	require("Tooltip");
	require("Dropdown");

	// 全局定义快捷键
	var SE = require("smartEvent");
	
	var hash = decodeURI(window.location.hash);
	var controller = null;
	var template = require('template');
	var previousController;
	var previousControllerNS = "";
	var router = require('router');
	var Helper = require("helper");

	var Application = require('factory.application');

	var notificationBox = require("NotificationBox");

	var firstLevelController = getMenuByHash(hash);

	var appController = require("scripts/controllers/public/appController");
	// 渲染函数，根据controller参数实例化控制器，保存到controller参数
	var render = function(controller, fnCallback) {
			var controllerBase = "scripts/controllers/",
				templateBase = "app/templates/",
				_controller = controller, // 避免在SUI.use环境中参数污染controller变量
				routeRes = router(_controller),
				templateName = templateBase + ((routeRes && routeRes['template']) ? routeRes['template'] : controller),
				controllerName = controllerBase + ((routeRes && routeRes['controller']) ? routeRes['controller'] : (controller + "Controller")),
				firstLevelController = (routeRes && routeRes['menu']) ? routeRes['menu'] : "";
			SUI.use(controllerName, function(Controller) {
				// 判断Controller是否存在，避免用户输入错误url导致系统卡死				
				if (!Controller) {
					Helper.execute(fnCallback);
					Helper.globalRender(template("app/templates/partial/error", {
						errorCode: "404",
						message: "无效的URL地址！！！"
					}));
					return;
				}

				//第一次修改信息成功后显示引导信息
				// if (window.location.hash != "#edit" && App.userInfo.config.needOrgInfoEditGuide) {
				// 	require.async("GuideModal", function(GuideModal) {
				// 		GuideModal({});
				// 	});
				// }

				var controller = new Controller();
				controller.templateUrl = templateName;
				controller.dom = $("#content");
				controller.callback = function() {
					Helper.execute(fnCallback);
					Application.controller = controller;
				};
				try {
					$.isFunction(controller.isController) && controller.isController() && controller.init(controller.templateUrl, controller.callback);
				} catch (error) {
					Helper.execute(fnCallback);
					console && console.error && (console.error(error));
					Helper.globalRender(template("app/templates/partial/error", {
						errorCode: "404",
						message: "页面出错，请联系管理员！"
					}));
				}

				var namespace = controller.namespace || _controller.replace(/\//g, ".").toLowerCase();
				previousController = controller;
				// 在主循环中保存上一个对象的NS,用于解绑.NS命名空间下的事件委托,防止内存溢出
				previousControllerNS = namespace;
				// 绑定[data-xx-action]事件
				Helper.globalEventListener("click." + namespace, "data-xx-action", controller.actions);
				Helper.globalEventListener("change." + namespace, "data-xx-change-action", controller.actions, true);
				Helper.globalEventListener("keyup." + namespace, "data-xx-keyup-action", controller.actions, true);
				Helper.globalEventListener("focus." + namespace, "data-xx-focus-action", controller.actions, true);
			});
		},
		sidebarRender = function(el) {
			if (typeof el === "object") {
				el.parents("ul.sidebar-nav").find("ul.level2>li.active").removeClass("active");
				el.addClass("active");
			} else if (typeof el === "string") {
				if (el) {
					$("ul.level2 li").removeClass("active");
					$("ul.level2 li." + $.trim(el)).addClass("active").parents("li").addClass("active").siblings("li").removeClass("active");
				}
			}
		};
	// 监听Sidebar点击事件
	$(document).on("click.application.sidebar", "ul.level2 > li", function() {
		var $this = $(this);
		sidebarRender($this);
	});
	// 点击一级菜单
	$(document).on("click.application.sidebar", "ul.level1 .menu-title", function() {
		$(this).parent().toggleClass("active").siblings("li").removeClass("active");
	});

	// 监听路由变化开始
	$(document).on("sui.mvc.router.change.start", function() {
		$(document).scrollTop(0);
		Application.loader.begin();
		var ns = previousControllerNS || "index";
		$(document).off("." + ns);
		/**
		 * fixed：添加全局页面加载状态，防止当前页面在数据请求过程中渲染其他模板
		 * 需要在ajax请求失败的时候手动触发sui.mvc.router.change.end事件
		 */
		$(window).data("loadingHash", window.location.hash);

		// 关闭所有modal层
		Helper.modal().clear();
		$(document.body).children(".tooltip").remove();
		$(document.body).children(".datetimepicker").remove();

		if (Application.controller && Application.controller.downloadTasks) {
			var downloadTasks = Application.controller.downloadTasks;
			for (var taskName in downloadTasks) {
				if (downloadTasks[taskName].state == "RUNNING") {
					clearTimeout(taskName);
				}
			}
			downloadTasks = {};
		}
	});
	// 监听路由变化结束
	$(document).on("sui.mvc.router.change.end", function() {
		Application.loader.end();
		$(window).removeData("loadingHash");
		var firstLevel = getMenuByHash(hash);
		sidebarRender(firstLevel);
	});
	// 监听APP级别的hashchange事件
	$(window).on('hashchange.application', function() {
		/**
		 * 如果页面处于加载状态则不进行页面跳转
		 */
		var loadingHash = $(window).data("loadingHash");
		if (loadingHash) {
			window.location.hash = loadingHash; //--TODO:此处修改hash会再次触发hashchange事件
			return;
		}


		// 如果上一个页面正在编辑状态，提示保存！！
		if (previousController && previousController.editing && previousController.autoSaveTips && previousController.autoSave) {
			var autoSave = function() {
				previousController.autoSave(applicationStart)
			};
			var autoSaveTips = previousController.autoSaveTips;
			// Helper.confirm(autoSaveTips, {}, function() {
			Helper.execute(autoSave);
			// }, applicationStart);
			return;
		}

		applicationStart();

		function applicationStart() {
			// 如果上一个页面有destroy方法，则执行该方法
			// controller中包含 setTimeout、setInterval、或同名UEditor实例化时需要设置destroy方法
			if (previousController && previousController.destroy) {
				var destroy = previousController.destroy;
				Helper.execute(destroy);
			}

			$(document).trigger("sui.mvc.router.change.start");
			hash = window.location.hash;
			/**
			 * Fix Bug: 修复hash无法匹配中文的错误
			 */
			controller = hash ? hash.match(/^#([\w\/\-\u4e00-\u9fa5]+)\??/)[1] : 'index';
			render(controller, function() {
				// 渲染完成后执行 hashChange end
				$(document).trigger("sui.mvc.router.change.end");

				// 允许controller向下一个controller中注册行为
				Helper.execute(Application.nextControllerAction);
				delete Application.nextControllerAction;
			});
		}

	});
	// 初始化用户，全局唯一的用户示例
	var App = window.App = window.Application = Application;

	// 初始化用户信息
	App.init(function() {
		// 去除模板蒙版层
		$('div.front-loading').after(template('app/templates/application', {
			user: App.user,
			organization: App.organization
		})).hide();

		window.NotificationBox = notificationBox($('#NotificationBox'), {});
		// 获取未读消息数
		NotificationBox.getUnreadCount();

		// 根据初级控制器指定渲染特定SideBar
		sidebarRender(firstLevelController);

		// 手动触发APP界别
		$(window).trigger('hashchange.application');

		App.organization.authWechat();
	});

	// 全局添加表单失去焦点验证监听
	Helper.listeners.inputBlurValidation();

	function getMenuByHash(hash) {
		var controller = hash ? hash.match(/^#([\w\/\u4e00-\u9fa5\\-]+)\??/)[1] : 'index';
		var thisRouter = router(controller);
		if (!thisRouter || !thisRouter["menu"]) return "";
		var menu = thisRouter["menu"];
		if (menu.indexOf(':') != -1) {
			return Helper.param.hash(menu.replace(':', ''), hash);
		}
		return (router(controller) && router(controller)['menu']) ? router(controller)['menu'] : "";
	}

	if (!window.SmartEvent) {
		var SmartEvent = window.SmartEvent = new SE();
		SmartEvent.init();
	}

	// 若点击的a标签地址与当前地址相同时手动触发hashchange事件
	$(document).on("click.application", "a", function() {
		if (window.location.hash == $(this).attr("href")) {
			$(window).trigger('hashchange.application');
		}
	});

	var globalActions = require("scripts/public/global-actions");
	Helper.globalEventListener("click.global", "data-xx-action", globalActions);
});