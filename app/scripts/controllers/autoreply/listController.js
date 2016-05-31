define(function(require, exports, module) {
	var baseController = require('baseController');
	var template = require('template');
	var bC = new baseController();
	var AutoreplyService = require('AutoreplyService');
	var OrganizationService = require('OrganizationService');
	var Helper = require("helper");
	var Pagination = require('lib.Pagination');

	var orgId, limit, replyType, page;

	var CurrentMessageType;

	var MessageTypes = [{
		type: 'ALL',
		value: '全部'
	}, {
		type: 'RELATION',
		value: '高级回复'
	}, {
		type: 'TEXT',
		value: '文字回复'
	}, {
		type: 'PICTURE',
		value: '图片回复'
	}, {
		type: 'SINGLE_ARTICLE',
		value: '单图文回复'
	}, {
		type: 'MULTIPLE_ARTICLE',
		value: '多图文回复'
	}];

	var Controller = function() {
		var controller = this;
		controller.namespace = "autoreply.list";
		controller.actions = {
			remove: function() {
				var _btn = this;
				var replyId = _btn.attr("data-value");

				Helper.confirm("确定删除该回复？", {}, function() {
					Helper.begin(_btn);
					AutoreplyService.remove(replyId).done(function(data) {
						Helper.successToast("删除成功");
						controller.render();
					}).fail(function(error) {
						Helper.alert(error);
					}).always(function() {
						Helper.end(_btn);
					});
				});
			},
			switchMessageType: function() {
				var _btn = this;
				var type = _btn.attr("data-value");
				page = 1;

				CurrentMessageType = MessageTypes.objOfAttr("type", type);
				Application.loader.begin();
				controller.render();
			},
			activate: function() {
				var _btn = this;
				var replyId = _btn.attr("data-value");

				AutoreplyService.activate(replyId).done(function(data) {
					Helper.successToast("启用成功");
					controller.render();
				}).fail(function(error) {
					Helper.errorToast(error);
				});
			}
		}
	};

	bC.extend(Controller);
	Controller.prototype.init = function() {
		orgId = Application.organization.id;
		replyType = Helper.param.hash('replyType');
		page = +Helper.param.search('page') || 1;
		limit = +Helper.param.search('limit') || 10;
		CurrentMessageType = MessageTypes[0];

		this.render(true);
	};

	Controller.prototype.render = function(isInit) {
		var controller = this;
		var templateUrl = controller.templateUrl;
		var callback = controller.callback;

		var skip = (page - 1) * limit;
		Application.organization.getWechat().done(function() {
			var wechat = Application.organization.wechat;
			var publicId = wechat ? wechat.id : "";
			if (!publicId) {
				Helper.confirm("您的组织还未绑定微信公众号，暂不能使用该功能！", {
					yesText: "立即绑定"
				}, function() {
					Helper.go("wechat/info");
				});
				Helper.execute(callback);
				return;
			};

			// 首次加载
			if (isInit && !wechat.scopeCategories.objOfAttr("id", 1)) {
				var message = "<p style='margin-bottom:10px;text-align:left;'>未获得【消息与菜单】相关功能权限！</p>";
				message += "<p style='text-align:left;line-height:20px;'>消息与菜单功能只能授权给一个第三方平台，如果想在校校平台使用【消息与菜单】功能，请到【微信公众平台】取消授权占用【消息与菜单】权限的第三方平台和校校，并重新授权给校校。</p>";
				Helper.alert(message);
			}

			var params = {
				replyType: replyType,
				skip: skip,
				limit: limit
			}
			if (CurrentMessageType.type != 'ALL') {
				params.messageType = CurrentMessageType.type;
			};

			AutoreplyService.getList(publicId, params).done(function(data) {
				var total = data.result.total;
				var replies = data.result.data;

				if (replyType == 'KEYWORD') {
					replies = trimKeywords(replies);
				};

				Helper.globalRender(template(templateUrl, {
					publicId: publicId,
					replyType: replyType,
					replies: replies,
					count: total,
					messageTypes: MessageTypes,
					curMessageType: CurrentMessageType,
					pagination: Helper.pagination(total, limit, page)
				}));

				Pagination(total, limit, page, {
					switchPage: function(pageIndex) {
						page = pageIndex;
						Application.loader.begin();
						controller.render(function() {
							Application.loader.end();
						});
					}
				});

			}).fail(function(error) {
				Helper.alert(error);
			}).always(function() {
				Helper.execute(callback);
			});
		}).fail(function(error) {
			Helper.alert(error);
			Helper.execute(callback);
		});
	}

	// 处理关键词数据
	function trimKeywords(replies) {
		$.each(replies, function(idx, reply) {
			var keywords = [];
			$.each(reply.keywords, function(k_idx, item) {
				keywords.push(item.keyWord);
				reply.matchType = item.matchType;
			});
			reply.keyWord = '<span class="keyword">' + keywords.join('</span>、<span class="keyword">') + '</span>';
		});

		return replies;
	};

	module.exports = Controller;
});