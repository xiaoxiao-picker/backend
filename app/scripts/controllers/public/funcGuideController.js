define(function(require, exports, module) {
	var baseController = require('baseController');
	var template = require('template');
	var bC = new baseController();
	var UserService = require('UserService');
	var Helper = require("helper");

	var ConfigFunc = require('config.func-guide');

	var pageIndex, sourceType;

	var Controller = function() {
		var controller = this;
		controller.namespace = "func.guide";
		controller.actions = {
			switchPage: function() {
				var _btn = this,
					type = _btn.attr("data-type");

				if (type == "left") {
					--pageIndex;
				} else {
					++pageIndex;
				}
				controller.render();
			}
		}
	};

	bC.extend(Controller);
	Controller.prototype.init = function() {
		sourceType = Helper.param.hash("sourceType");
		pageIndex = 1;
		this.render();
	};

	Controller.prototype.render = function() {
		var options = getFuncOptions(sourceType);

		Helper.globalRender(template(this.templateUrl, {
			options: options
		}));

		// updateUserInfo();
		Helper.execute(this.callback);
	};


	//更新用户配置
	function updateUserInfo() {
		var userInfo = App.userInfo;
		switch (sourceType) {
			case 'WECHAT':
				{
					if (userInfo.config.needWechatSettingGuide) {
						var userId = userInfo.id;
						UserService.updateUserConfig(userId, {
							needWechatSettingGuide: false
						}).done(function() {
							App.userInfo.config.needWechatSettingGuide = false;
						}).fail(function(error) {
							Helper.alert(error);
						});
					};
				}
				break;
			case 'FUNC':
				{
					if (userInfo.config.needFuncManageGuide) {
						var userId = userInfo.id;
						UserService.updateUserConfig(userId, {
							needFuncManageGuide: false
						}).done(function() {
							App.userInfo.config.needFuncManageGuide = false;
						}).fail(function(error) {
							Helper.alert(error);
						});
					};
				}
				break;
			case 'AUTOREPLY':
				{
					if (userInfo.config.needAutoReplyGuide) {
						var userId = userInfo.id;
						UserService.updateUserConfig(userId, {
							needAutoReplyGuide: false
						}).done(function() {
							App.userInfo.config.needAutoReplyGuide = false;
						}).fail(function(error) {
							Helper.alert(error);
						});
					}
				}
				break;
			case 'RESOURCE':
				{

				}
				break;
			case 'RELATION':
				{
					if (userInfo.config.needRelateOrgGuide) {
						var userId = userInfo.id;
						UserService.updateUserConfig(userId, {
							needRelateOrgGuide: false
						}).done(function() {
							App.userInfo.config.needRelateOrgGuide = false;
						}).fail(function(error) {
							Helper.alert(error);
						});
					}
				}
				break;
			case 'RESUME':
				{

				}
				break;
			case 'WALLET':
				{

				}
				break;
		}
	}


	function getFuncOptions(funcType) {
		switch (funcType) {
			case "WECHAT":
				return ConfigFunc.arrayWidthObjAttrs("code", ["WECHATBIND", "WECHATCUSTOM"]);
			case "AUTOREPLY":
				return ConfigFunc.arrayWidthObjAttrs("code", ["KEYWORDAUTOREPLY", "MESSAGEAUTOREPLY", "ATTENTIONAUTOREPLY"]);
			case "RESOURCE":
				return ConfigFunc.arrayWidthObjAttrs("code", ["RESOURCE"]);
			case "EVENT":
				return ConfigFunc.arrayWidthObjAttrs("code", ["EVENT", "TICKET"]);
			case "INTERACTION":
				return ConfigFunc.arrayWidthObjAttrs("code", ["WALL", "VOTE", "LOTTERY"]);
			case "MEMBER":
				return ConfigFunc.arrayWidthObjAttrs("code", ["MEMBER", "NOTICE", "RESUME"]);
			case "EXPAND":
				return ConfigFunc.arrayWidthObjAttrs("code", ["QUESTIONNAIRE", "ARTICLE", "PROPOSAL", "LOST", "DEPARTMENT", "PARTNER", "MENGXIAOZHU", "FUNCTIONLINK"]);
			case "FEEDBACK":
				return ConfigFunc.arrayWidthObjAttrs("code", ["FEEDBACK"]);
			default:
				return [];
		}
	}

	module.exports = Controller;
});