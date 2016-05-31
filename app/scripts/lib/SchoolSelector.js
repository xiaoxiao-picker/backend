/**
 *	学校选择器
 */
define(function(require, exports, module) {
	var PublicService = require('PublicService');
	var Helper = require("helper");
	var template = require("template");

	var provinces = require("scripts/config/province");

	var boxTemp = "app/templates/public/school-selector/box";
	var schoolsTemp = "app/templates/public/school-selector/schools";
	var searchTemp = "app/templates/public/school-selector/search-results";

	var SchoolSelector = function(options) {
		options = $.extend({
			title: '选择学校',
			isSearch: false, //是否为搜索选项（用于搜索组织）
			select: function() {} //选中学校回调事件
		}, options);

		var modal = Helper.modal(options);
		render(modal);
		return modal;
	};

	function render(selector) {
		selector.html(template(boxTemp, {
			provinces: provinces
		}));
		addActions(selector);
		renderSchools(selector, provinces[0]);
	};

	function renderSchools(selector, province) {
		PublicService.getSchools(province, -1, -1).done(function(data) {
			var schools = data.result;
			selector.box.find("#SchoolsBox").html(template(schoolsTemp, {
				schools: schools
			}));
		}).fail(function(error) {
			Helper.alert(error);
		});
	};

	function addActions(selector) {
		//搜索学校 事件监听

		var SEARCH;
		selector.addAction("#SearchInput", "keyup", function() {
			var _input = $(this);
			var searchText = _input.val();

			if (searchText.length == 0) {
				selector.box.find("#SearchResults").addClass('hide');
				return;
			}
			clearTimeout(SEARCH);
			SEARCH = setTimeout(function() {
				PublicService.searchSchool(searchText).done(function(data) {
					var searchResults = data.result;
					if (searchResults.length == 0) {
						selector.box.find("#SearchResults").addClass('hide');
						return;
					}
					selector.box.find("#SearchResults").removeClass('hide');
					selector.box.find("#SearchResults").html(template(searchTemp, {
						searchResults: searchResults
					}));

				}).fail(function(error) {
					Helper.alert(error);
				});
			}, 500);
		}, false);

		//切换省份 事件监听
		selector.addAction("#ProvinceContainer", "change", function() {
			var _select = $(this);
			var province = _select.val();

			renderSchools(selector, province);
		});

		//选中对应学校 事件监听
		selector.addAction(".school", "click", function(evt) {
			var _btn = $(this);
			var schoolName = _btn.attr("data-value");
			var schoolId = _btn.attr("data-schoolId");

			selector.options.select && $.isFunction(selector.options.select) && selector.options.select.call(selector, {
				name: schoolName,
				id: schoolId
			});
		});
	};

	module.exports = SchoolSelector;
});