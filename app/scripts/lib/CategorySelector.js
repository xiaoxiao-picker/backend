define(function(require, exports, module) {
	var Helper = require("helper");
	var template = require("template");

	var selectors = [];

	var categoryTypes = {
		EVENT: ["getEventCategories", "eventCategories"],
		ARTICLE: ["getArticleCategories", "articleCategories"],
		PROPOSAL: ["getProposalCategories", "proposalCategories"]
	};

	var Selector = function(categoryType, options) {
		options = $.extend({
			container: $("#content")
		}, options);
		// 销毁其他
		$(selectors).each(function(idx, item) {
			item.destroy();
		});

		var selector = this;
		var box = this.box = $(template("app/templates/public/category-selector/box", {
			top: options.top,
			left: options.left,
			zIndex: options.zIndex
		}));
		box.appendTo(options.container);

		var categoryTypeAttrs = categoryTypes[categoryType];
		Application.organization[categoryTypeAttrs[0]]().done(function() {
			var categories = Application.organization[categoryTypeAttrs[1]].clone();
			categories.splice(0, 0, {
				id: "",
				name: "全部分类"
			});
			box.find("ul").html(template("app/templates/public/category-selector/option", {
				categories: categories
			}));
			box.on("click", "li.category", function() {
				var categoryId = $(this).attr("data-category-id");
				var category = categories.objOfAttr("id", categoryId);

				options.select && $.isFunction(options.select) && options.select.call(selector, category);
			});
		}).fail(function(error) {
			Helper.alert(error);
			selector.destroy();
		});

		selectors.push(selector);
	};

	Selector.prototype.destroy = function() {
		selectors.remove(this);
		this.box.remove();
	};


	module.exports = function(categoryType, options) {
		return new Selector(categoryType, options);
	};
});