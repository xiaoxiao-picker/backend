define(function(require, exports, module) {
	var baseController = require('baseController')
	var template = require('template');
	var bC = new baseController();
	var FeedbackService = require('FeedbackService');
	var Helper = require("helper");
	var Pagination = require('lib.Pagination');

	var limit, page;
	var orgId = Application.organization.id;

	var Controller = function() {
		this.namespace = "feedbacks";
		this.actions = {};
	};
	bC.extend(Controller);

	Controller.prototype.init = function() {
		page = +Helper.param.search('page') || 1;
		limit = +Helper.param.search('limit') || 10;
		this.render(this.callback);
	};

	Controller.prototype.render = function(callback) {
		var controller = this;
		var skip = (page - 1) * limit;
		FeedbackService.getList(orgId, skip, limit).done(function(data) {
			var feedbacks = data.result.data;
			var total = data.result.total;
			Helper.globalRender(template(controller.templateUrl, {
				orgId: orgId,
				feedbacks: feedbacks,
				count: total
			}));

			Pagination(total, limit, page, {
				switchPage: function(pageIndex) {
					page = pageIndex;
					Application.loader.begin();
					controller.render(function() {
						Application.loader.end();
					});
				}
			});

		}).fail(function(error) {
			Helper.alert(error);
		}).always(function() {
			Helper.execute(callback);
		});
	}

	module.exports = Controller;
});