define(function(require, exports, module) {
	var baseController = require('baseController');
	var template = require('template');
	var bC = new baseController();
	var FeedbackService = require('FeedbackService');
	var Helper = require("helper");

	var tmp, callback, orgId, feedbackId, directorId, limit;

	var Controller = function() {
		this.namespace = "feedback.info";
		this.actions = {
			reply: function() {
				var _btn = this;
				var context = $.trim($("#ReplyContext").val());
				if (context.length == 0) {
					Helper.errorToast("回复内容不得为空！");
					return;
				};

				Helper.begin(_btn);
				FeedbackService.reply.add(feedbackId, context).done(function(data) {
					Helper.successToast("回复成功");
					$("#ReplyContext").val('');
					renderReplies();
				}).fail(function(error) {
					Helper.errorToast(error);
				}).always(function() {
					Helper.end(_btn);
				});
			},
			// 字数计算提示
			textModify: function() {
				var _input = this;
				var context = _input.val();
				if (context.length > 100) {
					context = context.substr(0, 100);
					_input.val(context);
				}
				$("#TerseRemain").text(100 - context.length);
			},
		};
	};
	bC.extend(Controller);

	Controller.prototype.init = function(templateName, fn) {
		tmp = templateName;
		callback = fn;
		orgId = App.organization.info.id;
		feedbackId = Helper.param.hash("feedbackId");
		directorId = App.organization.info.directorId;
		limit = 10;

		render();
	};

	function render() {
		Helper.globalRender(template(tmp, {
			orgId: orgId
		}));
		renderReplies();
		Helper.execute(callback);
	}

	function renderReplies() {
		$("#RepliesContainer").html(template("app/templates/partial/loading", {}));

		FeedbackService.reply.getList(feedbackId, -1, -1).done(function(data) {
			var replies = data.result.replys.data;
			var count = data.result.replys.total;
			$("#RepliesContainer").html(template("app/templates/feedback/info-replies", {
				orgId: orgId,
				directorId: directorId,
				user: data.result.user,
				replies: replies,
				count: count
			}));
		}).fail(function(error) {
			Helper.errorToast(error);
		});
	}

	module.exports = Controller;
});