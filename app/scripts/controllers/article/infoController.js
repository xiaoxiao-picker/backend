define(function(require, exports, module) {
	var baseController = require("baseController");
	var bC = new baseController();

	var template = require("template");
	var Helper = require("helper");

	var ArticleService = require("ArticleService");
	var articleId;

	var Controller = function() {
		var controller = this;
		controller.namespace = "article.info";
		controller.actions = {
			showPublishOverlay: function() {
				$(".phone-overlay").removeClass('hide');
			},
			hidePublishOverlay: function() {
				$(".phone-overlay").addClass('hide');
			},
			publish: function() {
				var btn = this;
				Helper.confirm("文章发布后将对外开放，确定发布？", {}, function() {
					Helper.begin(btn);
					ArticleService.updateState(orgId, articleId, "PUBLISHED").done(function(data) {
						controller.render();
					}).fail(function(error) {
						Helper.alert(error);
					}).always(function() {
						Helper.end(btn);
					});
				});
			}
		};
	};
	bC.extend(Controller);
	Controller.prototype.init = function() {
		articleId = Helper.param.hash('articleId');
		orgId = App.organization.id;
		this.render();
	};

	Controller.prototype.render = function() {
		var controller = this;
		ArticleService.load(articleId).done(function(data) {
			article = data.result;
			var url = Helper.config.pages.frontRoot + "/index.html#organization/" + orgId + "/article/" + articleId + "/info&title=" + article.name;
			article.createDate = article.createDate ? Helper.makedate(article.createDate, 'yy/MM/dd hh:mm') : '';
			Helper.globalRender(template(controller.templateUrl, {
				article: article,
				orgId: orgId,
				articleId: articleId,
				articleUrl: url,
				articleQRcode: Helper.generateQRCode(url, App.getSession()),
				organization: Application.organization
			}));
		}).fail(function(error) {
			Helper.alert(error);
		}).always(function() {
			Helper.copyClientboard(document.getElementById("CopyUrl"));
			Helper.execute(controller.callback);
		});
	};

	module.exports = Controller;
});