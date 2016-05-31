define(function(require, exports, module) {
	var Helper = require("helper");
	var template = require("template");
	var FeedbackService = require('FeedbackService');
	var NotificationService = require('NotificationService');

	var boxTemp = "app/templates/notification/detail/feedback";
	var repliesTemp = "app/templates/notification/detail/feedback-replies";

	var orgId = App.organization.info.id;

	var FeedbackBox = function(container, messageId, options) {
		this.namespace = "feedback-box";
		this.container = container;
		this.messageId = messageId;
		this.options = $.extend({}, options);

		render(this);
		addListener(this);
	};

	function render(feedbackBox) {
		NotificationService.get(orgId, feedbackBox.messageId).done(function(data) {
			var notification = data.result;
			feedbackBox.options.feedbackId = notification.source.feedback.id;

			feedbackBox.container.html(template(boxTemp, {
				notification: notification
			}));
			renderReplies(feedbackBox);
		}).fail(function(error) {
			Helper.errorToast(error);
		});
	}

	function renderReplies(feedbackBox) {
		var repliesContainer = feedbackBox.container.find(".detail-body");
		repliesContainer.html(template("app/templates/partial/loading", {}));

		FeedbackService.reply.getList(feedbackBox.options.feedbackId, -1, -1).done(function(data) {
			var replies = data.result.replys.data;
			var count = data.result.replys.total;
			var user = data.result.user;
			repliesContainer.html(template(repliesTemp, {
				replies: replies,
				count: count,
				user: user
			}));
		}).fail(function(error) {
			Helper.errorToast(error);
		});
	}

	//添加事件监听
	function addListener(feedbackBox) {

		//回复
		feedbackBox.container.on('click.' + feedbackBox.namespace, ".btn-reply", function(evt) {
			var _btn = $(this);

			var text = $.trim($("#ReplyInput").val());
			if (text.length == 0) {
				Helper.errorToast("回复内容不得为空！");
				return;
			};

			Helper.begin(_btn);
			FeedbackService.reply.add(feedbackBox.options.feedbackId, text).done(function(data) {
				Helper.successToast("回复成功");
				feedbackBox.container.find("#ReplyInput").val('');
				renderReplies(feedbackBox);
			}).fail(function(error) {
				Helper.errorToast(error);
			}).always(function() {
				Helper.end(_btn);
			});
		});

		//查看详细（跳转到对应页面）
		feedbackBox.container.on('click.' + feedbackBox.namespace, '.btn-jump', function(evt) {

			Helper.go("feedback/" + feedbackBox.options.feedbackId + "/info");
			feedbackBox.options.jump && $.isFunction(feedbackBox.options.jump) && feedbackBox.options.jump.call(feedbackBox, "");
		});

	}

	FeedbackBox.prototype.destroy = function() {
		var feedbackBox = this;
		feedbackBox.container.off("." + feedbackBox.namespace);
	};

	function preventDefault(event) {
		event = event || window.event;
		if (event.preventDefault)
			event.preventDefault();
		else
			event.returnValue = false;
	};

	module.exports = function(container, messageId, options) {
		return new FeedbackBox(container, messageId, options);
	};
});