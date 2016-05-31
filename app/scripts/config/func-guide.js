/**
 *	功能说明 配置信息
 */

define([{
	code: "WECHATBIND",
	name: "公众号一键绑定",
	url: "#wechat/info",
	description: "填写微信公众号与密码即可“一键智能绑定”。"
}, {
	code: "WECHATCUSTOM",
	name: "个性化微首页、自定义菜单",
	url: "#wechat/guide",
	description: "实现独一无二的微首页与功能，不需自备强大的设计与技术团队。"
}, {
	code: "KEYWORDAUTOREPLY",
	name: "关键词自动回复",
	url: "#autoreply/KEYWORD/list",
	description: "“关键词回复”开启高能模式，用户提交相关信息，后台自动匹配并回复，信息、功能任君挑选。"
}, {
	code: "MESSAGEAUTOREPLY",
	name: "消息自动回复",
	url: "#autoreply/DEFAULT/list",
	description: "公众号收到消息后会自动回复用户（关键字匹配优先）。"
}, {
	code: "ATTENTIONAUTOREPLY",
	name: "关注自动回复",
	url: "#autoreply/SUBBSCRIBE/list",
	description: "每当有新、老用户关注、询问微信公众号，公众平台即可自动回复消息，回复模式分为文字回复、单图文回复、多图文回复。"
}, {
	code: "RESOURCE",
	name: "素材管理",
	url: "#resource/image/list",
	description: "轻松管理您的组织使用的音乐等文件，统一整理，方便查看、使用。"
}, {
	code: "EVENT",
	name: "活动管理",
	url: "#events",
	description: "精妙策划，在线发布"
}, {
	code: "TICKET",
	name: "电子票管理",
	url: "#tickets",
	description: ""
}, {
	code: "WALL",
	name: "上墙管理",
	url: "#walls",
	description: "微信墙大屏幕，轻松审核上墙消息，提供自动播放、消息审核等功能；"
}, {
	code: "VOTE",
	name: "投票管理",
	url: "#vote/guide",
	description: "组织可单独创建投票，或者在活动中直接关联已存在的投票。"
}, {
	code: "LOTTERY",
	name: "抽奖管理",
	url: "#lotteries",
	description: ""
}, {
	code: "MEMBER",
	name: "成员管理",
	url: "#members",
	description: "对现有成员进行分组，便于查看、管理成员联系方式。"
}, {
	code: "NOTICE",
	name: "公告管理",
	url: "#notices",
	description: "通知、公告可按成员组别免费发送，使命必达。"
}, {
	code: "RESUME",
	name: "成员简历",
	url: "#Emembers",
	description: "组织内部成员简历。"
}, {
	code: "QUESTIONNAIRE",
	name: "问卷表单",
	url: "#questionnaires",
	description: ""
}, {
	code: "ARTICLE",
	name: "文章管理",
	url: "#articles",
	description: "文章可分类发布，方便用户搜索查看。"
}, {
	code: "PROPOSAL",
	name: "提案管理",
	url: "#proposals",
	description: "用户可自由发布提案，对提案进行点赞、评论、举报。"
}, {
	code: "LOST",
	name: "失物管理",
	url: "#losts",
	description: "丢失东西了？拾到东西了？在这里，自由发布失物招领/寻物启事。"
}, {
	code: "DEPARTMENT",
	name: "组织风采",
	url: "#list",
	description: "校内抱团，全国整合"
}, {
	code: "PARTNER",
	name: "关联组织",
	url: "#relation/list",
	description: ""
}, {
	code: "MENGXIAOZHU",
	name: "查课表/查成绩",
	url: "#mengxiaozhu",
	description: "一键查询课表/成绩。"
}, {
	code: "FUNCTIONLINK",
	name: "功能链接",
	url: "#links",
	description: "提供功能模块链接，允许第三方随意调用。"
}, {
	code: "FEEDBACK",
	name: "意见反馈",
	url: "#feedbacks",
	description: "网页、手机端均可查看、提交建议，并进行反馈。"
}]);



// define(function(require, exports, module) {

// 	//公众号设置
// 	exports.WECHAT = function() {
// 		return {
// 			class_name: 'guide-wechat-box',
// 			option_class: 'option-2',
// 			options: [{
// 				hash: "#wechat/info",
// 				img: "./images/guide/guide_wechat_1.png",
// 				title: "公众号一键绑定",
// 				content: "<p>想要拥有功能强大的微信公众号，步骤很复杂？</p><p>1、将已经认证的公众号与“校校 “后台” 一键绑定”，绑定后即可挑选心仪功能进行个性化编辑，点击、确定，专属于你的微信公众号就此诞生！<p/><p>2、填写微信公众号与密码即可“一键智能绑定”；当然，用户还可选择手动绑定，根据提示，设置相应信息；</p><p>如需解绑，步骤同样简单，仅需点击“重新绑定”即可完成。</p>"
// 			}, {
// 				hash: "#wechat/guide",
// 				img: "./images/guide/guide_wechat_2.png",
// 				title: "个性化微首页、自定义菜单",
// 				content: "<p>实现独一无二的微首页与功能，不需自备强大的设计与技术团队。</p><p>傻瓜式操作、可视化选择、线上预览最终效果，只需三步，定制版微信公众号大功告成！</p>"
// 			}]
// 		}
// 	};

// 	//自定义回复
// 	exports.AUTOREPLY = function() {
// 		return {
// 			class_name: 'guide-autoreply-box',
// 			option_class: 'option-2',
// 			options: [{
// 				hash: "#autoreply/KEYWORD/list",
// 				img: "./images/guide/guide_autoReply_1.png",
// 				title: "关键词自动回复",
// 				content: "<p>“酒香也怕巷子深”，用户掘地三尺才能搜索到心仪的活动？</p><p>“关键词回复”开启高能模式，用户提交相关信息，后台自动匹配并回复，信息、功能任君挑选。</p>"
// 			}, {
// 				hash: "#autoreply/DEFAULT/list",
// 				img: "./images/guide/guide_autoReply_2.png",
// 				title: "消息、关注自动回复",
// 				content: "<p>24小时的客服，沟通不间断。</p><p>每当有新、老用户关注、询问微信公众号，公众平台即可自动回复消息，回复模式分为文字回复、单图文回复、多图文回复。</p>"
// 			}]
// 		}
// 	};

// 	exports.EVENT = function() {
// 		return {
// 			class_name: 'guide-event-box',
// 			option_class: 'option-1',
// 			options: [{
// 				hash: "#events",
// 				img: "./images/guide/guide_func_1.png",
// 				title: "活动管理",
// 				content: "活动可分类发布，方便用户搜索查看；<br/>线上投票、电子票功能，即时开启与关闭，系统自动记录相关数据，统计表格随时下载；<br/>免除手动输入、统计的烦恼。"
// 			}]
// 		}
// 	};

// 	exports.INTERACTION = function() {
// 		return {
// 			class_name: 'guide-interaction-box',
// 			option_class: 'option-2',
// 			options: [{
// 				hash: "#walls",
// 				img: "./images/guide/guide_func_11.jpg",
// 				title: "微信上墙",
// 				content: "微信墙大屏幕，轻松审核上墙消息，提供自动播放、消息审核等功能；<br/>用户可在手机端发送消息哦。"
// 			}, {
// 				hash: "#votes",
// 				img: "./images/guide/guide_func_10.jpg",
// 				title: "投票管理",
// 				content: "组织可单独创建投票，或者在活动中直接关联已存在的投票。"
// 			}, ]
// 		}
// 	};

// 	exports.MEMBER = function() {
// 		return {
// 			class_name: 'guide-event-box',
// 			option_class: 'option-3',
// 			options: [{
// 				hash: "#members",
// 				img: "./images/guide/guide_func_2.png",
// 				title: "成员管理",
// 				content: "对现有成员进行分组，便于查看、管理成员联系方式；<br/>系统自动统计成员信息，按需下载便于统计。"
// 			}, {
// 				hash: "#notices",
// 				img: "./images/guide/guide_func_4.png",
// 				title: "公告管理",
// 				content: "通知、公告可按成员组别免费发送，使命必达；<br/>成员可直接回复公告信息，搜索反馈从此不再操心。"
// 			}, {
// 				hash: "#Emembers",
// 				img: "./images/guide/guide_EMember_1.png",
// 				title: "成员简历",
// 				content: "<p>记录学子大学生活参与社团活动、担任职务、各类比赛的点点滴滴，并按照系统设置，科学规划，形成时间轴与文档，方便学生、企业等其他用户描述经历、查看简历等。</p>"
// 			}]
// 		}
// 	};

// 	//功能管理
// 	exports.EXPAND = function() {
// 		return {
// 			class_name: 'guide-expand-box',
// 			option_class: 'option-6',
// 			options: [{
// 				hash: "#questionnaires",
// 				img: "./images/guide/guide_func_12.jpg",
// 				title: "问卷表单",
// 				content: "组织管理员可以自由编辑问卷，轻松查看提交过的用户列表及提交内容；<br/>开启问卷即可展示给用户填写哦。"
// 			}, {
// 				hash: "#articles",
// 				img: "./images/guide/guide_func_3.png",
// 				title: "文章管理",
// 				content: "文章可分类发布，方便用户搜索查看；<br/>回收站可重新发布误删文章，自动恢复避免手误。"
// 			}, {
// 				hash: "#proposals",
// 				img: "./images/guide/guide_func_7.png",
// 				title: "提案管理",
// 				content: "用户可自由发布提案，对提案进行点赞、评论、举报；<br/>组织管理员可对提案及评论进行查看、删除操作，并进行官方回复。"
// 			}, {
// 				hash: "#losts",
// 				img: "./images/guide/guide_func_9.png",
// 				title: "失物管理",
// 				content: "丢失东西了？拾到东西了？在这里，自由发布失物招领/寻物启事。<br/>组织管理员可置顶、删除信息操作。"
// 			}, {
// 				hash: "#list",
// 				img: "./images/guide/guide_func_5.png",
// 				title: "组织风采",
// 				content: "学生组织也可互相关注，关联展示，群英荟萃。"
// 			}
// 			// , {
// 			// 	hash: "#relation/list",
// 			// 	img: "./images/guide/guide_relate_1.png",
// 			// 	title: "关联组织",
// 			// 	content: "<p>你是社团联合会吗？你是学生会吗？</p><p>你是下设多个部门的大组织吗？那么这个功能就是为你量身打造的啦！搜索关联下属组织/部门，其发布文章/活动后自动同步至你的活动/文章的《关联组织的活动/文章》分类中，不用再自己动手一篇篇文章一个个活动噼里啪啦地打啊打啦！</p><p>当然同级组织之间也可以关联彼此，相互帮忙推广结盟。</p>"
// 			// }
// 			]
// 		}
// 	};



// 	//素材管理
// 	exports.RESOURCE = function() {
// 		return {
// 			class_name: 'guide-resource-box',
// 			option_class: 'option-1',
// 			options: [{
// 				hash: "#resource/music/list",
// 				img: "./images/guide/guide_resource_1.png",
// 				title: "素材管理",
// 				content: "<p class='center'>轻松管理您的组织使用的音乐等文件，统一整理，方便查看、使用。</p>"
// 			}]
// 		}
// 	};

// 	//素材管理
// 	exports.FEEDBACK = function() {
// 		return {
// 			class_name: 'guide-resource-box',
// 			option_class: 'option-1',
// 			options: [{
// 				hash: "#feedbacks",
// 				img: "./images/guide/guide_func_6.png",
// 				title: "意见反馈",
// 				content: "网页、手机端均可查看、提交建议，并进行反馈。"
// 			}]
// 		}
// 	};

// 	//校校钱包
// 	exports.WALLET = function() {
// 		return {
// 			class_name: 'guide-wallet-box',
// 			option_class: 'option-1',
// 			options: [{
// 				hash: "#wallet",
// 				img: "./images/guide/guide_wallet_1.png",
// 				title: "校校钱包",
// 				content: "轻松便捷查看广告收益及钱包余额，提供广告收支数据统计、提现申请等功能。"
// 			}]
// 		}
// 	};
// });