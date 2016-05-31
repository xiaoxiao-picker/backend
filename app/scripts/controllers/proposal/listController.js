define(function(require, exports, module) {
	var baseController = require('baseController');
	var template = require('template');
	var bC = new baseController();
	var ProposalService = require('ProposalService');
	var Helper = require("helper");
	var Pagination = require('lib.Pagination');

	var orgId = Application.organization.id;

	var keywords, limit, page;

	var State;

	var Controller = function() {
		var controller = this;
		this.namespace = "proposal.list";
		this.actions = {
			switchPage: function() {
				page = +this.attr("data-value");
				Application.loader.begin();
				controller.render(function() {
					Application.loader.end();
				});
			},
			selectCategory: function() {
				var $input = $(this);
				var offset = $(this).offset();
				var top = offset.top + $(this).height();
				var left = offset.left;
				var zIndex = $(this).attr("data-zIndex") || 500;

				require.async("lib.CategorySelector", function(CategorySelector) {
					CategorySelector("PROPOSAL", {
						top: top,
						left: left,
						zIndex: zIndex,
						select: function(category) {
							this.destroy();
							$input.val(category.name);
							keywords.categoryId = category.id;
						}
					});
				});
			},
			search: function() {
				var btn = this;
				keywords.keyword = btn.parents(".search-box").find(".keyword-name").val();
				Helper.begin(btn);
				page = 1;
				controller.render(function() {
					Helper.end(btn);
				});
			},
			remove: function() {
				var btn = this;
				var proposalId = btn.attr("data-value");

				Helper.confirm("确定删除此提案？", function() {
					Helper.begin(btn);
					ProposalService.remove(proposalId).done(function(data) {
						Helper.successToast("删除成功！");
						controller.render();
					}).fail(function(error) {
						Helper.alert(error);
					}).always(function() {
						Helper.end(btn);
					});
				});
			},
			stick: function() {
				var $btn = this;
				var proposalId = $btn.attr("data-proposal-id");
				var sticked = $btn.hasClass('sticked');

				Helper.confirm("确定" + (sticked ? "取消置顶" : "置顶") + "此信息？", function() {
					Helper.begin($btn);
					ProposalService[sticked ? 'untop' : 'top'](proposalId).done(function(data) {
						Helper.successToast((sticked ? "取消置顶" : "置顶") + "成功！");
						controller.render();
					}).fail(function(error) {
						Helper.alert(error);
					}).always(function() {
						Helper.end($btn);
					});
				});
			},
			// 设置提案功能在前台的显示标题
			setProposalTitle: function() {
				Helper.singleInputModal({
					title: "设置提案功能在前台的显示标题",
					name: "提案标题",
					value: Application.organization.config.proposalName || "提案",
					placeholder: "请填写提案功能在前台的显示标题，默认“提案”",
					action: function(modal) {
						var btn = this;
						var title = $.trim(modal.box.find(".input").val());
						Helper.begin(btn);
						Application.organization.configUpdate({
							proposalName: title,
						}).done(function(data) {
							Application.organization.config.proposalName = title;
							modal.destroy();
						}).fail(function(error) {
							Helper.alert(error);
						}).always(function() {
							Helper.end(btn);
						});
					}
				});
			}
		};
	};

	bC.extend(Controller);
	Controller.prototype.init = function() {
		page = 1;
		limit = 10;
		keywords = {
			keyword: "",
			categoryId: ""
		};
		State = Helper.param.search("state") || "UNSOLVED";

		Helper.globalRender(template(this.templateUrl, {
			keyword: keywords.keyword,
			state: State
		}));

		this.render(this.callback);
	};


	// 渲染函数
	Controller.prototype.render = function(callback) {
		var controller = this;
		var skip = (page - 1) * limit;

		ProposalService.getList({
			orgId: orgId,
			skip: skip,
			limit: limit,
			keyword: keywords.keyword,
			categoryId: keywords.categoryId,
			state: State
		}).done(function(data) {
			var count = data.result.total;
			var proposals = data.result.data;
			var $container = $("#proposalContent");

			$container.find(".panel-body,.panel-footer").remove();

			$container.append(template("app/templates/proposal/list-option", {
				count: count,
				proposals: proposals,
				pagination: Helper.pagination(count, limit, page)
			}));

			$("#Count").text(count);

			Pagination(count, limit, page, {
				switchPage: function(pageIndex) {
					page = pageIndex;
					Application.loader.begin();
					controller.render(function() {
						Application.loader.end();
					});
				}
			});

		}).fail(function(error) {
			Helper.alert(error);
		}).always(function() {
			Helper.execute(callback);
		});
	};

	// 被举报的提案个数提示
	function renderReportedCount() {
		ProposalService.getReportedCount(orgId).done(function(data) {
			var count = data.result;
			if (count == 0) return;
			$("#ReportedTipsContainer").html(template("app/templates/proposal/list-reported-tips", {
				count: count
			}));
		}).fail(function(error) {
			Helper.errorToast(error);
		});
	};

	module.exports = Controller;
});