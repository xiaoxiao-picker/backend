define(function(require, exports, module) {
	var	Helper = require("helper");
	var template = require("template");
	var	NotificationService = require('NotificationService');

	var boxTemp = "app/templates/notification/detail/proposal";

	var orgId = App.organization.info.id;

	var ProposalBox = function(container, messageId, options) {
		this.namespace = "proposal-box";
		this.template = options.template || template;
		this.container = container;
		this.messageId = messageId;
		this.options = $.extend({}, options);

		render(this);
	};

	function render(proposalBox) {

		NotificationService.get(orgId, proposalBox.messageId).done(function(data) {
			var notification = data.result;
			proposalBox.container.html(proposalBox.template(boxTemp, {
				notification: notification
			}));
		}).fail(function(error) {
			Helper.errorToast(error);
		});
	}

	//添加事件监听
	function addListener(feedbackBox) {

	}

	ProposalBox.prototype.destroy = function() {
		var proposalBox = this;
		proposalBox.container.off("." + proposalBox.namespace);
		proposalBox = null;
	};

	function preventDefault(event) {
		event = event || window.event;
		if (event.preventDefault)
			event.preventDefault();
		else
			event.returnValue = false;
	};

	module.exports = function(container, messageId, options) {
		return new ProposalBox(container, messageId, options);
	};
});
