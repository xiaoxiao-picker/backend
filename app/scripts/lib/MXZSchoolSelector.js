/**
 *	萌小助－学校选择器
 */
define(function(require, exports, module) {
	var MXZService = require('MXZService');
	var Helper = require("helper");
	var template = require("template");

	var boxTemp = "app/templates/public/mxz-school-selector/box";
	var schoolsTemp = "app/templates/public/mxz-school-selector/schools";

	var orgId = App.organization.info.id;

	var Selector = function(schools, options) {
		options = $.extend({
			title: '选择学校'
		}, options);

		CurrentSchools = schools;
		var modal = Helper.modal(options);
		render(modal);
		return modal;
	};

	function render(selector) {
		var schoolName = '上海';
		selector.html(template(boxTemp, {
			searchText: schoolName
		}));

		addActions(selector);
		getSchools(selector, schoolName);
	};

	function getSchools(selector, schoolName) {
		selector.box.find("#SchoolsBox").html(template('app/templates/partial/loading', {}));

		selector.state = 'loading';
		MXZService.school.getAllList().done(function(data) {
			selector.schools = makeSchools(data.result);
			renderSchools(selector, schoolName);
		}).fail(function(error) {
			Helper.alert(error);
		}).always(function() {
			selector.state = 'complete';
		});
	}

	function makeSchools(schools) {

		var resultSchools = [];
		$.each(schools, function(idx, school) {
			var repeat = false;
			$.each(CurrentSchools, function(idx_c, currentSchool) {
				if (school.id == currentSchool.id) {
					repeat = true;
					return false;
				};
			});
			if (!repeat) {
				resultSchools.push(school);
			};
		});

		return resultSchools;
	}

	function renderSchools(selector, schoolName) {
		var schools = $.grep(selector.schools, function(school, idx) {
			return school.name.indexOf(schoolName) > -1;
		});

		selector.box.find("#SchoolsBox").html(template(schoolsTemp, {
			schools: schools
		}));
	};

	function addActions(selector) {
		//搜索学校 事件监听
		selector.addAction("input[type=search]", "keyup", function() {
			var _input = $(this);
			var searchText = _input.val();

			if (selector.state == 'loading') return;

			renderSchools(selector, searchText);
		}, false);

		selector.addAction(".btn-save", "click", function() {
			var _btn = $(this);

			var selectSchools = [];
			$("input[name=school]:checked").each(function(idx, item) {
				var school_id = $(item).attr("data-id");
				var school_name = $(item).attr("data-name");
				selectSchools.push({
					id: school_id,
					name: school_name
				});
			});

			if (!selectSchools.length) {
				Helper.errorToast('请至少选择一个学校');
				return;
			};

			Helper.begin(_btn);
			MXZService.school.add(orgId, selectSchools).done(function(data) {
				selector.close();
				selector.options.save && $.isFunction(selector.options.save) && selector.options.save.call(selector, {});
			}).fail(function(error) {
				Helper.errorToast(error);
			}).always(function() {
				Helper.end(_btn);
			});

		});
	};

	module.exports = function(schools, options) {
		new Selector(schools, options);
	};
});