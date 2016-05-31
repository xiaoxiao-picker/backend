define(function(require, exports, module) {
	var Helper = require("helper");
	var template = require("template");
	var NotificationService = require('NotificationService');

	var boxTemp = "app/templates/notification/list";
	var resultTemp = "app/templates/notification/results";

	var systemBox, memberBox, feedbackBox, otherBox;
	var CurrentIndex;
	var orgId;

	var NotificationBox = function(container, options) {
		this.namespace = "application.notification";
		this.container = container || $(document.body);
		this.options = $.extend({}, options);

		orgId = App.organization.info.id;
	}

	NotificationBox.prototype.render = function() {
		var notificationBox = this;

		notificationBox.container.html(template(boxTemp, {
			orgId: orgId
		}));
		$(document.body).addClass('notification-open');

		renderList(notificationBox);
		addListener(notificationBox);
	}

	//渲染通知列表
	function renderList(notificationBox) {
		notificationBox.container.find('#Notifications').html(template('app/templates/partial/loading', {}));

		NotificationService.getList(orgId).done(function(data) {
			var notifications = makeNotifications(data.result);

			notificationBox.container.find('#Notifications').html(template(resultTemp, {
				notifications: notifications,
				orgInfo: App.organization
			}));

			var detailContainer = notificationBox.container.find('#Detail');
			if (notifications.length) {
				detailContainer.removeClass('hide');

				CurrentIndex = 0;
				var notification = notifications[0];
				renderDetail(notificationBox, notification.id, notification.type);
				var notiBox = notificationBox.container.find('#Notifications .noti-box')[0];
				$(notiBox).addClass('active');
			} else {
				detailContainer.addClass('hide');
				detailContainer.html("");
			}

		}).fail(function(error) {
			Helper.errorToast(error);
		});
	}

	function makeNotifications(notifications) {
		$.each(notifications, function(idx, notification) {
			if (notification.source == 'SYSTEM') {
				notification.source = {
					name: '校校',
					avatarUrl: './images/logo.jpg'
				}
			};
		});

		return notifications;
	}

	//渲染通知详情
	function renderDetail(notificationBox, messageId, type, btn) {
		var detailContainer = notificationBox.container.find('#Detail');
		detailContainer.html(template('app/templates/partial/loading', {}));

		//销毁
		systemBox && systemBox.destroy();
		memberBox && memberBox.destroy();
		feedbackBox && feedbackBox.destroy();
		otherBox && otherBox.destroy();

		//根据[通知类型]显示不同页面
		if (type.indexOf("SYSTEM") > -1) {
			require.async("systemBox", function(SystemBox) {
				systemBox = SystemBox(detailContainer, messageId, {});
			});
		} else if (type == "USER_JOIN") {
			require.async("memberBox", function(MemberBox) {
				memberBox = MemberBox(detailContainer, messageId, {
					jump: function() {
						notificationBox.destroy();
					}
				});
			});
		} else if (type.indexOf("USER_FEEDBACK") > -1) {
			require.async("feedbackBox", function(FeedbackBox) {
				feedbackBox = FeedbackBox(detailContainer, messageId, {
					jump: function() {
						notificationBox.destroy();
					}
				});
			});
		} else {
			require.async("otherBox", function(OtherBox) {
				otherBox = OtherBox(detailContainer, messageId, {});
			});
		}

		//标记为已读 
		setRead(notificationBox, messageId, btn);

	}

	//设置对应消息为已读
	function setRead(notificationBox, messageId, btn) {
		var notiBox = btn ? btn.parents('.noti-box') : notificationBox.container.find('#Notifications .noti-box')[0];
		if ($(notiBox).find('.mark').length) {
			NotificationService.read(orgId, messageId).done(function(data) {
				$(notiBox).find('.mark').remove();
			}).fail(function(error) {
				Helper.alert(error);
			});
		};
	}

	//添加事件监听
	function addListener(notificationBox) {
		//清空通知
		notificationBox.container.on("click." + notificationBox.namespace, "#ClearBtn", function() {
			var _btn = $(this);

			Helper.confirm("确认清空所有消息？", {}, function() {
				Helper.begin(_btn);
				NotificationService.clear(orgId).done(function(data) {
					renderList(notificationBox);
				}).fail(function(error) {
					Helper.alert(error);
				}).always(function() {
					Helper.end(_btn);
				});
			});
		});

		//删除单条通知
		notificationBox.container.on("click." + notificationBox.namespace, ".noti-box .buttons .btn-remove", function(evt) {
			preventDefault(evt);

			var _btn = $(this),
				messageId = _btn.attr("data-value");

			Helper.confirm("确认删除该条消息？", {}, function() {
				Helper.begin(_btn);
				NotificationService.remove(orgId, messageId).done(function(data) {
					renderList(notificationBox);
				}).fail(function(error) {
					Helper.alert(error);
				}).always(function() {
					Helper.end(_btn);
				});
			});
		});

		//全部标记已读
		notificationBox.container.on("click." + notificationBox.namespace, "#AllReadBtn", function() {
			var _btn = $(this);

			Helper.confirm("确认标记所有消息已读？", {}, function() {
				Helper.begin(_btn);
				NotificationService.allRead(orgId).done(function(data) {
					$('#MailBox .remark').addClass('hide');
					renderList(notificationBox);
				}).fail(function(error) {
					Helper.alert(error);
				}).always(function() {
					Helper.end(_btn);
				});
			});
		});

		//标记单条已读
		notificationBox.container.on("click." + notificationBox.namespace, ".noti-box .content-wrapper", function(evt) {
			preventDefault(evt);

			var _btn = $(this);
			var index = _btn.attr("data-index");
			var type = _btn.attr("data-type");
			var messageId = _btn.attr("data-value");

			if (CurrentIndex == index) return;

			notificationBox.container.find('#Notifications').find(".noti-box").removeClass("active");
			_btn.parents(".noti-box").addClass('active');

			renderDetail(notificationBox, messageId, type, _btn);

			CurrentIndex = index;
		});
	}

	NotificationBox.prototype.destroy = function() {
		$(document.body).removeClass('notification-open');
		this.container.off("." + this.namespace);
		CurrentIndex = 0;
	};

	//获取未读通知数
	NotificationBox.prototype.getUnreadCount = function() {
		var notificationBox = this;

		function unreadCount() {
			NotificationService.unreadCount(orgId).done(function(data) {
				var count = data.result.announce + data.result.other;
				if (count) {
					$('#MailBox .remark').removeClass('hide');
				} else {
					$('#MailBox .remark').addClass('hide');
				}
				$('#MailBox .remark').text(count);
			}).always(function() {
				setTimeout(unreadCount, 60000);
			});
		}

		// 本地开发就不开启通知了，太烦人了
		if (window.location.host === "localhost") return;
		unreadCount();
	}

	// 系统公告弹出框
	function openSystemBox() {
		var modal = Helper.modal({
			className: 'system-message-box'
		});

		modal.html(template("", {

		}));
	};

	function preventDefault(event) {
		event = event || window.event;
		if (event.preventDefault)
			event.preventDefault();
		else
			event.returnValue = false;
	};

	module.exports = function(container, options) {
		return new NotificationBox(container, options);
	};
});