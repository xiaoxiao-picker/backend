define(function(require, exports, module) {
	var Helper = require("helper");
	var template = require("template");
	var CommentService = require('CommentService');
	var orgId = Application.organization.id;

	var templateURL = "app/templates/public/comment/list";

	function Box(subjectType, subjectId, options) {
		options = $.extend({
			container: $(document.body),
			skip: 0,
			limit: 10
		}, options);
		this.subjectType = subjectType;
		this.subjectId = subjectId;
		this.options = options;
		this.comments = [];

		init(this);
		addListener(this);
	}

	function init(box) {
		var subjectType = box.subjectType;
		var subjectId = box.subjectId;
		var skip = box.options.skip;
		var limit = box.options.limit;

		box.options.container.html(template("app/templates/public/comment/box"), {});

		var $footer = box.options.container.find(".comment-footer");

		CommentService.getList(subjectType, subjectId, skip, limit).done(function(data) {
			box.comments = data.result.data;
			var count = data.result.total;
			var complete = !(count > box.comments.length);

			box.options.container.find(".comment-list").html(box.comments.length == 0 ? '<p class="center text-xx-gray">暂未添加评论</p>' : template(templateURL, {
				comments: box.comments
			}));
			if (complete) $footer.find(".btnLoadMoreComments").addClass("hide");
			$footer.find(".progress").text(box.comments.length + " / " + count);
			if (box.comments.length == 0) {
				$footer.addClass("hide");
			}

		}).fail(function(error) {
			Helper.alert(error);
		});
	};

	function addListener(box) {
		var subjectId = box.subjectId;
		var subjectType = box.subjectType;
		// 回复评论
		box.options.container.on("click", ".btnCommentReply", function() {
			var $btn = $(this);
			var commentId = $btn.attr("data-comment-id");
			var comment = box.comments.objOfAttr("id", commentId);
			if (!comment) return Helper.alert("未找到该评论，请联系管理员！");
			require.async("lib.textareaModal", function(textareaModal) {
				textareaModal({
					title: "评论回复",
					placeholder: "@" + comment.user.name || comment.user.nickname || comment.user.phoneNumber,
					maxLength: 100,
					submit: function(context, btn) {
						var modal = this;
						if (Helper.validation.isEmpty(context)) {
							return Helper.errorToast("回复内容不能为空！");
						}
						Helper.begin(btn);
						CommentService.add(subjectType, subjectId, {
							targetUserId: comment.user.id,
							text: context
						}).done(function(data) {
							var newComment = {
								id: data.result,
								createDate: data.time,
								subjectId: subjectId,
								subjectType: subjectType,
								targetUser: comment.user,
								text: context,
								user: Application.user.info
							};
							box.comments.push(newComment);
							box.options.container.find(".comment-list").prepend(template(templateURL, {
								comments: [newComment]
							}));
							modal.destroy();
						}).fail(function(error) {
							Helper.alert(error);
						}).always(function() {
							Helper.end(btn);
						});
					}
				});
			});
		});

		// 删除评论
		box.options.container.on("click", ".btnCommentRemove", function() {
			var $btn = $(this);
			var commentId = $btn.attr("data-comment-id");
			Helper.confirm("确定删除该评论？", function() {
				Helper.begin($btn);
				CommentService.remove(orgId, commentId).done(function(data) {
					$btn.parents("li.comment").slideUp(200, function() {
						$(this).remove();
					});
				}).fail(function(error) {
					Helper.alert(error);
				}).always(function() {
					Helper.end($btn);
				});
			});
		});

		// 加载更多
		box.options.container.on("click", ".btnLoadMoreComments", function() {
			var $btn = $(this);
			var $footer = box.options.container.find(".comment-footer");
			var limit = box.options.limit;
			var skip = box.comments.length;
			Helper.begin($btn);
			CommentService.getList(subjectType, subjectId, skip, limit).done(function(data) {
				var comments = data.result.data;
				box.comments = box.comments.concat(comments);
				var count = data.result.total;
				var complete = !(count > box.comments.length);

				box.options.container.find(".comment-list").append(template(templateURL, {
					comments: comments
				}));

				if (complete) $footer.find(".btnLoadMoreComments").addClass("hide");
				$footer.find(".progress").text(box.comments.length + " / " + count);
			}).fail(function(error) {
				Helper.alert(error);
			}).always(function() {
				Helper.end($btn);
			});
		});
	}


	module.exports = function(subjectType, subjectId, options) {
		return new Box(subjectType, subjectId, options);
	};
});