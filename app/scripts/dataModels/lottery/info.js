define(function(require, exports, module) {
    // 报名所需信息处理函数库
    var REQUIREINFO = require("requireUserInfo");

    exports.defaultModel = function() {
        return {
            forceAttention: false,
            frequency: 1
        }
    };

    // 数据转化为模型
    function dataToModel(lotteryVo, requiredVo) {
        lotteryVo = lotteryVo || {};
        requiredVo = requiredVo || {};
        var model = {};

        var keys = ["id", "name", "description", "startDate", "endDate", "frequency", "cycle", "forceAttention", "state", "thankYouText", "thankYouImageUrl", "contactMan", "contactPhoneNumber", "contactLocation"];
        $(keys).each(function(idx, item) {
            model[item] = lotteryVo.hasOwnProperty(item) ? lotteryVo[item] : "";
        });

        var texts = requiredVo.texts || [];
        var dates = requiredVo.dates || [];
        var images = requiredVo.images || [];
        var choices = requiredVo.choices || [];
        model.requireId = requiredVo.id || "";
        model.requireBaseInfos = REQUIREINFO.makeBaseInfo(texts, dates, choices);
        model.requireElseInfos = REQUIREINFO.makeElseInfo(texts, dates, choices, images);

        return model;
    };

    // 模型转换为提交数据
    function modelToData(lottery) {
        var data = {};
        var keys = ["id", "name", "description", "frequency", "cycle", "forceAttention", "state", "thankYouText", "thankYouImageUrl", "contactMan", "contactPhoneNumber", "contactLocation"];
        $(keys).each(function(idx, item) {
            data[item] = lottery.hasOwnProperty(item) ? lottery[item] : "";
        });
        data.startDate = lottery.startDate ? new Date(lottery.startDate).getTime() : "";
        data.endDate = lottery.endDate ? new Date(lottery.endDate).getTime() : "";

        // 自定义信息
        var elseInfoData = REQUIREINFO.getRequireInfo(lottery.requireBaseInfos, lottery.requireElseInfos, lottery.requireId);
        data.registerJson = JSON.stringify(elseInfoData);

        return data;
    };

    // 保存时验证信息模型
    function validate(lottery) {
        var fields = [{
            field: "name",
            message: "抽奖名称不能为空"
        }, {
            field: "description",
            message: "抽奖简介不能为空"
        }, {
            field: "startDate",
            message: "抽奖开始时间不能为空"
        }, {
            field: "endDate",
            message: "抽奖结束时间不能为空"
        }, {
            field: "frequency",
            message: "抽奖次数不能为空"
        }, {
            field: "cycle",
            message: "抽奖周期不能为空"
        }, {
            field: "contactMan",
            message: "联系人不能为空"
        }, {
            field: "contactPhoneNumber",
            message: "联系方式不能为空"
        }, {
            field: "contactLocation",
            message: "联系地址不能为空"
        }];
        var messages = [];
        for (var i = 0; i < fields.length; i++) {
            var item = fields[i];
            if (Helper.validation.isEmptyNull(lottery[item.field])) {
                messages.push(item.message);
            }
        }
        return messages;
    };

    // 判断信息是否修改
    function checkAdjusted(model, modelClone) {
        var adjusted = getAdjustedFields(model, modelClone).length > 0;
        return adjusted;
    };

    // 获取信息修改了的字段
    function getAdjustedFields(model, modelClone) {
        var adjustedFields = [];
        var fields = [{
            field: "name",
            message: "抽奖名称"
        }, {
            field: "description",
            message: "抽奖简介"
        }, {
            field: "startDate",
            message: "抽奖开始时间"
        }, {
            field: "endDate",
            message: "抽奖结束时间"
        }, {
            field: "frequency",
            message: "抽奖次数"
        }, {
            field: "cycle",
            message: "抽奖周期"
        }, {
            field: "contactMan",
            message: "联系人"
        }, {
            field: "contactPhoneNumber",
            message: "联系方式"
        }, {
            field: "contactLocation",
            message: "联系地址"
        }];

        $(fields).each(function(idx, item) {
            if (model[item.field] != modelClone[item.field]) {
                adjustedFields.push(item.name);
            }
        });

        if (JSON.stringify(REQUIREINFO.getRequireInfo(model.requireBaseInfos, model.requireElseInfos)) != JSON.stringify(REQUIREINFO.getRequireInfo(model.requireBaseInfos, modelClone.requireElseInfos)))
            adjustedFields.push("抽奖所需资料");

        return adjustedFields;
    };

    exports.dataToModel = dataToModel;
    exports.modelToData = modelToData;
    exports.validate = validate;
    exports.checkAdjusted = checkAdjusted;
    exports.getAdjustedFields = getAdjustedFields;

});
