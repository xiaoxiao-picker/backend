/**
 * 现有成员
 */
define(function(require, exports, module) {
	require("plugins/select2/select2.js");

	var baseController = require('baseController');
	var bC = new baseController();
	var OrganizationService = require('OrganizationService');
	var MemberService = require('MemberService');
	var Helper = require("helper");
	var template = require('template');

	var orgId, limit;

	// 组织成员分组
	var Groups;
	// 分组成员列表
	var GroupsMembers;
	// 所有成员列表
	var AllMembers;


	var Controller = function() {
		var _controller = this;
		_controller.namespace = "members";
		_controller.actions = {
			// 打开添加管理员 面板
			openAdminSettingModal: function() {
				var modal = Helper.modal({
					title: "添加组织管理员"
				});
				// 普通成员列表
				var members = membersRankFilter(0);
				modal.html(template("app/templates/member/mulSelector", {
					members: members
				}));
				modal.addAction(".btn-save", "click", function() {
					var btn = this;
					var memberIds = [];
					modal.box.find("input[name='member']:checked").each(function(idx, input) {
						memberIds.push(input.value);
					});
					if (!memberIds.length) return Helper.errorToast("请选择至少一个成员！");

					Helper.begin(btn);
					MemberService.updateRank(orgId, memberIds.join(','), 1).done(function(data) {
						_controller.renderAdmin();
						modal.destroy();
					}).fail(function(error) {
						Helper.alert(error);
					}).always(function() {
						Helper.end(btn);
					});
				});
			},

			// 打开添加成员进入分组 面板
			openGroupSettingModal: function() {
				var groupId = this.attr("data-group-id");
				var groupName = this.attr("data-group-name");
				// 不在该分组的成员
				var groupMembers = GroupsMembers[groupId];
				var members = membersNotInGroupFilter(groupMembers);
				var modal = Helper.modal({
					title: "添加 " + groupName + " 分组成员"
				});
				modal.html(template("app/templates/member/mulSelector", {
					members: members
				}));
				modal.addAction(".btn-save", "click", function() {
					var btn = this;
					var memberIds = [];
					modal.box.find("input[name='member']:checked").each(function(idx, input) {
						memberIds.push(input.value);
					});
					if (!memberIds.length) return Helper.errorToast("请选择至少一个成员！");

					Helper.begin(btn);
					MemberService.groupMember.add(orgId, groupId, memberIds.join(',')).done(function(data) {
						_controller.renderGroup(groupId);
						_controller.renderNoGroup();
						modal.destroy();
					}).fail(function(error) {
						Helper.alert(error);
					}).always(function() {
						Helper.end(btn);
					});
				});
			},


			// 将成员从分组删除
			removeMemberFromGroup: function() {
				var _btn = this;
				var userId = _btn.attr("data-user-id");
				var groupId = _btn.attr("data-group-id");
				var memberId = _btn.attr("data-member-id");
				Helper.confirm("确定将成员从该分组删除？", {}, function() {
					Helper.begin(_btn);
					MemberService.groupMember.remove(orgId, groupId, memberId).done(function(data) {
						_controller.renderGroup(groupId);
						_controller.renderNoGroup();
					}).fail(function(error) {
						Helper.alert(error);
					}).always(function() {
						Helper.end(_btn);
					});
				});
			},

			// 删除成员的管理员权限
			removeMemberFromAdmin: function() {
				var _btn = this;
				var userId = _btn.attr("data-user-id");
				var memberId = _btn.attr("data-member-id");
				if (userId == App.user.info.id) {
					Helper.alert("不能移除自己的管理员权限，如果确实需要这样操作，请让其他管理员执行！");
					return;
				}
				Helper.confirm("确定删除该成员的管理员权限？", function() {
					Helper.begin(_btn);
					MemberService.updateRank(orgId, memberId, 0).done(function(data) {
						var member = AllMembers.objOfAttr("id", memberId);
						member.rank = 0;
						_controller.renderAdmin();
					}).fail(function(error) {
						Helper.alert(error);
					}).always(function() {
						Helper.end(_btn);
					});
				});
			},

			// 打开用户信息面板
			checkMember: function() {
				var memberId = this.attr("data-member-id");
				var member = AllMembers.objOfAttr("id", memberId);
				if (!member) return;
				require.async("lib.MemberModal", function(MemberModal) {
					MemberModal(memberId, {
						readonly: false,
						actions: {
							".btn-save": {
								event: "click",
								fnc: function(modal, event) {
									var btn = this;
									var remark = modal.box.find("#remark").val();
									if (Helper.validation.isEmpty(remark)) {
										Helper.errorToast("备注不能为空！");
										return;
									}
									Helper.begin(btn);
									MemberService.updateRemark(App.organization.info.id, memberId, remark).done(function() {
										var member = AllMembers.objOfAttr("id", memberId);
										member.remark = remark;
										$(".member-info.user-" + member.user.id).find(".remark").html(remark);
										Helper.successToast("操作成功！");
										modal.destroy();
									}).fail(function(error) {
										Helper.alert(error);
									}).always(function() {
										Helper.end(btn);
									});
								}
							},
							".btn-remove": {
								event: "click",
								fnc: function(modal, event) {
									var btn = this;
									Helper.confirm("删除后该成员将不在当前组织中，仍确定删除？", function() {
										Helper.begin(btn);
										MemberService.remove(orgId, memberId).done(function(data) {
											Helper.successToast("删除成功");
											modal.destroy();
											// 此处提供两种刷新方案
											// 第一：重新渲染整个页面
											// _controller.render();
											// 第二：找到该成员的所在分组，刷新这些分组
											var containers = $(".user-" + member.user.id).parents(".xx-group");
											$(containers).each(function(idx, container) {
												_controller.renderGroup(container.id);
											});
										}).fail(function(error) {
											Helper.alert(error);
										}).always(function() {
											Helper.end(btn);
										});
									});
								}
							}
						}
					});
				});
			},


			// 打开手动添加成员modal
			addMember: function() {
				var modal = Helper.modal({
					title: "添加新成员",
				});

				var groups = Groups.arrayWidthOutObjAttrs("id", ["SYSTEM_ADMIN"]);

				modal.html(template("app/templates/member/new-member", {
					groups: groups
				}));

				modal.box.find("#Rank").select2({
					formatNoMatches: "暂无"
				});

				modal.addAction(".btn-save", "click", function() {
					var btn = this;
					var remark = modal.box.find("#Remark").val();
					var phone = modal.box.find("#PhoneNumber").val();
					var rank = +modal.box.find("#Rank").val();

					if (Helper.validation.isEmpty(remark)) {
						return Helper.errorToast("请输入成员名称（备注）！");

					}
					if (Helper.validation.isEmpty(phone)) {
						return Helper.errorToast("请输入成员手机号码！");

					}
					if (!Helper.validation.isPhoneNumber(phone)) {
						return Helper.errorToast("请输入正确的手机号码！");

					}

					Helper.begin(btn);
					MemberService.addMember(orgId, phone, remark, rank).done(function(data) {
						Helper.successToast("添加成功！");
						_controller.renderNoGroup();
						(rank == 1) && _controller.renderAdmin();
						modal.destroy();
					}).fail(function(error) {
						Helper.alert(error);
					}).always(function() {
						Helper.end(btn);
					});
				});
			}
		};
	};

	bC.extend(Controller);
	Controller.prototype.init = function(templateUrl, callback) {
		this.templateUrl = templateUrl;
		this.callback = callback;
		orgId = App.organization.info.id;
		Groups = [];
		AllMembers = [];
		GroupsMembers = {};
		limit = 10;
		this.render();
	};

	Controller.prototype.render = function() {
		var _controller = this;
		var callback = this.callback;
		var templateUrl = this.templateUrl;

		// 新申请成员人数
		var getAppliedMemberCount = MemberService.appliedMemberCount(orgId);
		// 当前分组
		var getGroups = MemberService.group.list(orgId, -1, -1);

		$.when(getAppliedMemberCount, getGroups).done(function(data1, data2) {
			var appliedMemberCount = data1.result;
			Groups = makeGroups(data2.result);
			Helper.globalRender(template(templateUrl, {
				orgId: orgId,
				session: App.getSession(),
				groups: Groups,
				appliedMembersCount: appliedMemberCount
			}));
			$(Groups).each(function(idx, group) {
				_controller.renderGroup(group.id);
			});
		}).fail(function(error) {
			Helper.alert(error);
		}).always(function() {
			Helper.execute(callback);
		});
	};

	// 管理员分组
	Controller.prototype.renderAdmin = function() {
		var id = "SYSTEM_ADMIN";
		var name = "管理员";
		var container = $("#" + id);
		MemberService.getList(orgId, 0, 0, 0).done(function(data) {
			var members = data.result.data;
			renderMembers(container, id, name, members);
			GroupsMembers[id] = members;
			membersInsertFilter(members);
		}).fail(function(error) {
			Helper.errorToast(error);
		});
	};
	// 指定分组
	Controller.prototype.renderGroup = function(id) {
		if (id == "SYSTEM_ADMIN") {
			this.renderAdmin();
			return;
		}
		if (id == "SYSTEM_NOGROUP") {
			this.renderNoGroup();
			return;
		}

		var container = $("#" + id);
		var group = Groups.objOfAttr("id", id);
		MemberService.groupMember.getList(orgId, id).done(function(data) {
			var members = data.result;
			renderMembers(container, id, group.name, members);
			GroupsMembers[id] = members;
			membersInsertFilter(members);
		}).fail(function(error) {
			Helper.errorToast(error);
		});
	};
	// 未分组
	Controller.prototype.renderNoGroup = function() {
		var id = "SYSTEM_NOGROUP";
		var name = "未分组";
		var container = $("#" + id);
		MemberService.groupMember.nogroupMembers(orgId).done(function(data) {
			var members = data.result;
			renderMembers(container, id, name, members);
			GroupsMembers[id] = members;
			membersInsertFilter(members);
		}).fail(function(error) {
			Helper.errorToast(error);
		});
	};

	/**
	 * 渲染分组的成员信息
	 */
	function renderMembers(container, groupId, groupName, members) {
		var groupMember = {
			groupId: groupId,
			groupName: groupName,
			members: members
		};
		container.html(template("app/templates/member/groupMembersInner", groupMember));
	}


	/**
	 * 设置管理员和分组时多选modal层的渲染
	 */
	function renderSelectorMembers(allMembers, groupMembers, groupId, title, action, page) {
		var notGroupMembers = [];
		// 循环判断组织成员是否已在该分组，如果已存在则去掉
		$(allMembers).each(function(idx, item) {
			var userId = item.user.id;
			item.isGroupMember = false;
			$(groupMembers).each(function(idx2, item2) {
				if (userId === item2.user.id) {
					item.isGroupMember = true;
				}
			});
			if (!item.isGroupMember) {
				notGroupMembers.push(item);
			}
		});
		$("#Modal_Content").html(template("app/templates/member/mulSelector", {
			title: title,
			action: action,
			groupId: groupId,
			page: page,
			members: notGroupMembers
		}));
	};

	function makeMembers(data) {
		var members = [];
		$(data).each(function(idx, member) {
			if (!member) {
				member = {};
			}
			if (!member.user) {
				member.user = {};
			}
			members.push(member);
		});
		return members;
	}


	function makeGroups(groups) {
		var adminGroup = {
			id: "SYSTEM_ADMIN",
			name: "管理员",
			isSystem: true
		};
		var noGroup = {
			id: "SYSTEM_NOGROUP",
			name: "未分组",
			isSystem: true
		};
		groups.splice(0, 0, adminGroup);
		groups.push(noGroup);
		return groups;
	};

	// 将成员添加进AllMembers数组
	function membersInsertFilter(members) {
		for (var i = 0, member; i < members.length; i++) {
			member = members[i];
			var index = AllMembers.indexOfAttr("id", member.id);
			if (index == -1) {
				AllMembers.push(member);
			} else {
				AllMembers[index] = member;
			}
		};
		return AllMembers;
	};
	// 从AllMembers中拉取不在members中的成员
	function membersNotInGroupFilter(members) {
		var result = [];
		for (var i = 0, member; i < AllMembers.length; i++) {
			member = AllMembers[i];
			if (members.indexOfAttr("id", member.id) == -1) {
				result.push(member);
			}
		};
		return result;
	};

	// 获取rank为rank的成员列表
	function membersRankFilter(rank) {
		var result = [];
		for (var i = 0, member; i < AllMembers.length; i++) {
			member = AllMembers[i];
			if (member.rank == rank) {
				result.push(member);
			}
		};
		return result;
	};

	module.exports = Controller;
});