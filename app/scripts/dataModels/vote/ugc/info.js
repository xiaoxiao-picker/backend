// 投票数据模型
define(function(require, exports, module) {
	var DataFilter = require("DataFilter");

	// 新建投票默认属性
	exports.defaultModel = function() {
		return {
			type: 'UGC',
			thumbnailUrl: "",
			name: "",
			terse: "",
			startDate: "",
			endDate: "",
			cycle: 1,
			tickets: "",
			sortType: "BY_TIME",
			state: "OPEN",
			repeatable: false,
			compulsory: false,
			permitAttentionComment: false,
			permitComment: false,
			compulsivelyBindPhoneNumber: true,
			compulsivelyInWechat: false
		}
	};

	function dataToModel(data) {
		var model = {
			sortType: data.sortType ? data.sortType : "BY_TIME",
			cycle: data.hasOwnProperty("cycle") ? data.cycle : 1 // 投票频率默认为1天
		};
		var strings = DataFilter.strings(["type", "name", "thumbnailUrl", "terse", "description", "state", "tickets", "startDate", "endDate"], data);
		var booleans = DataFilter.booleans(["repeatable", "compulsory", "permitAttentionComment", "permitComment", "compulsivelyBindPhoneNumber", "compulsivelyInWechat","isHistory"], data);

		return $.extend(model, strings, booleans);
	}

	function modelToData(model) {
		var data = {};
		$(["type", "name", "thumbnailUrl", "terse", "description", "repeatable", "compulsory", "startDate", "endDate", "sortType", "permitComment", "permitAttentionComment", "compulsivelyBindPhoneNumber", "compulsivelyInWechat"]).each(function(idx, field) {
			data[field] = model[field];
		});
		data.tickets = +model.tickets;
		if (model.cycle != "") data.cycle = +model.cycle;
		return data;
	};

	function validate(model) {
		var fields = [{
			field: "thumbnailUrl",
			message: "海报不能为空"
		}, {
			field: "name",
			message: "投票名称不能为空"
		}, {
			field: "terse",
			message: "投票简介不能为空"
		}, {
			field: "startDate",
			message: "投票开始时间不能为空"
		}, {
			field: "endDate",
			message: "投票结束时间不能为空"
		}];
		var messages = [];
		for (var i = 0; i < fields.length; i++) {
			var item = fields[i];
			if (Helper.validation.isEmptyNull(model[item.field])) {
				messages.push(item.message);
			}
		}
		return messages;
	};

	function checkAdjusted(model, modelClone) {
		return checkAdjustedFields(model, modelClone).length > 0;
	};

	function checkAdjustedFields(model, modelClone) {
		var adjustedFields = [];
		var fields = [{
			field: "name",
			name: "投票名称"
		}, {
			field: "thumbnailUrl",
			name: "投票海报"
		}, {
			field: "terse",
			name: "投票简介"
		}, {
			field: "startDate",
			name: "投票开始时间"
		}, {
			field: "endDate",
			name: "投票结束时间"
		}, {
			field: "description",
			name: "投票详情"
		}, {
			field: "permitAttentionComment",
			name: "是否关注后投票"
		}, {
			field: "permitComment",
			name: "允许投票评论"
		},{
			field: "compulsivelyBindPhoneNumber",
			name: "是否需要投票人员绑定手机号码"
		}, {
			field: "compulsivelyInWechat",
			name: "是否只能在微信浏览器中打开"
		}];
		$(fields).each(function(idx, item) {
			if (model[item.field] != modelClone[item.field]) {
				adjustedFields.push(item.name);
			}
		});
		return adjustedFields;
	};

	exports.dataToModel = dataToModel;
	exports.modelToData = modelToData;
	exports.validate = validate;
	exports.checkAdjusted = checkAdjusted;
	exports.checkAdjustedFields = checkAdjustedFields;
});