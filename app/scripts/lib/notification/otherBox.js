define(function(require, exports, module) {
	var	Helper = require("helper");
	var template = require("template");
	var	NotificationService = require('NotificationService');

	var boxTemp = "app/templates/notification/detail/other";

	var orgId = App.organization.info.id;

	var OtherBox = function(container, messageId, options) {
		this.namespace = "other-box";
		this.template = options.template || template;
		this.container = container;
		this.messageId = messageId;
		this.options = $.extend({}, options);

		render(this);
	};

	function render(otherBox) {

		NotificationService.get(orgId, otherBox.messageId).done(function(data) {
			var notification = data.result;
			otherBox.container.html(otherBox.template(boxTemp, {
				notification: notification
			}));
		}).fail(function(error) {
			Helper.errorToast(error);
		});
	}

	OtherBox.prototype.destroy = function() {
		var otherBox = this;
		otherBox = null;
	};

	function preventDefault(event) {
		event = event || window.event;
		if (event.preventDefault)
			event.preventDefault();
		else
			event.returnValue = false;
	};

	module.exports = function(container, messageId, options) {
		return new OtherBox(container, messageId, options);
	};
});
