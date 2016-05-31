define(function(require, exports, module) {
	var Helper = require("helper");
	var baseController = require('baseController');
	var bC = new baseController();
	var QuestionnaireService = require('QuestionnaireService');
	var template = require('template');
	var FormModel = require("FormModel");
	var REQUIREINFO = require("requireUserInfo");
	var Pagination = require('lib.Pagination');

	var tmp, orgId, questionnaireId, session;
	var page, limit;
	var Questionnaire;
	var Users;
	var ActiveUserId;

	var controller = function() {
		var _controller = this;
		_controller.namespace = "questionnaire.info";
		_controller.actions = {
			// 查看回复
			checkReply: function() {
				this.parents("li").addClass("actived").siblings("li").removeClass("actived");
				var userId = this.attr("data-value");
				if (userId == ActiveUserId) {
					return;
				}
				ActiveUserId = userId;
				renderReplyInfo();
			}
		};
	};

	bC.extend(controller);
	controller.prototype.init = function(templateName, fn) {
		tmp = templateName;
		orgId = App.organization.info.id;
		session = App.getSession();

		ActiveUserId = 0;
		Questionnaire = null;
		Users = [];

		page = +Helper.param.search('page') || 1;
		limit = +Helper.param.search('limit') || 10;
		questionnaireId = Helper.param.hash("questionnaireId");
		if (!questionnaireId) {
			Helper.alert("参数不足！");
			return;
		}
		render(fn);
	};

	function render(callback) {
		var skip = (page - 1) * limit;
		QuestionnaireService.get(questionnaireId).done(function(data) {
			Questionnaire = dataToQuestionnaire(data.result);
			Helper.globalRender(template(tmp, {
				questionnaire: Questionnaire
			}));
			renderUsers(function(total) {
				Pagination(total, limit, page, {
					container: $('.users-box .footer'),
					theme: 'SIMPLE',
					switchPage: function(pageIndex) {
						page = pageIndex;
						renderUsers();
					}
				});
			});
		}).fail(function(error) {
			Helper.alert(error);
		}).always(function() {
			Helper.execute(callback);
		});
	};

	function renderUsers(success) {
		var skip = (page - 1) * limit;
		$("#QuestionnaireReplyUsers .user-list").html(template("app/templates/partial/loading", {}));
		QuestionnaireService.reply.getList(questionnaireId, skip, limit).done(function(data) {
			var total = data.result.total;
			Users = data.result.data;
			$("#QuestionnaireReplyUsers .user-list").html(template("app/templates/questionnaire/info/users", {
				questionnaire: Questionnaire,
				users: Users
			}));
			$('#Total').text(total);
			if (Users.length > 0) {
				ActiveUserId = Users[0].id;
				renderReplyInfo();
			}

			Helper.execute(success, total);
		}).fail(function(error) {
			Helper.alert(error);
		});
	};

	function renderReplyInfo() {
		$("#QuestionnaireReplyInfo").html(template("app/templates/partial/loading", {}));
		QuestionnaireService.reply.get(questionnaireId, ActiveUserId).done(function(data) {
			makeQuestionnaireAnswer(data.result.userTexts || [], data.result.userDates || [], data.result.userImages || [], data.result.userOptions || []);
			$("#QuestionnaireReplyInfo").html(template("app/templates/questionnaire/info/detail", {
				subjects: Questionnaire.forms
			}));
		}).fail(function(error) {
			$("#QuestionnaireReplyInfo").html(error);
			Helper.alert(error);
		});
	};



	// 将问卷数据转化成数据模型
	function dataToQuestionnaire(questionnaireData) {
		return {
			title: questionnaireData.title,
			thumbnail: questionnaireData.thumbnail,
			terse: questionnaireData.terse,
			text: questionnaireData.text,
			state: questionnaireData.state,
			forms: makeForms(questionnaireData.register||{})
		};

		function makeForms(forms) {
			var texts = forms.texts ? forms.texts : [];
			var dates = forms.dates ? forms.dates : [];
			var images = forms.images ? forms.images : [];
			var choices = forms.choices ? forms.choices : [];

			var forms = [];
			$.each(REQUIREINFO.makeElseInfo(texts, dates, choices, images), function(idx, form) {
				forms.push(new FormModel(form.id, form.title, form.type, form.required, form.options));
			});
			return forms;
		};
	};

	// 将问卷数据转化成数据模型
	function makeQuestionnaireAnswer(texts, dates, images, selectedOptions) {
		$(Questionnaire.forms).each(function(idx, form) {
			var formId = form.id;
			if (form.type == "TEXT" || form.type == "TEXTAREA") {
				$(texts).each(function(idx2, item) {
					if (formId == item.textId) {
						form.value = item.value;
						return false;
					}
				});
			} else if (form.type == "DATE") {
				$(dates).each(function(idx2, item) {
					if (formId == item.dateId) {
						form.value = item.value ? Helper.makedate(item.value, "yyyy-MM-dd hh:mm") : "";
						return false;
					}
				});
			} else if (form.type == "IMAGE") {
				$(images).each(function(idx2, item) {
					if (formId == item.imageId) {
						form.value = item.value.split(',') || [];
						return false;
					}
				});
			} else if (form.type == "RADIO" || form.type == "CHECKBOX") {
				var selectedIds = [];
				$(selectedOptions).each(function(idx2, item) {
					selectedIds.push(item.optionId);
				});
				$(form.options).each(function(idx2, item) {
					item.selected = selectedIds.indexOf(item.id) == -1 ? false : true;
				});
			}
		});
	};

	module.exports = controller;
});