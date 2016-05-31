/**
 * 提案详情--带评论
 */
define(function(require, exports, module) {
	var baseController = require('baseController');
	var template = require('template');
	var bC = new baseController();
	var ProposalService = require('ProposalService');
	var CommentService = require('CommentService');
	var ReportService = require('ReportService');
	var Helper = require("helper");

	var orgId = App.organization.info.id;
	var proposalId, ProposalInfo, ProposalAdminReplies;
	var CommentParam;

	var Controller = function() {
		var controller = this;
		this.namespace = "proposal.info";
		this.actions = {
			// 删除提案
			remove: function() {
				var _btn = this;
				Helper.confirm("确定删除该提案？", function() {
					Helper.begin(_btn);
					ProposalService.remove(proposalId).done(function(data) {
						Helper.goBack();
						return;
					}).fail(function(error) {
						Helper.alert(error);
					}).always(function() {
						Helper.end(_btn);
					});
				});
			},
			addAdminReply: function() {
				require.async("lib.richEditorModal", function(richEditor) {
					richEditor({
						title: "添加管理员回复",
						submit: function(text, btn) {
							var modal = this;
							if (Helper.validation.isEmpty(text)) {
								return Helper.errorToast("回复内容不能为空！");
							}
							Helper.begin(btn);
							ProposalService.reply.add(proposalId, text).done(function(data) {
								if (ProposalInfo.proposalState == 'UNSOLVED') {
									Helper.confirm("是否将该提案设置为已解决？", function() {
										ProposalService.changeState(proposalId, 'SOLVED').done(function(data) {
											ProposalInfo.proposalState = "SOLVED";
										}).fail(function(error) {
											Helper.alert(error);
										});
									});
								}
								modal.destroy();
								renderAdminReplies();
							}).fail(function(error) {
								Helper.alert(error);
							}).always(function() {
								Helper.end(btn);
							});
						}
					});
				});
			},
			updateAdminReply: function() {
				var $btn = this;
				var replyId = $btn.attr("data-reply-id");
				var reply = ProposalAdminReplies.objOfAttr("id", replyId);
				require.async("lib.richEditorModal", function(richEditor) {
					richEditor({
						title: "修改管理员回复",
						text: reply.text,
						submit: function(text, btn) {
							var modal = this;
							if (Helper.validation.isEmpty(text)) {
								return Helper.errorToast("回复内容不能为空！");
							}
							Helper.begin(btn);
							ProposalService.reply.update(proposalId, replyId, text).done(function(data) {
								if (ProposalInfo.proposalState == 'UNSOLVED') {
									Helper.confirm("是否将该提案设置为已解决？", function() {
										ProposalService.changeState(proposalId, 'SOLVED').done(function(data) {
											ProposalInfo.proposalState = "SOLVED";

										}).fail(function(error) {
											Helper.alert(error);
										});
									});
								}
								modal.destroy();
								renderAdminReplies();
							}).fail(function(error) {
								Helper.alert(error);
							}).always(function() {
								Helper.end(btn);
							});
						}
					});
				});
			},
			removeAdminReply: function() {
				var $btn = this;
				var replyId = $btn.attr("data-reply-id");
				var reply = ProposalAdminReplies.objOfAttr("id", replyId);
				Helper.confirm("确定删除该回复么？", function() {
					Helper.begin($btn);
					ProposalService.reply.remove(proposalId, replyId).done(function(data) {
						$btn.parents("li").slideUp(200, function() {
							$(this).remove();
						});
					}).fail(function(error) {
						Helper.alert(error);
					}).always(function() {
						Helper.end($btn);
					});
				});
			},
			// 开启关闭评论
			commentState: function() {
				var $input = this;
				var checked = $input.prop('checked');
				$input.attr("disabled", "disabled");
				ProposalService.comment.changeState(proposalId, checked ? 'OPEN' : 'CLOSE').done(function(data) {
					$("#CommentContainer .commentList")[checked ? "removeClass" : "addClass"]("disabled");
					ProposalInfo.commentState = checked ? "OPEN" : "CLOSE";
				}).fail(function(error) {
					Helper.alert(error);
				}).always(function() {
					$input.removeAttr("disabled");
				});
			},
			// 删除提案标签
			removeReports: function() {
				var _btn = this;
				Helper.confirm("确定移除举报标签？", function() {
					Helper.begin(_btn);
					ReportService.remove('PROPOSAL', proposalId).done(function(data) {
						Helper.successToast("提案标签已移除！");
						_btn.parents(".setting-condition-wrapper").slideUp(200, function() {
							$(this).remove();
						});
					}).fail(function(error) {
						Helper.alert(error);
					}).always(function() {
						Helper.end(_btn);
					});
				});
			}
		};
	};

	bC.extend(Controller);
	Controller.prototype.init = function() {
		CommentParam = {
			page: 1,
			limit: 10
		};
		proposalId = Helper.param.hash("proposalId");
		this.render();
	};


	// 渲染函数
	Controller.prototype.render = function() {
		var controller = this;

		var getProposalInfo = ProposalService.get(proposalId).done(function(data) {
			ProposalInfo = data.result;
		});

		$.when(getProposalInfo).done(function() {
			Helper.globalRender(template(controller.templateUrl, {
				orgId: orgId,
				proposal: ProposalInfo
			}));
			renderAdminReplies();
			renderComments("init");
		}).fail(function(error) {
			Helper.alert(error);
		}).always(function() {
			Helper.execute(controller.callback);
		});
	};


	function renderAdminReplies() {
		ProposalService.reply.getList(proposalId).done(function(data) {
			ProposalAdminReplies = data.result;
			$("#SystemReplyContainer>.xx-inner-body").html(template("app/templates/proposal/info-system-reply", {
				adminReplies: ProposalAdminReplies
			}));
		}).fail(function(error) {
			Helper.alert(error);
		});
	}


	// 渲染提案回复
	function renderComments() {
		require.async("lib.commentBox", function(commentBox) {
			commentBox("PROPOSAL", proposalId, {
				container: $("#CommentContainer>.xx-inner-body")
			});
		});
	}

	module.exports = Controller;
});