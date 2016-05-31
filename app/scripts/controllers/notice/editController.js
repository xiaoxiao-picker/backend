define(function(require, exports, module) {
	var baseController = require('scripts/baseController');
	var bC = new baseController();

	var NoticeService = require('scripts/services/NoticeService');
	var MemberService = require('scripts/services/MemberService');

	var Helper = require("scripts/public/helper");
	var template = require('scripts/template');
	var DataFilter = require("DataFilter");

	var orgId, noticeId, SmsCount;

	var NoticeInfo;

	var Controller = function() {
		var _controller = this;
		_controller.namespace = "notice.edit";
		_controller.actions = {
			save: function() {
				var _btn = this;

				saveThen(_btn, false, function() {
					Helper.go('#notices?state=UNPUBLISHED');
				});
			},
			saveAndSend: function() {
				var _btn = this;

				saveThen(_btn, true, function() {
					Helper.go('#notices?state=PUBLISHED');
				});
			},
			remove: function() {
				var _btn = this;
				Helper.confirm("确定删除该公告？", {}, function() {
					Helper.begin(_btn);
					NoticeService.remove(orgId, noticeId).done(function(data) {
						Helper.go("notices?state=UNPUBLISHED");
					}).fail(function(error) {
						Helper.alert(error);
					}).always(function() {
						Helper.end(_btn);
					});
				});
			},
			// 显示添加成员弹出层
			openUserSelector: function() {
				require.async('UserSelector', function(UserSelector) {
					new UserSelector({
						title: '添加联系人',
						curMembers: NoticeInfo.members,
						limit: -1,
						confirm: function(members) {
							NoticeInfo.members = NoticeInfo.members.concat(members);
							this.close();
							renderMembers();
						}
					});
				});
			},
			removeMember: function() {
				var _btn = this,
					targetId = _btn.attr("data-value");

				var index = NoticeInfo.members.indexOfAttr('id', targetId);
				NoticeInfo.members.splice(index, 1);

				_btn.parents(".xx-tag-wrapper").remove();
			},
			titleModify: function() {
				var _input = this;
				NoticeInfo.title = _input.val();
			},
			terseValidate: function() {
				var _input = this;
				var terse = _input.val();
				if (terse.length > 100) {
					terse = terse.substr(0, 100);
					_input.val(terse);
				}
				$("#TerseRemain").text(100 - terse.length);

				NoticeInfo.text = terse;
			}
		}
	};

	bC.extend(Controller);
	Controller.prototype.init = function(templateUrl, callback) {
		this.callback = callback;
		this.templateUrl = templateUrl;
		orgId = App.organization.info.id;
		noticeId = Helper.param.hash("noticeId");
		this.render();
	};

	Controller.prototype.render = function() {
		var callback = this.callback;
		var templateUrl = this.templateUrl;
		// 获取剩余短信数
		var getSmsRemain = NoticeService.getSmsRemain(orgId).done(function(data) {
			SmsCount = data.result;
		});

		var getNoticeInfo = noticeId == "add" ? (function() {
			NoticeInfo = dataToModel({
				title: "",
				text: "",
				announcement: {},
				announceTargets: []
			});
		})() : NoticeService.load(orgId, noticeId).done(function(data) {
			NoticeInfo = dataToModel(data.result);
		});

		$.when(getSmsRemain, getNoticeInfo).done(function() {
			Helper.globalRender(template(templateUrl, {
				smsCount: SmsCount,
				notice: NoticeInfo,
				noticeId: noticeId
			}));
			noticeId != "add" && renderMembers();
		}).fail(function(error) {
			Helper.alert(error);
		}).always(function() {
			Helper.execute(callback);
		});
	};

	/**
	 *	渲染发送联系人页面
	 */
	function renderMembers() {
		$('#MembersBox').html(template("app/templates/notice/members-box", {
			members: NoticeInfo.members
		}));
	};

	function saveThen(btn, isSend, success) {
		if (!validate()) return;

		var data = modelToData();

		if (isSend && !NoticeInfo.members.length) {
			return Helper.alert("请至少选择一个发送对象才能发送！");
		}

		btn && Helper.begin(btn);
		if (noticeId != 'add') {
			data.announceId = noticeId;
		};
		NoticeService.save(orgId, data).done(function(data) {
			if (noticeId == 'add') {
				noticeId = data.result;
			};

			if (isSend) {
				NoticeService.send(noticeId).done(function(data) {
					Helper.execute(success);
				}).fail(function(error) {
					Helper.alert(error);
				});
			} else {
				Helper.execute(success);
			}

		}).fail(function(error) {
			Helper.alert(error);
		}).always(function() {
			btn && Helper.end(btn);
		});
	};

	function validate() {
		if (Helper.validation.isEmptyNull(NoticeInfo.title)) {
			Helper.errorToast('公告标题不得为空');
			return false;
		};

		if (Helper.validation.isEmptyNull(NoticeInfo.text)) {
			Helper.errorToast('公告内容不得为空');
			return false;
		};

		return true;
	};

	function dataToModel(noticeInfo) {
		return {
			id: noticeInfo.announcement.id,
			title: noticeInfo.announcement.title,
			text: noticeInfo.announcement.text,
			members: makeMembers()
		};

		function makeMembers() {
			var members = [];
			$.each(noticeInfo.announceTargets, function(idx, target) {
				var member = target.member;
				members.push(member);
			});

			return members;
		}
	};

	function modelToData() {
		var userIds = [];
		$.each(NoticeInfo.members, function(idx, member) {
			userIds.push(member.user.id);
		});

		var data = {
			userIds: userIds.join(',')
		};

		var strings = DataFilter.strings(["title", "text"], NoticeInfo);

		return $.extend(data, strings);
	};

	module.exports = Controller;
});