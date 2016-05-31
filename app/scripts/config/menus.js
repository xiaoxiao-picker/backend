define(function(require, exports, module) {
	// 菜单

	function makeMenu(code, name, type, content, backImage, backColor, icon, poster, thumbnail, url) {
		return {
			code: code,
			name: name,
			type: type,
			content: content,
			backColor: backColor,
			backImage: backImage,
			icon: icon,
			thumbnail: thumbnail,
			poster: poster,
			url: url
		};
	}

	// 以function形式返回防止返回值被修改时影响原数据
	var menus = function(organizationId) {
		return [
			makeMenu("home", "微首页", "SYSTEM", "个性定制，让你一见钟情", "", "rgba(162,218,119,0.5)", "images/icons/daily/stars2.svg", "images/modules/homepage.jpg", "images/modules/homepage_icon.png", "#organization/" + organizationId + "/index"),
			makeMenu("votes", "投票列表", "SYSTEM", "", "", "rgba(162,218,119,0.5)", "images/icons/daily/4gongge.svg", "images/modules/votes.png", "images/modules/votes_icon.png", "#organization/" + organizationId + "/votes"),
			makeMenu("events", "活动列表", "SYSTEM", "包罗万象，等你来发现", "", "rgba(162,218,119,0.5)", "images/icons/daily/4gongge.svg", "images/modules/events.jpg", "images/modules/events_icon.png", "#organization/" + organizationId + "/events"),
			// makeMenu("lotteries", "抽奖", "SYSTEM", "你想要的，我都有", "", "rgba(162,218,119,0.5)", "images/icons/daily/4gongge.svg", "images/modules/lottery.jpg", "images/modules/lottery_icon.png", "#organization/" + organizationId + "/lotteries"),
			makeMenu("articles", "文章列表", "SYSTEM", "校园文化大火锅，值得一涮(品)", "", "rgba(162,218,119,0.5)", "images/icons/daily/liebiao.svg", "images/modules/articles.jpg", "images/modules/articles_icon.png", "#organization/" + organizationId + "/articles"),
			makeMenu("losts", "失物招领", "SYSTEM", "", "", "rgba(162,218,119,0.5)", "images/icons/daily/speaker.svg", "images/modules/losts.png", "images/modules/losts_icon.png", "#organization/" + organizationId + "/lost/list"),
			makeMenu("proposal", "提案", "SYSTEM", "让世界听到你的声音。", "", "rgba(162,218,119,0.5)", "images/icons/daily/speaker.svg", "images/modules/proposals.png", "images/modules/proposals_icon.png", "#organization/" + organizationId + "/proposals"),
			makeMenu("questionnaires", "问卷表单", "SYSTEM", "", "", "rgba(162,218,119,0.5)", "images/icons/daily/4gongge.svg", "images/modules/quest.png", "images/modules/quest_icon.png", "#organization/" + organizationId + "/questionnaires"),
			// 萌小助 教务系统
			makeMenu("mxz-jiaowu", "查课表/查成绩", "SYSTEM", "一键查询课表/成绩", "", "rgba(162,218,119,0.5)", "images/icons/daily/4gongge.svg", "images/modules/mengxiaozhu.jpg", "images/modules/mengxiaozhu_icon.jpg", "#organization/" + organizationId + "/mengxiaozhu/mxzmain"),
			makeMenu("orgs", "组织风采", "SYSTEM", "群英荟萃，一切尽在掌握", "", "rgba(162,218,119,0.5)", "images/icons/daily/man.svg", "images/modules/orgs.png", "images/modules/orgs_icon.png", "#organization/" + organizationId + "/list/school"),
			makeMenu("join", "社团招新", "SYSTEM", "最(tou)新(lan)科(shen)技(qi)的招新方式来了（二维码扫一扫，信息自动对接；报名成功，人员统计两步搞定！）", "", "rgba(162,218,119,0.5)", "images/icons/daily/good.svg", "images/modules/zhaoxin.jpg", "images/modules/zhaoxin_icon.png", "#organization/" + organizationId + "/zone"),
			makeMenu("feedback", "意见反馈", "SYSTEM", "如果你有什么问题，我一直在这里等着你哦", "", "rgba(162,218,119,0.5)", "images/icons/daily/zhifeiji.svg", "images/modules/feedback.jpg", "images/modules/feedback_icon.png", "#organization/" + organizationId + "/user/feedback"),
			makeMenu("history", "参与历史", "SYSTEM", "刻下你高校的时光印记（系统设置、科学规范，记录你大学生活的点点滴滴）", "", "rgba(162,218,119,0.5)", "images/icons/daily/timer.svg", "images/modules/history.jpg", "images/modules/history_icon.png", "#organization/" + organizationId + "/user/history"),
			makeMenu("notices", "社团公告", "SYSTEM", "社团消息免费发，再也不担心错过活动啦", "", "rgba(162,218,119,0.5)", "images/icons/daily/speaker.svg", "images/modules/notices.jpg", "images/modules/notices_icon.png", "#organization/" + organizationId + "/user/notices"),
			makeMenu("userzone", "个人资料", "SYSTEM", "我就是我，不一样的存在", "", "rgba(162,218,119,0.5)", "images/icons/daily/man.svg", "images/modules/userzone.jpg", "images/modules/userzone_icon.png", "#organization/" + organizationId + "/user/zone"),

			// http://m.kdjz.com
			makeMenu("koudaijianzhi", "口袋兼职", "THIRDPARTAPP", "口袋兼职", "", "rgba(162,218,119,0.5)", "images/icons/daily/stars2.svg", "images/modules/koudaijianzhi.jpg", "images/modules/koudaijianzhi_icon.jpg", "http://front.xiaoxiao.la/posters/third-part-app/koudaijianzhi.html"),
			// http://wx.litemeng.com/user/main
			makeMenu("ningmeng", "柠檬微众筹", "THIRDPARTAPP", "柠檬微众筹", "", "rgba(162,218,119,0.5)", "images/icons/daily/stars2.svg", "images/modules/ningmeng.jpg", "images/modules/ningmeng_icon.jpg", "http://front.xiaoxiao.la/posters/third-part-app/ningmengzhongchou.html"),
			// makeMenu("xiaolianbang", "校联帮", "THIRDPARTAPP", "找工作，校联帮", "", "rgba(162,218,119,0.5)", "images/icons/daily/stars2.svg", "images/modules/xiaolianbang.jpg", "images/modules/xiaolianbang_icon.jpg", "http://www.xiaolianbang.com")
		];
	};



	module.exports = menus;
});