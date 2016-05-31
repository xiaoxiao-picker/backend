/**
 * 现有成员
 */
define(function(require, exports, module) {
	var baseController = require('baseController');
	var template = require('template');
	var bC = new baseController();
	var MemberService = require('MemberService');
	var Helper = require("helper");

	var orgId, session;
	var tmp;
	var limit, skip, page, keyword;

	var Members, count;

	template.helper('calculate', Helper.getCharLength);

	var Controller = function() {
		var _controller = this;
		_controller.namespace = "E-members";
		_controller.actions = {
			search: function() {
				var _btn = this;
				keyword = $("#Keyword").val();
				page = 1;
				Helper.begin(_btn);
				render(function() {
					Helper.end(_btn);
				});
			},
			// 打开用户信息面板
			openUserModal: function() {
				var _btn = this;
				var memberId = _btn.attr("data-member-id");
				require.async('lib.MemberModal', function(MemberModal) {
					MemberModal(memberId);
				});
			},
			// 删除成员
			removeMember: function() {
				var _btn = this;
				var userId = _btn.attr("data-value");
				Helper.confirm("确定将该成员移除组织？", {}, function() {
					Helper.begin(_btn);
					MemberService.remove(orgId, userId).done(function(data) {
						Helper.successToast("删除成功");
						_controller.init();
					}).fail(function(error) {
						Helper.errorToast(error);
					}).always(function() {
						Helper.end(_btn);
					});
				});
			},
			// 查看评论
			checkComment: function() {
				var memberId = this.attr("data-value");
				var member = getMember(memberId);

				require.async("scripts/lib/memberResume", function(memberResume) {
					memberResume(member, {
						add: function() {
							member.commentCount++;
							renderMembers();
						},
						remove: function() {
							member.commentCount--;
							renderMembers();
						}
					});
				});
			}
		};
	};

	bC.extend(Controller);
	Controller.prototype.init = function(templateName, fn) {
		orgId = App.organization.info.id;
		session = App.getSession();
		keyword = Helper.param.search("keyword") || "";
		page = +Helper.param.search('page') || 1;
		tmp = templateName;
		Members = [];
		limit = 10;
		render(fn);
	};

	function render(callback) {
		skip = (page - 1) * limit;
		MemberService.getList(orgId, 0, 0, -1).done(function(data) {
			Members = data.result.data;
			count = Members.length;
			renderMembers();
		}).fail(function(error) {
			Helper.alert(error);
		}).always(function() {
			Helper.execute(callback);
		});
	};

	function renderMembers() {
		Helper.globalRender(template(tmp, {
			count: count,
			members: Members,
			orgId: orgId,
			keyword: keyword,
			session: session,
			frontRoot: Helper.config.pages.frontRoot
		}));
	};

	// 根据memberId获取member
	function getMember(memberId) {
		var member;
		$(Members).each(function(idx, item) {
			if (item.id === memberId) {
				member = item;
				return false;
			}
		});
		return member;
	};
	module.exports = Controller;
});