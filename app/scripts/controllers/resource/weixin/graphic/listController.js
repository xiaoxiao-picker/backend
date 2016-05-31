define(function(require, exports, module) {
	var baseController = require('baseController');
	var bC = new baseController();
	var template = require('template');
	var Helper = require("helper");

	var Pagination = require('lib.Pagination');

	var WechatResourceService = require("WechatResourceService");

	var page, limit = 10;
	var organizationId = Application.organization.id;

	template.helper("thumbMedia", function(thumbMediaId) {
		return "";
	});

	var Controller = function() {
		var controller = this;
		controller.namespace = "resource.weixin.graphic";
		controller.actions = {
			// 同步微信素材
			update: function() {
				var $btn = this;
				Helper.begin($btn);
				WechatResourceService.graphic.synchronize(organizationId).done(function(data) {
					skip = 0;
					Application.loader.begin();
					controller.render(Application.loader.end);
				}).fail(function(error) {
					Helper.alert(error);
				}).always(function() {
					Helper.end($btn);
				});
			},
			remove: function() {
				var $btn = this;
				var resourceId = $btn.attr("data-resource-id");
				Helper.confirm("删除后该图文也将在微信后台删除，仍确定删除？", function() {
					Helper.begin($btn);
					WechatResourceService.graphic.remove(resourceId).done(function(data) {
						$btn.parents(".resource-wrap").animate({
							opacity: 0
						}, 200, function() {
							$(this).remove();
						});
					}).fail(function(error) {
						Helper.alert(error);
					}).always(function() {
						Helper.end($btn);
					});
				});
			},
			edit:function(){
				Helper.alert("图文消息编辑功能暂不开放，如需修改请前往微信后台进行操作！");
			}
		};
	};

	bC.extend(Controller);
	Controller.prototype.init = function() {
		Helper.globalRender(template('app/templates/resource/weixin/graphic/list', {}));
		page = 1;
		this.render();
	};
	Controller.prototype.render = function(callback) {
		var controller = this;
		callback || (callback = this.callback);
		var skip = (page - 1) * limit;
		WechatResourceService.graphic.getList(organizationId, skip, limit).done(function(data) {
			var resources = controller.resources = data.result.data;
			var total = controller.total = data.result.total;
			$(".resource-weixin-graphic-content .panel-body").html(template("app/templates/resource/weixin/graphic/options", {
				resources: resources
			}));

			$("#TotalCount").text(total);

			// 如果图文素材为空则提示为空
			if (resources.length == 0) {
				$(".resource-weixin-graphic-content .panel-body").html(template("app/templates/resource/weixin/graphic/empty", {}));
			}
			Pagination(total, limit, page, {
				switchPage: function(pageIndex) {
					page = pageIndex;
					Application.loader.begin();
					controller.render(Application.loader.end);
				}
			});
		}).fail(function(error) {
			Helper.alert(error);
		}).always(function() {
			Helper.execute(callback);
		});
	};


	module.exports = Controller;

});