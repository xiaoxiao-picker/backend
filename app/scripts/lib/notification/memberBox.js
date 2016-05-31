define(function(require, exports, module) {
	var Helper = require("helper");
	var template = require("template");
	var MemberService = require('MemberService');
	var MemberApplyService = require('MemberApplyService');
	var NotificationService = require('NotificationService');

	var boxTemp = "app/templates/notification/detail/member";
	var operationTemp = "app/templates/notification/detail/member-operation";

	var orgId = App.organization.info.id;

	var MemberBox = function(container, messageId, options) {
		this.namespace = "member-box";
		this.container = container;
		this.messageId = messageId;
		this.options = $.extend({
			jump: function() {}
		}, options);

		render(this);
		addListener(this);
	};

	function render(memberBox) {
		NotificationService.get(orgId, memberBox.messageId).done(function(data) {
			var notification = data.result;
			var userId = notification.source.id;
			MemberService.getRank(orgId, userId).done(function(data) {
				var rank = data.result;
				memberBox.container.html(template(boxTemp, {
					notification: notification,
					rank: rank
				}));
				if (rank == -100) {
					renderOperation(memberBox, notification);
				}
			}).fail(function(error) {
				Helper.errorToast(error);
			});

		}).fail(function(error) {
			Helper.errorToast(error);
		});
	}

	function renderOperation(memberBox, notification) {
		MemberApplyService.getList(orgId, 0, 100).done(function(data) {
			var requests = data.result.data;
			memberBox.container.find(".detail-body").html(template(operationTemp, {
				requests: requests
			}));
		}).fail(function(error) {
			Helper.errorToast(error);
		});
	}

	//添加事件监听
	function addListener(memberBox) {
		//同意成员申请
		memberBox.container.on('click.' + memberBox.namespace, '.btn-agree', function(evt) {
			var _btn = $(this);
			var requestId = _btn.attr("data-request-id");

			Helper.begin(_btn);
			MemberApplyService.agree(orgId, requestId).done(function(data) {
				_btn.parents("tr").remove();
			}).fail(function(error) {
				Helper.errorToast(error);
			}).always(function() {
				Helper.end(_btn);
			});
		});

		//拒绝成员申请
		memberBox.container.on('click.' + memberBox.namespace, '.btn-reject', function(evt) {
			var _btn = $(this);
			var requestId = _btn.attr("data-request-id");

			Helper.begin(_btn);
			MemberApplyService.refuse(orgId, requestId).done(function(data) {
				_btn.parents("tr").remove();
			}).fail(function(error) {
				Helper.errorToast(error);
			}).always(function() {
				Helper.end(_btn);
			});
		});

		//查看详细（跳转到对应页面）
		memberBox.container.on('click.' + memberBox.namespace, '.btn-jump', function(evt) {

			Helper.go("#members/applied");
			memberBox.options.jump && $.isFunction(memberBox.options.jump) && memberBox.options.jump.call(memberBox, "");
		});

	}

	MemberBox.prototype.destroy = function() {
		var memberBox = this;

		memberBox.container.off("." + memberBox.namespace);
		memberBox = null;
	};

	function preventDefault(event) {
		event = event || window.event;
		if (event.preventDefault)
			event.preventDefault();
		else
			event.returnValue = false;
	};

	module.exports = function(container, messageId, options) {
		return new MemberBox(container, messageId, options);
	};
});