define(function(require, exports, module) {

	var baseController = require('baseController');
	var bC = new baseController();
	var MXZService = require('MXZService');
	var OrganizationService = require('OrganizationService');
	var template = require('template');
	var Helper = require("helper");

	var orgId;

	var controller = function() {
		var _controller = this;
		_controller.namespace = "timetable.edit";
		_controller.actions = {
			addSchools: function() {
				require.async('scripts/lib/MXZSchoolSelector', function(MXZSchoolSelector) {
					MXZSchoolSelector(_controller.schools, {
						save: function() {
							renderSchools(_controller);
						}
					});
				});
			},
			removeSchool: function() {
				var _btn = this,
					schoolId = _btn.attr("data-value");

				MXZService.school.remove(orgId, schoolId).done(function(data) {
					var index = _controller.schools.indexOfAttr('id', schoolId);
					_controller.schools.splice(index, 1);
					_btn.parents(".xx-tag-wrapper").remove();

				}).fail(function(error) {
					Helper.errorToast(error);
				});
			}
		}
	};

	bC.extend(controller);
	controller.prototype.init = function(templateName, callback) {
		this.callback = callback;
		this.templateName = templateName;
		orgId = App.organization.info.id;

		this.render();
	};

	controller.prototype.render = function() {
		var controller = this;
		var templateName = controller.templateName;
		var callback = controller.callback;

		Helper.globalRender(template(templateName, {
			frontRoot: Helper.config.pages.frontRoot,
			orgId: App.organization.id
		}));
		renderSchools(controller);

		Helper.execute(callback);
	};

	function renderSchools(controller) {
		App.organization.getRelatedMXZSchools(true).done(function() {
			controller.schools = App.organization.relatedMXZSchools;
			$(".timetable-edit .schools-container").html(template('app/templates/mengxiaozhu/edit-schools', {
				schools: controller.schools
			}));
		}).fail(function(error) {
			Helper.alert(error);
		});
	}

	module.exports = controller;

});