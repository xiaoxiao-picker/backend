/**
 *	申请加入组织成员查看
 */
define(function(require, exports, module) {
	var MemberApplyService = require('MemberApplyService');
	var Helper = require("helper");

	var template = require("template");
	template.helper("questionNameFilter", function(name) {
		return {
			"name": "姓名",
			"phoneNumber": "手机号码",
			"gender": "性别",
			"school": "学校",
			"studentId": "学号",
			"grade": "入学时间"
		}[name] || name;
	});

	var REQUIRE = require("requireUserInfo");

	var boxTemp = "app/templates/member/applicant";

	var orgId = App.organization.info.id;

	var Applicant = function(applyId, options) {
		options = $.extend({
			title: "成员申请资料",
			readonly: false,
			className: "user-modal"
		}, options);

		var modal = Helper.modal(options);
		modal.applyId = applyId;

		render(modal);
		addListener(modal);
	}

	function render(applicant) {
		MemberApplyService.get(orgId, applicant.applyId).done(function(data) {
			var user = data.result.user;
			// 题目
			var questions = data.result.resultJson ? (data.result.resultJson.register || {}) : {};
			// 答案
			var answers = data.result.resultJson.result;
			var fields = makeResult(questions, answers);

			applicant.user = user;
			applicant.fields = fields;

			applicant.html(template(boxTemp, {
				date: data.result.requestDate,
				user: user,
				fields: fields,
				readonly: applicant.options.readonly
			}));
		}).fail(function(error) {
			Helper.alert(error);
		});
	}

	function addListener(applicant) {
		//同意
		applicant.addAction(".btnAgree", "click", function() {
			applicant.options.agree && $.isFunction(applicant.options.agree) && applicant.options.agree.call(applicant, $(this));
		});

		//拒绝
		applicant.addAction(".btnReject", "click", function() {
			applicant.options.reject && $.isFunction(applicant.options.reject) && applicant.options.reject.call(applicant, $(this));
		});
	}


	// 匹配题目和答案
	function makeResult(questions, answers) {
		var fields = [];

		// questions
		var textQuestions = questions.texts;
		var dateQuestions = questions.dates;
		var choiceQuestions = questions.choices;
		var imageQuestions = questions.images;

		// answers
		var textAnswers = answers.userTexts;
		var dateAnswers = answers.userDates;
		var choiceAnswers = answers.userOptions;
		var imageAnswers = answers.userImages;

		// texts
		$(textQuestions).each(function(idx, question) {
			fields.push(question);
			question.answer = "";
			$(textAnswers).each(function(j, answer) {
				if (answer.textId == question.id) {
					question.answer = answer.value;
					return false;
				}
			});
		});
		// dates
		$(dateQuestions).each(function(idx, question) {
			fields.push(question);
			question.type = "DATE";
			question.answer = "";
			$(dateAnswers).each(function(j, answer) {
				if (answer.dateId == question.id) {
					question.answer = answer.value;
					return false;
				}
			});
		});
		// images
		$(imageQuestions).each(function(idx, question) {
			fields.push(question);
			question.type = "IMAGE";
			question.answer = "";
			$(imageAnswers).each(function(j, answer) {
				if (answer.imageId == question.id) {
					question.answer = answer.value;
					return false;
				}
			});
		});
		// choices
		$(choiceQuestions).each(function(idx, question) {
			fields.push(question);
			$(question.options).each(function(i, option) {
				$(choiceAnswers).each(function(j, answer) {
					if (answer.optionId == option.id) {
						option.selected = true;
					}
				});
			});
		});

		return fields.sort(function(field1, field2) {
			return field1.rank - field2.rank;
		});
	}

	module.exports = Applicant;
});