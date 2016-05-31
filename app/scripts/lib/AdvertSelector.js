/**
 *	广告分类选择器
 */
define(function(require, exports, module) {
	var AdvertisementService = require("AdvertisementService");
	var Helper = require("helper");
	var template = require("template");

	var boxTemp = "app/templates/public/advert-selector/box";
	var selectorTemp = "app/templates/public/advert-selector/selector";
	var advertsTemp = "app/templates/public/advert-selector/adverts";

	var orgId = App.organization.info.id;

	var AdvertSelector = function(options) {
		this.options = $.extend({
			className: 'advert-selector width-640',
			advertId: 0,
			classes: "",
			sourceId: 0,
			sourceType: "EVENT",
			select: function(value) {
				$("#AdvertText").text(value);
				$("#TextContainer").removeClass('hide');
			},
			remove: function(value) {
				$("#AdvertText").text(value);
				$("#TextContainer").addClass('hide');
			},
			save: function(value) {},
			cancel: function() {}
		}, options);

		var modal = Helper.modal(this.options);
		render(modal);

		return modal;
	};

	function render(selector) {

		selector.html(template(boxTemp, {
			advertText: selector.options.classes
		}));

		addListener(selector);
		renderClasses(selector, '');
		renderHot(selector);
	}

	/**
	 *	搜索分类
	 */
	function renderClasses(selector, value) {
		AdvertisementService.classes(value).done(function(data) {
			$("#AdvertOptions").html(template(advertsTemp, {
				adverts: data.result
			}));
		}).fail(function(error) {
			Helper.alert(error);
		});
	}

	/**
	 *	热门分类
	 */
	function renderHot(selector) {
		AdvertisementService.classesForHot(5).done(function(data) {
			$("#HotAdverts").html(template(advertsTemp, {
				adverts: data.result
			}));
		}).fail(function(error) {
			Helper.alert(error);
		});
	}

	function addListener(selector) {

		//选中广告
		selector.addAction(".option", "click", function() {
			var _option = this;

			selector.options.classes = $(_option).attr("data-name");
			selector.options.select && $.isFunction(selector.options.select) && selector.options.select.call(selector, selector.options.classes);
		});

		//删除选择的广告
		selector.addAction(".advert-del", "click", function() {
			selector.options.classes = "";
			selector.options.remove && $.isFunction(selector.options.remove) && selector.options.remove.call(selector, "");
		});

		//搜索广告
		selector.addAction("#SearchAdvert", "change", function() {
			renderClasses(selector, $(this).val());
		});
		selector.addAction("#SearchAdvert", "keyup", function() {
			renderClasses(selector, $(this).val());
		});

		//保存
		selector.addAction("#SaveBtn", "click", function() {
			var _btn = this;

			if (!selector.options.classes.length) {
				Helper.errorToast("请选择广告分类");
				return;
			};

			Helper.begin($(_btn));

			var action = selector.options.advertId ? "update" : "add";
			AdvertisementService[action]({
				organizationId: orgId,
				advertisementId: selector.options.advertId,
				sourceId: selector.options.sourceId,
				sourceType: selector.options.sourceType,
				classes: selector.options.classes
			}).done(function(data) {
				Helper.successToast("添加广告成功");
				selector.destroy();
				selector.options.save && $.isFunction(selector.options.save) && selector.options.save.call(selector, selector.options.classes);
			}).fail(function(error) {
				Helper.alert(error);
			}).always(function() {
				Helper.end($(_btn));
			});

		});

		//取消
		selector.addAction("#CancelBtn", "click", function() {
			selector.destroy();
			selector.options.cancel && $.isFunction(selector.options.cancel) && selector.options.cancel.call(selector);
		});
	}

	function preventDefault(event) {
		event = event || window.event;
		if (event.preventDefault)
			event.preventDefault();
		else
			event.returnValue = false;
	};

	module.exports = function(options) {
		return new AdvertSelector(options);
	};
});
