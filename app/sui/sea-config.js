var DEBUG = location.href.indexOf("debug") > 0;
var JSEXT = DEBUG ? "/debug" : "";
var VERSION = "2.7.6";

// config file
seajs.config({

	// 别名配置
	alias: {
		"template": "scripts/public/template",
		"uploadify": "plugins/uploadify/jquery.uploadify",

		"baseController": "scripts/baseController",

		// factory
		"factory.application": "scripts/factory/application",
		"factory.organization": "scripts/factory/organization",
		"factory.user": "scripts/factory/user",
		"factory.guid": "scripts/factory/guid",

		// public
		"ajaxHandler": "scripts/public/ajaxHandler",
		"array": "scripts/public/array",
		"browser": "scripts/public/browser",
		"config": "scripts/public/config",
		"DataFilter": "scripts/public/DataFilter",
		"date": "scripts/public/date",
		"eventListener": "scripts/public/eventListener",
		"formatCurrency": "scripts/public/formatCurrency",
		"generateQRCode": "scripts/public/generateQRCode",
		"helper": "scripts/public/helper",
		"Alert": "scripts/public/Ly.alert",
		"Toast": "scripts/public/Ly.toast",
		"Tooltip": "scripts/public/Ly.tooltip",
		"Modal": "scripts/public/Ly.modal",
		"Dropdown": "scripts/public/Ly.dropdown",
		"router": "scripts/public/router",
		"smartEvent": "scripts/public/smartEvent",
		"validation": "scripts/public/validation",

		"requireUserInfo": "scripts/public/requireUserInfo",
		"NotificationBox": "scripts/public/NotificationBox",
		"observe": "scripts/public/observe",

		// lib/notification
		"systemBox": "scripts/lib/notification/systemBox",
		"memberBox": "scripts/lib/notification/memberBox",
		"feedbackBox": "scripts/lib/notification/feedbackBox",
		"proposalBox": "scripts/lib/notification/proposalBox",
		"otherBox": "scripts/lib/notification/otherBox",

		// lib
		"AdvertSelector": "scripts/lib/AdvertSelector",
		"Applicant": "scripts/lib/Applicant",
		"ATM": "scripts/lib/ATM",
		"Color": "scripts/lib/Color",
		"ColorPicker": "scripts/lib/ColorPicker",
		"ColorImagePicker": "scripts/lib/ColorImagePicker",
		"CommonModal": "scripts/lib/CommonModal",
		"lib.commentBox": "scripts/lib/commentBox",
		"lib.textareaModal": "scripts/lib/textareaModal",
		"dateCompare": "scripts/lib/dateCompare",
		"FormBox": "scripts/lib/FormBox",
		"FormModel": "scripts/lib/FormModel",
		"ueditor": "scripts/lib/ueditor",
		"SchoolSelector": "scripts/lib/SchoolSelector",
		"UserSelector": "scripts/lib/UserSelector",
		"MusicBox": "scripts/lib/MusicBox",
		"ChartBox": "scripts/lib/ChartBox",
		"facebox": "scripts/lib/facebox",
		"linkbox": "scripts/lib/linkbox",
		"ImageSelector": "scripts/lib/ImageSelector",
		"ImageBrowser": "scripts/lib/ImageBrowser",
		"ImageCrop": "scripts/lib/ImageCrop",
		"VoteSelector": "scripts/lib/VoteSelector",
		"TicketSelector": "scripts/lib/TicketSelector",
		"GuideModal": "scripts/lib/GuideModal",
		"KeywordModel": "scripts/lib/KeywordModel",
		"lib.UserModal": "scripts/lib/userModal",
		"lib.MemberModal": "scripts/lib/MemberModal",
		"SignUpTimeBox": "scripts/lib/SignUpTimeBox",
		"TicketTimeBox": "scripts/lib/TicketTimeBox",
		"OrganizationModal": "scripts/lib/OrganizationModal",
		"lib.richEditorModal": "scripts/lib/richEditorModal",
		// 登陆层
		"lib.LoginModal": "scripts/lib/LoginModal",
		"lib.ImageModal": "scripts/lib/ImageModal",
		"lib.CategorySelector": "scripts/lib/CategorySelector",
		"lib.DatetimeGroup": "scripts/lib/datetimeGroup",
		"lib.Pagination": "scripts/lib/Pagination",

		// config
		"config.colors": "scripts/config/colors",
		"config.icons": "scripts/config/icons",
		"config.func-guide": "scripts/config/func-guide",
		"config.bank": "scripts/config/bank",

		// models
		"UserModel": "scripts/models/UserModel",



		// services
		"AdvertisementService": "scripts/services/AdvertisementService",
		"ArticleService": "scripts/services/ArticleService",
		"AutoreplyService": "scripts/services/AutoreplyService",
		"CommentService": "scripts/services/CommentService",
		"EventService": "scripts/services/EventService",
		"ExportService": "scripts/services/ExportService",
		"FeedbackService": "scripts/services/FeedbackService",
		"HomePageService": "scripts/services/HomePageService",
		"LostService": "scripts/services/LostService",
		"MemberApplyService": "scripts/services/MemberApplyService",
		"MemberService": "scripts/services/MemberService",
		"NoticeService": "scripts/services/NoticeService",
		"OrganizationService": "scripts/services/OrganizationService",
		"NotificationService": "scripts/services/NotificationService",
		"ProposalService": "scripts/services/ProposalService",
		"PublicService": "scripts/services/PublicService",
		"QuestionnaireService": "scripts/services/QuestionnaireService",
		"RelationService": "scripts/services/RelationService",
		"ResourceService": "scripts/services/ResourceService",
		"TicketService": "scripts/services/TicketService",
		"UserService": "scripts/services/UserService",
		"VoteService": "scripts/services/VoteService",
		"WechatService": "scripts/services/WechatService",
		"WallService": "scripts/services/WallService",
		"WechatAttentionService": "scripts/services/WechatAttentionService",
		"WechatAuthService": "scripts/services/WechatAuthService",
		"WechatResourceService": "scripts/services/WechatResourceService",
		"WalletService": "scripts/services/WalletService",
		"SchoolService": "scripts/services/SchoolService",
		"TaskService": "scripts/services/TaskService",
		"ReportService": "scripts/services/ReportService",
		"MXZService": "scripts/services/MXZService",
		"LotteryService": "scripts/services/LotteryService",

		// plugins
		"datetimepicker": "plugins/datetimepicker/bootstrap-datetimepicker",
		"hashchange": "plugins/hashchange",
		"ueditor.all": "plugins/ueditor/ueditor.all",
		"ueditor.config": "plugins/ueditor/ueditor.config",
		"select2": "plugins/select2/select2",
		"select2.css": "plugins/select2/select2.css"
	},

	// 路径配置
	paths: {
		"gallery": "https://a.alipayobjects.com/gallery"
	},

	// 变量配置
	vars: {
		"locale": "zh-cn"
	},

	// 映射配置
	map: [
		// [".js", ".js?v=1.11.4"]
		[/^((.*\/scripts)(\/.*)\.js)$/i, "$2" + JSEXT + "$3.js?v=" + VERSION],
		[/^(.*\/styles\/.*\.css)$/i, "$1?v=" + VERSION]
	],

	// 预加载项
	preload: [
		this.jQuery ? "" : "jquery"
	],

	// 调试模式
	debug: false,

	// Sea.js 的基础路径
	// base: "/oa/",
	base: "/",

	// 文件编码
	charset: "utf-8"
});
(function() {
	var SUI = window.SUI = window.SUI || {},
		older_SUI, _VERSION = SUI._Version = "0.0.1";
	SUI.noConflict = function() {
		return SUI;
	};
	SUI.version = function() {
		SUI.debug(SUI._Version);
	};
	SUI.debug = function(msg) {
		console.log(msg);
	};
	// 封装seajs模块
	SUI.use = seajs.use;
})();