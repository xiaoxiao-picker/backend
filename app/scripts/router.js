define({
	/* =============组织管理============== */
	"index": {
		controller: "organization/infoController",
		template: "organization/info"
	},
	"edit": {
		controller: "organization/editController",
		template: 'organization/edit'
	},

	/* =============当前用户============== */
	"user/edit": {
		controller: "user/editController",
		template: "user/edit"
	},

	/* =============文章相关============== */
	"articles": {
		controller: "article/listController",
		template: "article/list",
		menu: "Article"
	},
	"article/:articleId/info": {
		regExp: "article\\/([a-zA-Z0-9\\-]+)\\/info",
		controller: "article/infoController",
		template: "article/info",
		menu: "Article"
	},
	"article/:articleId/edit": {
		regExp: "article\\/([a-zA-Z0-9\\-]+)\\/edit",
		controller: "article/editController",
		template: "article/edit",
		menu: "Article"
	},
	"article/categories": {
		controller: "article/categoryController",
		template: "article/categories",
		menu: "Article"
	},

	/* =============活动相关============== */
	"events": {
		controller: "event/listController",
		template: "event/list",
		menu: "Event"
	},
	"event/:eventId/info": {
		regExp: "event\\/([a-zA-Z0-9\\-]+)\\/info",
		controller: "event/infoController",
		template: "event/info",
		menu: "Event"
	},
	"event/:eventId/edit": {
		regExp: "event\\/([a-zA-Z0-9\\-]+)\\/edit",
		controller: "event/editController",
		template: "event/edit",
		menu: "Event"
	},
	"event/categories": {
		controller: "event/categoryController",
		template: "event/categories",
		menu: "Event"
	},

	/* =============投票管理============== */
	"vote/guide": {
		controller: "vote/guideController",
		template: "vote/guide",
		menu: "Vote"
	},
	"vote/default/list": {
		controller: "vote/default/listController",
		template: "vote/default/list",
		menu: "Vote"
	},
	"vote/ugc/list": {
		controller: "vote/ugc/listController",
		template: "vote/ugc/list",
		menu: "Vote"
	},
	"vote/default/:voteId/edit": {
		regExp: "vote\\/default\\/([a-zA-Z0-9\\-]+)\\/edit",
		controller: "vote/default/editController",
		template: "vote/default/edit",
		menu: "Vote"
	},
	"vote/ugc/:voteId/edit": {
		regExp: "vote\\/ugc\\/([a-zA-Z0-9\\-]+)\\/edit",
		controller: "vote/ugc/editController",
		template: "vote/ugc/edit",
		menu: "Vote"
	},
	"vote/ugc/:voteId/options": {
		regExp: "vote\\/ugc\\/([a-zA-Z0-9\\-]+)\\/options",
		controller: "vote/ugc/optionsController",
		template: "vote/ugc/options",
		menu: "Vote"
	},
	"vote/relation/:sourceType/:sourceId/list": {
		regExp: "vote\\/relation\\/([a-zA-Z\\-]+)\\/([a-zA-Z0-9\\-]+)\\/list",
		controller: "vote/relationController",
		template: "vote/relation",
		menu: ":sourceType"
	},

	/* =============电子票管理============== */
	"tickets": {
		controller: "ticket/listController",
		template: "ticket/list",
		menu: "Ticket"
	},
	"ticket/:ticketId/edit": {
		regExp: "ticket\\/([a-zA-Z0-9\\-]+)\\/edit",
		controller: "ticket/editController",
		template: "ticket/edit",
		menu: "Ticket"
	},
	"ticket/relation/:sourceType/:sourceId/list": {
		regExp: "ticket\\/relation\\/([a-zA-Z\\-]+)\\/([a-zA-Z0-9\\-]+)\\/list",
		controller: "ticket/relationController",
		template: "ticket/relation",
		menu: ":sourceType"
	},

	/* =============成员管理============== */
	// 成员列表
	"members": {
		controller: "member/membersController",
		template: "member/members",
		menu: "Member"
	},
	// 
	"Emembers": {
		controller: "member/E-membersController",
		template: "member/E-members",
		menu: "Resume"
	},
	// 新申请成员列表
	"members/applied": {
		controller: "member/appliedController",
		template: "member/applied",
		menu: "Member"
	},

	// 成员分组管理
	"member/groups": {
		controller: "member/groupController",
		template: "member/groups",
		menu: "Member"
	},

	/* =============公告管理============== */
	"notices": {
		controller: "notice/listController",
		template: "notice/list",
		menu: "Notice"
	},
	"notice/:noticeId/info": {
		regExp: "notice\\/([a-zA-Z0-9\\-]+)\\/info",
		controller: "notice/infoController",
		template: "notice/info",
		menu: "Notice"
	},
	"notice/:noticeId/edit": {
		regExp: "notice\\/([a-zA-Z0-9\\-]+)\\/edit",
		controller: "notice/editController",
		template: "notice/edit",
		menu: "Notice"
	},

	/* =============问卷调查============== */
	"questionnaires": {
		controller: "questionnaire/listController",
		template: "questionnaire/list",
		menu: "Questionnaire"
	},
	// 编辑
	"questionnaire/:questionnaireId/edit": {
		regExp: "questionnaire\\/([a-zA-Z0-9\\-]+)\\/edit",
		controller: "questionnaire/editController",
		template: "questionnaire/edit",
		menu: "Questionnaire"
	},
	// 详情
	"questionnaire/:questionnaireId/info": {
		regExp: "questionnaire\\/([a-zA-Z0-9\\-]+)\\/info",
		controller: "questionnaire/infoController",
		template: "questionnaire/info",
		menu: "Questionnaire"
	},

	/* =============用户反馈============== */
	"feedbacks": {
		controller: "feedback/listController",
		template: "feedback/list",
		menu: "Feedback"
	},
	"feedback/:feedbackId/info": {
		regExp: "feedback\\/([a-zA-Z0-9\\-]+)\\/info",
		controller: "feedback/infoController",
		template: "feedback/info",
		menu: "Feedback"
	},

	/* =============组织风采============== */
	"organization/list": {
		controller: "organization/listController",
		template: 'organization/list',
		menu: "List"
	},
	"search": {
		controller: "organization/searchController",
		template: 'organization/search',
		menu: "Organizations"
	},
	"categories": {
		controller: "organization/categoryController",
		template: "organization/categories",
		menu: "Organizations"
	},
	"exhibition/:orgExhibitionId/edit": {
		regExp: "exhibition\\/([a-zA-Z0-9\\-]+)\\/edit",
		controller: "organization/exhibition/editController",
		template: 'organization/exhibition/edit',
		menu: "Organizations"
	},

	/* =============关联社团============== */
	"relation/list": {
		controller: "organization/relation/listController",
		template: "organization/relation/list",
		menu: "Relation"
	},
	"relation/search": {
		controller: "organization/relation/searchController",
		template: "organization/relation/search",
		menu: "Relation"
	},

	/* =============微信墙============== */
	"walls": {
		controller: "wall/listController",
		template: "wall/list",
		menu: "Wall"
	},
	"wall/:wallId/edit": {
		regExp: "wall\\/([a-zA-Z0-9\\-]+)\\/edit",
		controller: "wall/editController",
		template: "wall/edit",
		menu: "Wall"
	},
	"wall/:wallId/check": {
		regExp: "wall\\/([a-zA-Z0-9\\-]+)\\/check",
		controller: "wall/checkController",
		template: "wall/check",
		menu: "Wall"
	},
	"wall/:wallId/lottery": {
		regExp: "wall\\/([a-zA-Z0-9\\-]+)\\/lottery",
		controller: "wall/lotteryController",
		template: "wall/lottery",
		menu: "Wall"
	},

	/* =============微信============== */
	// 公众号信息
	"wechat/info": {
		controller: "wechat/infoController",
		template: "wechat/info",
		menu: "WechatBind"
	},

	// 个性化公众号向导 设置菜单/选择微首页模板
	"wechat/guide": {
		controller: "wechat/guideController",
		template: "wechat/guide",
		menu: "Personalized"
	},
	// 个性化公众号 设置菜单
	"wechat/menu": {
		controller: "wechat/menu/menuController",
		template: "wechat/menu/menu",
		menu: "Personalized"
	},
	// 个性化公众号 微首页模板向导
	"homepage/guide": {
		controller: "homepage/guideController",
		template: "homepage/guide",
		menu: "Personalized"
	},
	// 个性化公众号 微首页模板列表
	"homepage/list": {
		controller: "homepage/listController",
		template: "homepage/list",
		menu: "Personalized"
	},
	// 个性化公众号 选择微首页模板编辑
	"homepage/:sourceId": {
		regExp: "homepage\\/([a-zA-Z0-9\\-]+)",
		controller: "homepage/editController",
		template: "homepage/edit",
		menu: "Personalized"
	},


	/* =============自定义回复============== */
	"autoreply/:replyType/list": {
		regExp: "autoreply\\/([a-zA-Z]+)\\/list",
		controller: "autoreply/listController",
		template: "autoreply/list",
		menu: ":replyType"
	},
	"autoreply/:replyType/builtin": {
		regExp: "autoreply\\/([a-zA-Z]+)\\/builtin",
		controller: "autoreply/builtinController",
		template: "autoreply/builtin",
		menu: ":replyType"
	},
	"autoreply/:replyType/TEXT/:replyId": {
		regExp: "autoreply\\/([a-zA-Z0-9\\-]+)\\/TEXT\\/([a-zA-Z0-9\\-]+)",
		controller: "autoreply/textController",
		template: "autoreply/edit-text",
		menu: ":replyType"
	},
	"autoreply/:replyType/PICTURE/:replyId": {
		regExp: "autoreply\\/([a-zA-Z0-9\\-]+)\\/PICTURE\\/([a-zA-Z0-9\\-]+)",
		controller: "autoreply/imageController",
		template: "autoreply/edit-image",
		menu: ":replyType"
	},
	"autoreply/:replyType/ARTICLE/:replyId": {
		regExp: "autoreply\\/([a-zA-Z0-9\\-]+)\\/ARTICLE\\/([a-zA-Z0-9\\-]+)",
		controller: "autoreply/graphicController",
		template: "autoreply/edit-graphic",
		menu: ":replyType"
	},
	"autoreply/:replyType/RELATION/:replyId": {
		regExp: "autoreply\\/([a-zA-Z0-9\\-]+)\\/RELATION\\/([a-zA-Z0-9\\-]+)",
		controller: "autoreply/relationController",
		template: "autoreply/edit-relation",
		menu: ":replyType"
	},

	/* =============功能引导============== */
	"funcGuide/:sourceType": {
		regExp: "funcGuide\\/([a-zA-Z0-9\\-]+)",
		controller: "public/funcGuideController",
		template: "public/func-guide/box",
		menu: "FuncGuide"
	},

	/* =============广告============== */
	"advertisement/:sourceType/:sourceId/info": {
		regExp: "advertisement\\/([a-zA-Z0-9\\-]+)\\/([a-zA-Z0-9\\-]+)\\/info",
		controller: "advertisement/infoController",
		template: "advertisement/info",
		menu: "Advertisement"
	},


	/* =============提案============== */
	"proposals": {
		controller: "proposal/listController",
		template: "proposal/list",
		menu: "Proposal"
	},
	"proposal/list": {
		controller: "proposal/listController",
		template: "proposal/list",
		menu: "Proposal"
	},
	"proposal/:proposalId/info": {
		regExp: "proposal\\/([a-zA-Z0-9\\-]+)\\/info",
		controller: "proposal/infoController",
		template: "proposal/info",
		menu: "Proposal"
	},
	"proposal/categories": {
		controller: "proposal/categoryController",
		template: "proposal/categories",
		menu: "Proposal"
	},

	/* =============失物管理============== */
	"losts": {
		controller: "lost/listController",
		template: "lost/list",
		menu: "Lost"
	},
	"lost/:lostId/edit": {
		regExp: "lost\\/([a-zA-Z0-9\\-]+)\\/edit",
		controller: "lost/editController",
		template: "lost/edit",
		menu: "Lost"
	},

	/* =============素材管理============== */
	// 音乐列表
	"resource/music/list": {
		controller: "resource/music/listController",
		template: "resource/music/list",
		menu: "XiaoxiaoResource"
	},
	// 文件管理
	"resource/file/list": {
		controller: "resource/file/listController",
		template: "resource/file/list",
		menu: "XiaoxiaoResource"
	},
	// 图片管理
	"resource/image/list": {
		controller: "resource/image/listController",
		template: "resource/image/list",
		menu: "XiaoxiaoResource"
	},
	// 微信图片
	"resource/weixin/image/list": {
		controller: "resource/weixin/image/listController",
		template: "resource/weixin/image/list",
		menu: "WeixinResource"
	},
	// 微信图文消息
	"resource/weixin/graphic/list": {
		controller: "resource/weixin/graphic/listController",
		template: "resource/weixin/graphic/list",
		menu: "WeixinResource"
	},
	"resource/weixin/graphic/:resourceId/edit": {
		regExp: "resource\\/weixin\\/graphic\\/([a-zA-Z0-9\\-]+)\\/edit",
		controller: "resource/weixin/graphic/editController",
		template: "resource/weixin/graphic/edit",
		menu: "WeixinResource"
	},
	// 微信语音
	"resource/weixin/voice/list": {
		controller: "resource/weixin/voice/listController",
		template: "resource/weixin/voice/list",
		menu: "WeixinResource"
	},
	// 微信视频
	"resource/weixin/video/list": {
		controller: "resource/weixin/video/listController",
		template: "resource/weixin/video/list",
		menu: "WeixinResource"
	},

	/* =============查课表/查成绩============== */
	"mengxiaozhu": {
		controller: "mengxiaozhu/editController",
		template: "mengxiaozhu/edit",
		menu: "MengXiaoZhu"
	},

	/* =============功能链接============== */
	"links": {
		controller: "link/listController",
		template: "link/list",
		menu: "Link"
	},

	/* =============校校钱包============== */
	"wallet/info": {
		controller: "wallet/infoController",
		template: "wallet/info",
		menu: "Wallet"
	},
	"wallet/accounts": {
		controller: "wallet/account/listController",
		template: "wallet/account/list",
		menu: "Wallet"
	},
	"wallet/account/:accountId/edit": {
		regExp: "wallet\\/account\\/([a-zA-Z0-9\\-]+)\\/edit",
		controller: "wallet/account/editController",
		template: "wallet/account/edit",
		menu: "Wallet"
	},

	/* =============抽奖管理============== */
	"lotteries": {
		controller: "lottery/listController",
		template: "lottery/list",
		menu: "Lottery"
	},
	"lottery/:lotteryId/edit": {
		regExp: "lottery\\/([a-zA-Z0-9\\-]+)\\/edit",
		controller: "lottery/editController",
		template: "lottery/edit",
		menu: "Lottery"
	},
	"lottery/:lotteryId/result": {
		regExp: "lottery\\/([a-zA-Z0-9\\-]+)\\/result",
		controller: "lottery/resultController",
		template: "lottery/result",
		menu: "Lottery"
	},
	"lottery/relation/:sourceType/:sourceId/list": {
		regExp: "lottery\\/relation\\/([a-zA-Z\\-]+)\\/([a-zA-Z0-9\\-]+)\\/list",
		controller: "lottery/relationController",
		template: "lottery/relation",
		menu: ":sourceType"
	}
});