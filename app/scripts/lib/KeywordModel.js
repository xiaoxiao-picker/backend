define(function(require, exports, module) {
	var Helper = require("helper");
	var AutoreplyService = require('AutoreplyService');

	var orgId = App.organization.id;

	//默认添加关键词回复
	exports.custom = {
		event: function(categoryId, categoryName) {
			categoryForAutoReply(categoryId, categoryName, 'EVENT', function() {
				Helper.successToast("已将该活动分类（" + categoryName + "）自动添加到关键词单图文回复！");
			});
		},
		article: function(categoryId, categoryName) {
			categoryForAutoReply(categoryId, categoryName, 'ARTICLE', function() {
				Helper.successToast("已将该文章分类（" + categoryName + "）自动添加到关键词单图文回复！");
			});
		},
		proposal: function(categoryId, categoryName) {
			categoryForAutoReply(categoryId, categoryName, 'PROPOSAL', function() {
				Helper.successToast("已将该提案分类（" + categoryName + "）自动添加到关键词单图文回复！");
			});
		}
	};

	function categoryForAutoReply(categoryId, categoryName, type, success) {
		Application.organization.getWechat(false).done(function() {
			var publicId = Application.organization.wechat && Application.organization.wechat.id;
			if (!publicId) return;

			var articles = {
				EVENT: [{
					title: categoryName,
					description: "活动分类－" + categoryName,
					picUrl: "http://img.xiaoxiao.la/ky_type_event.png",
					articleType: 'CUSTOMIZE',
					content: Helper.config.pages.frontRoot + "/index.html#organization/" + orgId + "/events&categoryId=" + categoryId
				}],
				ARTICLE: [{
					title: categoryName,
					description: "文章分类－" + categoryName,
					picUrl: "http://img.xiaoxiao.la/ky_type_article.png",
					articleType: 'CUSTOMIZE',
					content: Helper.config.pages.frontRoot + "/index.html#organization/" + orgId + "/articles&categoryId=" + categoryId
				}],
				PROPOSAL: [{
					title: categoryName,
					description: "提案分类－" + categoryName,
					picUrl: "http://img.xiaoxiao.la/ky_type_proposal.png",
					articleType: 'CUSTOMIZE',
					content: Helper.config.pages.frontRoot + "/index.html#organization/" + orgId + "/proposals&categoryId=" + categoryId
				}]
			};


			AutoreplyService.add.graphic({
				publicId: publicId,
				replyType: 'KEYWORD',
				matchType: 'LIKE',
				keywords: categoryName,
				messageType: 'SINGLE_ARTICLE',
				articleJsonStr: JSON.stringify(articles[type])
			}).done(function(data) {
				Helper.execute(success);
			});
		});
	};

});