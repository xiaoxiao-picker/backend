/**
 *	报名时间段编辑
 */
define(function(require, exports, module) {
	var Helper = require("helper");
	var template = require("template");
	var EventService = require('EventService');
	var DatetimeGroup = require("lib.DatetimeGroup");

	var boxTemp = 'app/templates/event/edit-times-modal';

	var eventId;
	var TimeInfo, SignUpTimes, Callback;

	var TimeBox = function(eid, timeInfo, options, callback) {
		eventId = eid;
		TimeInfo = $.extend({
			startDate: '',
			endDate: '',
			numberOfLimit: '',
			onlyAllowMembersToSignUp: false
		}, timeInfo);
		SignUpTimes = options.signUpTimes || [];
		var _options = $.extend({
			title: '添加时间段',
			actions: {
				'.btn-save': {
					event: 'click',
					fnc: save
				}
			}
		}, options);
		Callback = $.extend({}, callback);

		var modal = Helper.modal(_options);
		init(modal);

		return modal;
	};

	function init(timeBox) {
		timeBox.html(template(boxTemp, {
			timeInfo: TimeInfo
		}));
		DatetimeGroup(timeBox.box.find(".datetimepicker-group"), {
			minErrorMessage: "开始时间不能大于结束时间",
			maxErrorMessage: "结束时间不能小于开始时间"
		});
	}

	function validate() {
		TimeInfo.startDate = $('#SIGN_START_TIME').val();
		TimeInfo.endDate = $('#SIGN_END_TIME').val();
		TimeInfo.numberOfLimit = $('input.signup-limit').val();
		TimeInfo.onlyAllowMembersToSignUp = $('input[name=onlyAllowMembersToSignUp]').prop('checked');

		if (Helper.validation.isEmptyNull(TimeInfo.startDate)) {
			Helper.errorToast('报名开始时间不得为空');
			return false;
		};
		if (Helper.validation.isEmptyNull(TimeInfo.endDate)) {
			Helper.errorToast('报名结束时间不得为空');
			return false;
		};

		TimeInfo.startDate = new Date(TimeInfo.startDate).getTime();
		TimeInfo.endDate = new Date(TimeInfo.endDate).getTime();

		for (var i = 0, time; i < SignUpTimes.length; i++) {
			time = SignUpTimes[i];
			if (TimeInfo.id == time.id) continue;

			if (!((TimeInfo.startDate < time.startDate && TimeInfo.endDate < time.startDate) || (TimeInfo.startDate > time.endDate && TimeInfo.endDate > time.endDate))) {
				Helper.errorToast('时间段不得重复，请重新选择');
				return false;
			}
		};

		return true;
	}

	// 保存
	function save(timeBox) {
		if (!validate()) return;

		var action = TimeInfo.id ? 'update' : 'add';
		EventService.signup.time[action](eventId, TimeInfo).done(function(data) {
			Callback.save && $.isFunction(Callback.save) && Callback.save.call(timeBox);
		}).fail(function(error) {
			Helper.alert(error);
		});
	}

	module.exports = TimeBox;

});