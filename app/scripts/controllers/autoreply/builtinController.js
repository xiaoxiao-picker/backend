define(function(require, exports, module) {
	var baseController = require('baseController');
	var bC = new baseController();

	var template = require('template');

	var AutoreplyService = require('AutoreplyService');
	var OrganizationService = require('OrganizationService');
	var Helper = require("helper");

	var publicId;
	var orgId = Application.organization.id;

	var Controller = function() {
		this.namespace = "autoreply.builtin";
	};

	bC.extend(Controller);
	Controller.prototype.init = function() {
		var controller = this;
		App.organization.getWechat(false).done(function() {
			publicId = App.organization.wechat && App.organization.wechat.id;
			controller.render(controller.callback);
		});
	};

	Controller.prototype.render = function(callback) {
		var controller = this;
		if (!publicId) {
			Helper.globalRender(template("app/templates/wechat/noWechat", {}));
			Helper.execute(callback);
			return;
		};

		AutoreplyService.systemReplies().done(function(data) {
			var replies = data.result;
			var count = replies.length;

			Helper.globalRender(template(controller.templateUrl, {
				publicId: publicId,
				replies: renderKeyWords(replies),
				count: count
			}));
		}).fail(function(error) {
			Helper.alert(error);
		}).always(function() {
			Helper.execute(callback);
		});
	}

	function renderKeyWords(replies) {
		$.each(replies, function(idx, reply) {
			var keywords = [];
			$.each(reply.keywords, function(k_idx, item) {
				keywords.push(item.keyWord);
			});
			reply.keyWord = '<span class="keyword">' + keywords.join('</span>、<span class="keyword">') + '</span>';
		});

		return replies;
	}

	module.exports = Controller;
});