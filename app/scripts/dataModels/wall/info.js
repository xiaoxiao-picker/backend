define(function(require, exports, module) {
	// 报名所需信息处理函数库
	var REQUIREINFO = require("requireUserInfo");

	// 数据转化为模型
	function dataToModel(dataWall) {
		var model = {};
		$(["title", "startDate", "endDate", "themeCode", "notice", "sponsor", "wallState", "needCheck", "compulsivelyBindPhoneNumber"]).each(function(idx, item) {
			model[item] = dataWall[item];
		});
		model.themeData = $.parseJSON(dataWall.themeData || "{}");
		return model;
	};

	// 模型转换为提交数据
	function modelToData(WallInfo) {
		var data = {};
		$(["title", "themeCode", "notice", "sponsor", "wallState", "needCheck", "compulsivelyBindPhoneNumber"]).each(function(idx, item) {
			data[item] = WallInfo[item];
		});
		data.startDate = WallInfo.startDate ? new Date(WallInfo.startDate).getTime() : "";
		data.endDate = WallInfo.endDate ? new Date(WallInfo.endDate).getTime() : "";
		data.themeData = JSON.stringify(WallInfo.themeData);
		return data;
	};

	// 保存时验证活动信息模型
	function validate(wall) {
		var fields = [{
			field: "title",
			message: "请填写上墙标题！"
		}, {
			field: "startDate",
			message: "请选择上墙开始时间！"
		}, {
			field: "endDate",
			message: "请填写上墙结束时间！"
		}, {
			field: "themeCode",
			message: "请选择上墙主题！"
		}];
		var messages = [];
		for (var i = 0; i < fields.length; i++) {
			var item = fields[i];
			if (Helper.validation.isEmptyNull(wall[item.field])) {
				messages.push(item.message);
			}
		}
		if (wall.themeCode == "CUSTOM" && !wall.themeData.backgroundImageUrl) {
			messages.push("自定义主要尚未编辑完成，不得使用该主题！");
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
			field: "title",
			name: "上墙标题"
		}, {
			field: "startDate",
			name: "上墙开始时间"
		}, {
			field: "endDate",
			name: "上墙结束时间"
		}, {
			field: "themeCode",
			name: "上墙主题"
		}, {
			field: "notice",
			name: "上墙公告"
		}, {
			field: "sponsor",
			name: "赞助商海报"
		}];

		$(fields).each(function(idx, item) {
			if (model[item.field] != modelClone[item.field]) {
				adjustedFields.push(item.name);
			}
		});

		if (JSON.stringify(model.themeData) != JSON.stringify(modelClone.themeData))
			adjustedFields.push("自定义主题");

		return adjustedFields;
	};

	exports.dataToModel = dataToModel;
	exports.modelToData = modelToData;
	exports.validate = validate;
	exports.checkAdjusted = checkAdjusted;
	exports.getAdjustedFields = getAdjustedFields;

});