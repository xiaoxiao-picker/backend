// 用户选择器
define(function(require, exports, module) {
	var MemberService = require('MemberService');
	var Helper = require("helper");
	var template = require("template");

	// 容器模板
	var boxTemp = "app/templates/public/user-selector/box";
	// 成员模板
	var memberTemp = "app/templates/public/user-selector/member";

	var orgId = App.organization.info.id;

	var UserSelector = function(options) {
		options = $.extend(true, {
			title: '选择成员',
			className: 'width-700',
			container: $(document.body),
			curMembers: [],
			limit: 1,
			actions: {
				"input[name=member]": {
					event: "change",
					fnc: selectMember
				},
				"input[name=search]": {
					event: "change keyup",
					fnc: function(selector) {
						search(selector, this.value);
					}
				},
				"input[name=checkedAll]": {
					event: "change",
					fnc: selectAll
				},
				'.btn-confirm': {
					event: "click",
					fnc: confirm
				}
			}
		}, options);

		var modal = Helper.modal(options);
		init(modal);
		return modal;
	};

	function init(selector) {
		selector.html(template(boxTemp, {
			limit: selector.options.limit
		}));

		// orgId,rank
		MemberService.getList(orgId, 0, 0, -1).done(function(data) {
			selector.members = makeMembers(selector, data.result.data);
			render(selector);
		}).fail(function(error) {
			selector.close();
			Helper.alert(error);
		});
	};

	function render(selector, members) {
		members = members || selector.members;
		selector.box.find("#USMEMBERCONTAINER").html(template(memberTemp, {
			members: members
		}));
	};

	// 选中成员
	function selectMember(selector) {
		if (selector.options.limit == 1) {
			$("input[name=member]").prop("checked", false);
			$(this).prop('checked', true);
		} else {
			var total = selector.members.length;
			var selectTotal = $("input[name=member]:checked").size();

			$("input[name=checkedAll]").prop("checked", total == selectTotal ? true : false);
		}
	};

	// 全选
	function selectAll(selector) {
		$("input[name=member]").prop("checked", $(this).prop("checked"));
	};

	// 确定
	function confirm(selector) {

		var selectMembers = [];
		$.each($("input[name=member]:checked"), function(idx, item) {
			var userId = $(item).attr("data-value");
			var member = selector.members.objOfAttr("id", userId);
			selectMembers.push(member);
		});

		if (!selectMembers.length) {
			Helper.errorToast('请至少选择一个联系人');
			return;
		};

		selector.options.confirm && $.isFunction(selector.options.confirm) && selector.options.confirm.call(selector, selectMembers);
	};

	// 搜索
	function search(selector, value) {
		var members = [];
		$(selector.members).each(function(idx, member) {
			if (
				matchMember(member.remark, value) ||
				matchMember(member.user.name, value) ||
				matchMember(member.user.nickname, value) ||
				matchMember(member.user.phoneNumber, value)) {
				members.push(member);
			}
		});
		render(selector, members);

		function matchMember(matchedText, matchText) {
			matchedText = matchedText || "";
			return matchedText.indexOf(matchText) != -1;
		}
	};

	function makeMembers(selector, members) {
		var newMembers = [];
		for (var i = 0; i < members.length; i++) {
			var member = members[i];

			var curMembers = selector.options.curMembers;
			if (curMembers.length) {
				// 过滤现有成员
				var index = curMembers.indexOfAttr('id', member.id);
				if (index == -1) {
					newMembers.push(member);
				};
			}else {
				newMembers.push(member);
			}
		};
		return newMembers;
	}

	module.exports = UserSelector;
});