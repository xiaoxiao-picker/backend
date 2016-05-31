define(function(require, exports, module) {
	var template = require("template");
	var Helper = require("helper");

	var MemberService = require('MemberService');

	var orgId = App.organization.id;

	var ResumeBox = function(member, options) {
		options = $.extend({
			className: 'member-comment-modal',
			actions: {
				".btn-add-resume": {
					fnc: function(modal) {
						var btn = this;
						var con = modal.box.find("#CommentContext");
						var context = $.trim(con.val());
						if (Helper.validation.isEmpty(context)) {
							Helper.errorToast("第二课堂简历内容不能为空！");
							return;
						}
						Helper.begin(btn);
						var userId = modal.member.user.id;
						MemberService.comment.add(orgId, userId, context).done(function(data) {
							Helper.execute(modal.options.add);
							var commentId = data.result;
							var comment = {
								id: commentId,
								createDate: (new Date()).getTime(),
								operatorUser: App.user.info,
								text: context
							};
							con.val("");
							modal.comments.splice(0, 0, comment);
							renderComments(modal);
						}).fail(function(error) {
							Helper.alert(error);
						}).always(function() {
							Helper.end(btn);
						});
					}
				},
				".btn-remove-resume": {
					fnc: function() {
						var btn = this;
						var commentId = btn.attr("data-value");
						Helper.confirm("确定删除该 第二课堂简历 ？", {}, function() {
							Helper.begin(btn);
							MemberService.comment.remove(commentId).done(function(data) {
								Helper.execute(modal.options.remove);

								var index = modal.comments.indexOfAttr("id", commentId);
								modal.comments.splice(index, 1);
								Helper.successToast("删除成功！");
								btn.parents(".comment").slideUp(200, function() {
									renderComments(modal);
								});
							}).fail(function(error) {
								Helper.alert(error);
							}).always(function() {
								Helper.end(btn);
							});
						});
					}
				},
				".oper": {
					fnc: function() {
						this.parents(".comment").toggleClass("open");
					}
				}
			}
		}, options);

		var modal = Helper.modal(options);
		modal.member = member;
		init(modal);
		return modal;
	};

	function init(modal) {
		MemberService.comment.getList(orgId, modal.member.user.id).done(function(data) {
			modal.comments = data.result;
			modal.html(template("app/templates/member/resume/modal", {
				member: modal.member,
				comments: modal.comments
			}));
		}).fail(function(error) {
			Helper.alert(error);
		}).always(function() {});
	};

	function renderComments(modal) {
		var html = template("app/templates/member/resume/list", {
			comments: modal.comments
		});
		modal.box.find("#CommentContainer").html(html);

		setTimeout(function() {
			modal.box.find("#CommentContainer .context").each(function(idx, item) {
				var $context = $(item);
				var $oper = $context.parents(".comment").find(".oper");
				var height = $context.outerHeight();
				if (height < 80) {
					$oper.hide();
				} else {
					$oper.show();
				}
			});
		}, 100);
	};


	module.exports = ResumeBox;
});