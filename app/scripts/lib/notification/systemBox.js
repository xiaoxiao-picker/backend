define(function(require, exports, module) {
	var Helper = require("helper");
	var template = require("template");
	var NotificationService = require('NotificationService');

	var boxTemp = "app/templates/notification/detail/system";

	var orgId = App.organization.info.id;

	var SystemBox = function(container, messageId, options) {
		this.namespace = "system-box";

		this.container = container;
		this.messageId = messageId;
		this.options = $.extend({}, options);

		render(this);
	};

	function render(systemBox) {

		NotificationService.get(orgId, systemBox.messageId).done(function(data) {
			var notification = data.result;
			systemBox.container.html(template(boxTemp, {
				notification: notification
			}));
		}).fail(function(error) {
			Helper.errorToast(error);
		});
	}

	SystemBox.prototype.destroy = function() {
		var systemBox = this;
		systemBox = null;
	};

	function preventDefault(event) {
		event = event || window.event;
		if (event.preventDefault)
			event.preventDefault();
		else
			event.returnValue = false;
	};

	module.exports = function(container, messageId, options) {
		return new SystemBox(container, messageId, options);
	};
});