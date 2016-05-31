define(function(require, exports, module) {
	var baseController = require('baseController');
	var bC = new baseController();
	var Helper = require("helper");
	var template = require('template');
	var VoteService = require("VoteService");
	var RelationService = require("RelationService");


	var orgId, sourceType, sourceId;

	var Controller = function() {
		var controller = this;
		controller.namespace = "vote.relation";
		controller.actions = {
			// 添加投票
			addVote: function() {
				Helper.alert("<p>新建投票后，请手动关联。</p><p>自动关联功能正在奋力开发中。</p>", function() {
					Helper.go("vote/default/add/edit");
				});
			},
			// 关联投票
			bindVote: function() {
				require.async("VoteSelector", function(VoteSelector) {
					VoteSelector({
						title: "添加投票关联",
						max: sourceType == "WALL" ? 1 : -1,
						selectedVoteIds: controller.votes.arrayOfAttr("id"),
						change: function(selector, checked, vote) {
							$input = this;
							var voteSelector = selector;
							var voteIds = [vote.id].join(',');
							if (checked) {
								RelationService.bind(sourceType, sourceId, 'VOTE', voteIds).done(function(data) {
									selector.options.selectedVoteIds.push(vote.id);
									controller.votes.splice(0, 0, vote);
									controller.render();
								}).fail(function(error) {
									$input.prop("checked", false);
									Helper.alert(error);
								});;
							} else {
								RelationService.unbind(sourceType, sourceId, 'VOTE', voteIds).done(function(data) {
									selector.options.selectedVoteIds.remove(vote.id);
									var unbindVoteId = vote.id;
									var index = controller.votes.indexOfAttr("id", unbindVoteId);
									controller.votes.splice(index, 1);
									controller.render();
								}).fail(function(error) {
									$input.prop("checked", true);
									Helper.alert(error);
								});
							}
						}
					});
				});
			},
			// 开启关闭投票
			switch: function() {
				var _input = this;
				var voteId = _input.attr("data-value");
				var checked = _input.prop("checked");
				VoteService[checked ? "open" : "close"](voteId).done(function(data) {
					Helper.successToast(checked ? "投票已开启！" : "投票已关闭！");
					if (checked) {
						_input.prop("checked", true);
					} else {
						_input.removeAttr("checked");
					}
				}).fail(function(error) {
					Helper.alert(error);
				});
			},
			// 移除绑定
			remove: function() {
				var _btn = this;
				var voteId = _btn.attr("data-value");
				Helper.confirm("确定解除该投票关联？", {}, function() {
					Helper.begin(_btn);
					var voteIds = [voteId].join('');
					RelationService.unbind(sourceType, sourceId, 'VOTE', voteIds).done(function(data) {
						var index = controller.votes.indexOfAttr("id", voteId);
						controller.votes.splice(index, 1);
						controller.render();
					}).fail(function(error) {
						Helper.alert(error);
					});
				});
			}
		};
	};
	bC.extend(Controller);
	/**
	 * 初始化变量，渲染模板
	 */
	Controller.prototype.init = function() {
		var controller = this;
		orgId = App.organization.info.id;

		sourceType = Helper.param.hash('sourceType').toUpperCase();
		sourceId = Helper.param.hash('sourceId');

		RelationService.getList(sourceType, sourceId, 'VOTE').done(function(data) {
			controller.votes = data.result;
			controller.render();
		}).fail(function(error) {
			Helper.alert(error);
		}).always(function() {
			Helper.execute(controller.callback);
		});
	};

	Controller.prototype.render = function() {
		var votes = this.votes;
		Helper.globalRender(template(this.templateUrl, {
			sourceId: sourceId,
			sourceType: sourceType,
			backURL: makeRedirectURL(),
			votes: votes
		}));
	};

	function makeRedirectURL() {
		var from = Helper.param.search('from') || "edit";
		if (sourceType == "WALL") {
			if (from == "lucky") {
				return "#wall/" + sourceId + "/lottery";
			} else if (from == "lottery") {
				return "#lottery/relation/Wall/" + sourceId + "/list?from=vote";
			} else {
				return '#' + sourceType.toLowerCase() + '/' + sourceId + '/' + from;
			}
		}
		return '#' + sourceType.toLowerCase() + '/' + sourceId + '/' + from;
	}

	module.exports = Controller;
});