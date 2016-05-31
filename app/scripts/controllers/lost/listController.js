define(function(require, exports, module) {
	require("plugins/swiper/swiper.css");

	var baseController = require('baseController');
	var bC = new baseController();
	var LostService = require('LostService');
	var template = require('template');
	var Helper = require("helper");
	var Pagination = require('lib.Pagination');

	var orgId = Application.organization.id;
	var limit, page, keyword;
	var Type;

	var Controller = function() {
		var controller = this;
		this.namespace = "lost.list";
		this.actions = {
			search: function() {
				var btn = this;
				keyword = btn.parents(".search-box").find(".keyword-name").val();
				Helper.begin(btn);
				page = 1;
				controller.render(function() {
					Helper.end(btn);
				});
			},
			remove: function() {
				var _btn = this,
					lostId = _btn.attr("data-value");
				Helper.confirm("确定删除此信息？", function() {
					Helper.begin(_btn);
					LostService.remove(lostId).done(function(data) {
						Helper.successToast("删除成功！");
						controller.render();
					}).fail(function(error) {
						Helper.alert(error);
					}).always(function() {
						Helper.end(_btn);
					});
				});
			},
			stick: function() {
				var _btn = this;
				var lostId = _btn.attr("data-value");
				var sticked = _btn.hasClass('sticked');

				Helper.confirm("确定" + (sticked ? "取消置顶" : "置顶") + "此信息？", function() {
					Helper.begin(_btn);
					LostService.stick[sticked ? 'remove' : 'add'](lostId).done(function(data) {
						Helper.successToast((sticked ? "取消置顶" : "置顶") + "成功！");
						controller.render();
					}).fail(function(error) {
						Helper.alert(error);
					}).always(function() {
						Helper.end(_btn);
					});
				});
			},
			showLostInfo: function() {
				var _btn = this,
					lostId = _btn.attr("data-value");

				var modal = showLostInfoModal(lostId);

				modal.addAction('.btn-change-status', 'click', function() {
					Helper.confirm("确定" + (Type == "LOST" ? "已归还失主" : "已找到失物") + "?", {}, function() {
						Helper.begin(_btn);
						LostService.changeStatus(lostId, true).done(function(data) {
							Helper.successToast("操作成功！");
							modal.close();
						}).fail(function(error) {
							Helper.alert(error);
						}).always(function() {
							Helper.end(_btn);
						});
					});
				});
			}
		};
	};

	bC.extend(Controller);
	Controller.prototype.init = function() {
		page = +Helper.param.search('page') || 1;
		limit = +Helper.param.search('limit') || 10;
		keyword = "";
		Type = Helper.param.search("type") || "LOST";
		this.render(this.callback);
	};


	// 渲染函数
	Controller.prototype.render = function(callback) {
		var controller = this;
		var skip = (page - 1) * limit;

		LostService.getList({
			organizationId: orgId,
			skip: skip,
			limit: limit,
			type: Type,
			keyword: keyword
		}).done(function(data) {
			var total = data.result.total;
			var losts = data.result.data;

			Helper.globalRender(template(controller.templateUrl, {
				type: Type,
				count: total,
				losts: losts,
				keyword: keyword,
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
	};

	/**	
	 *	显示详情
	 */
	function showLostInfoModal(lostId) {
		var modal = Helper.modal({
			className: 'lost-info-modal'
		});

		require.async("plugins/swiper/swiper", function() {

			LostService.get(orgId, lostId).done(function(data) {
				var lost = data.result;
				lost.picUrls = lost.picUrls ? lost.picUrls.split(',') : [];
				lost.contactInfo = $.parseJSON(lost.contactInfo);

				modal.html(template("app/templates/lost/info", {
					lost: lost
				}));

				new window.Swiper(".lost-images-box", {
					autoplay: 0,
					loop: false,

					// 如果需要分页器
					pagination: ".swiper-pagination",

					// 如果需要前进后退按钮
					nextButton: '.swiper-button-next',
					prevButton: '.swiper-button-prev',
					watchSlidesProgress: true,
					watchSlidesVisibility: true,
					// 初始索引
					initialSlide: 0
				});

			}).fail(function(error) {
				Helper.alert(error);
			});

		});

		return modal;
	}

	module.exports = Controller;
});