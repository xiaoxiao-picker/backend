define(function(require, exports, module) {
	// 报名所需信息处理函数库
	var REQUIREINFO = require("requireUserInfo");

	// 数据转化为模型
	function dataToModel(eventVo, requiredVo) {
		eventVo = eventVo || {};
		requiredVo = requiredVo || {};
		var model = {};

		var keys = ["id", "name", "thumbnailUrl", "address", "terse", "detail", "startDate", "endDate", "allowToSignUp", "showNumberOfSignUp", "compulsivelyBindPhoneNumber", "permitComment", "state"];
		$(keys).each(function(idx, item) {
			model[item] = eventVo.hasOwnProperty(item) ? eventVo[item] : "";
		});
		model['category.id'] = eventVo.category ? eventVo.category.id : "";

		var texts = requiredVo.texts ? requiredVo.texts : [];
		var dates = requiredVo.dates ? requiredVo.dates : [];
		var images = requiredVo.images ? requiredVo.images : [];
		var choices = requiredVo.choices ? requiredVo.choices : [];
		model.requireId = requiredVo.id || "";
		model.requireBaseInfos = REQUIREINFO.makeBaseInfo(texts, dates, choices);
		model.requireElseInfos = REQUIREINFO.makeElseInfo(texts, dates, choices, images);

		return model;
	};

	// 模型转换为提交数据
	function modelToData(eventInfo) {
		var data = {};
		// 活动信息
		var keys = ["name", "thumbnailUrl", "address", "terse", "detail", "category.id", "allowToSignUp", "permitComment", "showNumberOfSignUp", "compulsivelyBindPhoneNumber", "state"];
		$(keys).each(function(idx, item) {
			data[item] = eventInfo.hasOwnProperty(item) ? eventInfo[item] : "";
		});
		data["startDate"] = eventInfo.startDate ? new Date(eventInfo.startDate).getTime() : "";
		data["endDate"] = eventInfo.endDate ? new Date(eventInfo.endDate).getTime() : "";

		// 自定义信息
		var elseInfoData = REQUIREINFO.getRequireInfo(eventInfo.requireBaseInfos, eventInfo.requireElseInfos, eventInfo.requireId);
		data.registerJson = JSON.stringify(elseInfoData);

		return data;
	};

	// 保存时验证活动信息模型
	function validate(eventInfo) {
		var fields = [{
			field: "name",
			message: "活动名称不能为空"
		}, {
			field: "thumbnailUrl",
			message: "活动海报不能为空"
		}, {
			field: "address",
			message: "活动地点不能为空"
		}, {
			field: "terse",
			message: "活动简介不能为空"
		}, {
			field: "startDate",
			message: "活动开始时间不能为空"
		}, {
			field: "endDate",
			message: "活动结束时间不能为空"
		}, {
			field: "detail",
			message: "活动详情不能为空"
		}];
		var messages = [];
		for (var i = 0; i < fields.length; i++) {
			var item = fields[i];
			if (Helper.validation.isEmptyNull(eventInfo[item.field])) {
				messages.push(item.message);
			}
		}
		return messages;
	};

	// 判断活动信息是否修改
	function checkAdjusted(model, modelClone) {
		var adjusted = getAdjustedFields(model, modelClone).length > 0;
		return adjusted;
	};

	// 获取活动信息修改了的字段
	function getAdjustedFields(model, modelClone) {
		var adjustedFields = [];
		var fields = [{
			field: "name",
			name: "活动名称"
		}, {
			field: "thumbnailUrl",
			name: "活动海报"
		}, {
			field: "address",
			name: "活动地点"
		}, {
			field: "terse",
			name: "活动简介"
		}, {
			field: "startDate",
			name: "活动开始时间"
		}, {
			field: "endDate",
			name: "活动结束时间"
		}, {
			field: "detail",
			name: "活动详情"
		}, {
			field: "signupStartDate",
			name: "活动报名开始时间"
		}, {
			field: "signupEndDate",
			name: "活动报名结束时间"
		}, {
			field: "showNumberOfSignUp",
			name: "是否显示报名人数"
		}, {
			field: "compulsivelyBindPhoneNumber",
			name: "是否需要报名用户绑定手机号码"
		}, {
			field: "permitComment",
			name: "是否开启评论"
		}, {
			field: "allowToSignUp",
			name: "是否开启线上报名"
		}, {
			field: "onlyAllowMembersToSignUp",
			name: "仅允许组织成员报名"
		}, {
			field: "category.id",
			name: "活动分类"
		}, {
			field: "state",
			name: "活动状态"
		}, {
			field: "upperLimit",
			name: "报名总人数"
		}];

		$(fields).each(function(idx, item) {
			if (model[item.field] != modelClone[item.field]) {
				adjustedFields.push(item.name);
			}
		});

		if (JSON.stringify(REQUIREINFO.getRequireInfo(model.requireBaseInfos, model.requireElseInfos)) != JSON.stringify(REQUIREINFO.getRequireInfo(model.requireBaseInfos, modelClone.requireElseInfos)))
			adjustedFields.push("报名所需资料");

		return adjustedFields;
	};

	exports.dataToModel = dataToModel;
	exports.modelToData = modelToData;
	exports.validate = validate;
	exports.checkAdjusted = checkAdjusted;
	exports.getAdjustedFields = getAdjustedFields;

});