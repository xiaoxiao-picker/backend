define(function(require, exports, module) {
	var Helper = require("helper");
	var baseController = require('baseController');
	var bC = new baseController();
	var WallService = require('WallService');
	var template = require('template');
	var Pagination = require('lib.Pagination');

	var orgId;
	var limit, page;
	var wallId, wallInfo;

	var MessageQueue; // 消息队列
	var LastMessageId; // 最后一条消息的ID
	var LastMessageLength; // 截止所取最后一条消息的条数
	var NewMessageTO; // 新消息刷新轮询标识

	var LastCheckedMessageId; // 最后一条已审核消息

	var Controller = function() {
		var _controller = this;
		_controller.namespace = "wall.check";

		// 页面销毁时销毁 NewMessageTO
		_controller.destroy = function() {
			clearTimeout(NewMessageTO);
		};

		_controller.actions = {
			// 添加到等待队列
			addToQueue: function() {
				var _btn = this;
				var messageId = _btn.parents("li.message-box").attr("data-value");
				var message = getMessage(messageId);
				if (!message || messageId == LastCheckedMessageId) return;

				LastCheckedMessageId = messageId;
				addMessageToCheckedBox(message);

				WallService.addToQueue(wallId, messageId).done(function() {
					// do nothing
				}).fail(function(error) {
					// Console("消息【" + messageId + "】审核失败！" + error);
					messageHtml.remove();
					clearTimeout(messageTO);
				});
			},
			// 删除消息
			removeMessage: function() {
				var _btn = this;
				var messageId = _btn.parents("li.message-box").attr("data-value");
				var messageBox = _btn.parents(".message-box");
				messageBox.slideUp(200);
				WallService.removeMessage(orgId, wallId, messageId).done(function(data) {
					setTimeout(function() {
						messageBox.remove();
					}, 200);
				}).fail(function(error) {
					// Console("消息删除失败！" + error);
					setTimeout(function() {
						messageBox.show();
					}, 200);
				}).always();
			},
			// 移除已审核消息
			removeCheckedMessage: function() {
				var _btn = this;
				removeCheckedMessage(_btn);
			},
			// 清除已审核消息
			clearQueue: function() {
				$("#CHECKEDMESSAGECONTAINER").html("");
			},
			// 关闭上墙
			closeWall: function() {
				var _btn = this;
				Helper.begin(_btn);
				WallService.close(orgId, wallId).done(function(data) {
					wallInfo.wallState = "CLOSED";
					_btn.parents(".buttons").removeClass("playing");
				}).fail(function(error) {
					Helper.alert(error);
				}).always(function() {
					Helper.end(_btn);
				});
			},
			// 开启上墙
			openWall: function() {
				var _btn = this;
				Helper.begin(_btn);
				WallService.open(orgId, wallId).done(function(data) {
					// 重新打开墙后在10秒内将所有之前的消息全部清除
					var CheckedMessagesBeforeClose = $("#CHECKEDMESSAGECONTAINER>li");
					CheckedMessagesBeforeClose.each(function(idx, message) {
						var delay = 1000 + idx * 10000 / CheckedMessagesBeforeClose.length;
						setTimeout(function() {
							removeCheckedMessage($(message));
						}, delay);
					});
					wallInfo.wallState = "OPEN";
					_btn.parents(".buttons").addClass("playing");
				}).fail(function(error) {
					Helper.alert(error);
				}).always(function() {
					Helper.end(_btn);
				});
			},
			// 开启自动审核（无审核）
			autoCheck: function() {
				var _input = this;
				var checked = _input.prop("checked");
				WallService[checked ? "closeCheck" : "openCheck"](orgId, wallId).done(function(data) {
					if (checked) {
						wallInfo.needCheck = false;
						$("#MESSAGESHADOW").addClass("active");
						_input.prop("checked", true);
					} else {
						wallInfo.needCheck = true;
						$("#MESSAGESHADOW").removeClass("active");
						_input.removeAttr("checked");
					}
				}).fail(function(error) {
					Helper.alert(error);
				});
			},
			// 开启审核
			openCheck: function() {
				var _btn = this;
				Helper.begin(_btn);
				WallService.openCheck(orgId, wallId).done(function(data) {
					wallInfo.needCheck = true;
					$("#AutoCheck").removeAttr("checked");
					$("#MESSAGESHADOW").removeClass("active");
				}).fail(function(error) {
					Helper.alert("关闭自动播放失败！ " + error);
				}).always(function() {
					Helper.end(_btn);
				});
			}
		};
	};

	bC.extend(Controller);
	Controller.prototype.init = function(templateUrl, callback) {
		this.callback = callback;
		this.templateUrl = templateUrl;

		clearTimeout(NewMessageTO);
		orgId = App.organization.info.id;
		wallId = Helper.param.hash("wallId");
		page = +Helper.param.search("page") || 1;
		limit = +Helper.param.search("limit") || 10;
		MessageQueue = [];
		LastMessageLength = 0;
		LastMessageId = null;
		LastCheckedMessageId = null;
		this.render();
	};

	Controller.prototype.render = function() {
		var controller = this;
		var callback = controller.callback;
		var templateUrl = controller.templateUrl;

		var skip = (page - 1) * limit;

		// 获取墙信息
		var getWallInfo = WallService.get(wallId).done(function(data) {
			wallInfo = data.result;
		}).fail(function(error) {
			Helper.alert(error);
		});
		// 获取最新的消息列表
		var getMessages = WallService.getMessages(wallId, skip, limit).fail(function(error) {
			Helper.alert(error);
		});

		$.when(getWallInfo, getMessages).done(function(data1, data2) {
			var count = data2.result.total;
			var messages = data2.result.data;
			if (messages.length > 0) {
				LastMessageId = messages[0].id;
			}
			LastMessageLength = count;
			MessageQueue = messages;
			Helper.globalRender(template(templateUrl, {
				orgId: orgId,
				wall: wallInfo,
				count: count,
				messages: messages,
				pagination: Helper.pagination(count, limit, page),
				wallInfoURL: Helper.config.pages.frontRoot + "/wall.html?organizationId=" + orgId + "&wallId=" + wallId,
				wallMessageURL: Helper.config.pages.frontRoot + "/index.html#organization/" + orgId + "/wall/" + wallId + "/message"
			}));

			Pagination(count, limit, page, {
				container: $('#UncheckedBox .box-footer'),
				theme: 'SIMPLE',
				switchPage: function(pageIndex) {
					page = pageIndex;
					Application.loader.begin();
					controller.render(function() {
						Application.loader.end();
					});
				}
			});

			// 只有当在第一页时才会刷新数据
			if (page == 1) {
				renderNewerMessages();
			}
		}).always(function() {
			Helper.execute(callback);
		});

		window.addMessage = addMessage;
	};

	function addMessage(text) {
		text = text || "无处不在的小鸡！" + new Date().Format("yyyy-MM-dd hh:mm:ss");
		WallService.addMessage(wallId, text).done(function(data) {
			Helper.successToast("添加上墙消息成功");
		}).fail(function(error) {
			Helper.alert("添加上墙消息失败：" + error);
		});
	}

	// 获取更新的消息
	function renderNewerMessages(length) {
		// Console("Request newer messages at " + new Date().Format("hh:mm:ss"));
		length = length || 10;
		var delay = 3000;
		WallService.getMessages(wallId, LastMessageLength, length).done(function(data) {
			var count = data.result.total;
			var messages = data.result.data;
			// 设置当前最后一条数据，以便之后控制请求频率
			LastMessageLength += messages.length;
			// 如果当前已取完则5秒后取数据，如果未取完则3秒后取
			delay = LastMessageLength < count ? 3000 : 5000;

			if (messages.length <= 0) return;
			$("#MESSAGENUMBER").text(count);
			LastMessageId = messages[0].id;
			MessageQueue = MessageQueue.concat(messages);
			$("#MESSAGECONTAINER").prepend(template("app/templates/wall/check-message", {
				messages: messages
			}));

			// 如果不需要审核，则新请求到的消息自动添加到上墙队列
			if (!wallInfo.needCheck) {
				$(messages).each(function(idx, message) {
					addMessageToCheckedBox(message);
				});
			}
		}).fail(function(error) {
			// 如果失败则继续读取消息
			// Console(error);
		}).always(function() {
			NewMessageTO = setTimeout(renderNewerMessages, delay);
		});
	};


	// 将消息添加到已审核列表中区
	function addMessageToCheckedBox(message) {
		var messageHtml = $(template("app/templates/wall/checked-message", {
			messages: [message]
		}));
		$("#CHECKEDMESSAGECONTAINER").append(messageHtml);
		var messageTO = setTimeout(function() {
			// 如果此时墙已关闭，则清除
			if (wallInfo.wallState == "CLOSED") {
				clearTimeout(messageTO);
				return;
			};
			removeCheckedMessage(messageHtml);
		}, 10000);
	};


	// 删除已审核的消息，仅作dom删除
	function removeCheckedMessage(messageBox) {
		messageBox.slideUp(200, function() {
			$(this).remove();
		});
	};

	// 根据消息ID获取消息
	function getMessage(messageId) {
		for (var i = 0; i < MessageQueue.length; i++) {
			if (messageId == MessageQueue[i].id) {
				return MessageQueue[i];
			}
		}
		return null;
	};


	// 控制台输出
	function Console(message) {
		window.console && window.console.log && $.isFunction(window.console.log) && window.console.log(message);
	};


	module.exports = Controller;
});