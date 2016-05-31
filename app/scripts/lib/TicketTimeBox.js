/**
 *	电子票开启时间段编辑
 */
define(function(require, exports, module) {
	var Helper = require("helper");
	var template = require("template");
	var TicketService = require('TicketService');
	var DatetimeGroup = require("lib.DatetimeGroup");

	var boxTemp = 'app/templates/ticket/edit-time-modal';

	var SourceId;
	var TimeInfo, SourceTimes, Callback;

	var TimeBox = function(sid, timeInfo, options, callback) {
		SourceId = sid;
		TimeInfo = $.extend({
			startDate: '',
			endDate: '',
			numberOfLimit: ''
		}, timeInfo);
		SourceTimes = options.sourceTimes || [];
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
		TimeInfo.startDate = $('#START_TIME').val();
		TimeInfo.endDate = $('#END_TIME').val();
		TimeInfo.numberOfLimit = $('input.source-limit').val();

		if (Helper.validation.isEmptyNull(TimeInfo.startDate)) {
			Helper.errorToast('报名开始时间不得为空');
			return false;
		};
		if (Helper.validation.isEmptyNull(TimeInfo.endDate)) {
			Helper.errorToast('报名结束时间不得为空');
			return false;
		};
		if (!Helper.validation.isInt(TimeInfo.numberOfLimit) || !(+TimeInfo.numberOfLimit > 0)) {
			Helper.errorToast("电子票数量必须为大于0的整数");
			return false;
		}

		TimeInfo.startDate = new Date(TimeInfo.startDate).getTime();
		TimeInfo.endDate = new Date(TimeInfo.endDate).getTime();

		for (var i = 0, time; i < SourceTimes.length; i++) {
			time = SourceTimes[i];
			if (TimeInfo.id == time.id) continue;

			if (!((TimeInfo.startDate < time.startDate && TimeInfo.endDate < time.startDate) || (TimeInfo.startDate > time.endDate && TimeInfo.endDate > time.endDate))){
				Helper.errorToast('时间段不得重复，请重新选择');
				return false;
			}
		};

		return true;
	}

	// 保存
	function save(timeBox) {
		var _btn = $(this);	
		if (!validate()) return;

		var action = TimeInfo.id ? 'update': 'add';

		Helper.begin(_btn);
		TicketService.time[action](SourceId, TimeInfo).done(function(data) {
			Callback.save && $.isFunction(Callback.save) && Callback.save.call(timeBox);
		}).fail(function(error) {
			Helper.alert(error);
		}).always(function() {
			Helper.end(_btn);
		});
	}

	module.exports = function(sid, timeInfo, options, callback) {
		new TimeBox(sid, timeInfo, options, callback);
	};

});