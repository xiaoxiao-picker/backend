define(function(require, exports, module) {
	var Helper = require("helper");
	var template = require('template');
	var TaskService = require("TaskService");
	var QuestionnaireService = require('QuestionnaireService');

	var StatisticsBox = function(questionnaireId, options) {
		options = $.extend({
			title: "数据统计",
			message: "该操作可能会比较耗时，请耐心等待！"
		}, options);

		var modal = Helper.modal(options);
		modal.questionnaireId = questionnaireId;

		var date = new Date().getTime();
		modal.actionId = "questionnaireStatistics." + questionnaireId + "." + date;

		Application.controller.downloadTasks = Application.controller.downloadTasks || {};
		Application.controller.downloadTasks[modal.actionId] = {
			state: "RUNNING",
			start: date,
			count: 0
		};

		QuestionnaireService.makeStatisticsTask(questionnaireId).done(function(data) {
			var taskId = data.result;
			makeTaskResult(taskId, modal);
		}).fail(function(error) {
			modal.destroy();
			Helper.alert(error);
		});
	};

	function makeTaskResult(taskId, modal) {
		var actionId = modal.actionId;
		setTimeout(function() {
			Application.controller.downloadTasks[actionId].count++;
			TaskService.checkTaskState(taskId).done(function(data) {
				var state = data.result;
				(state != "RUNNING") && (Application.controller.downloadTasks[actionId].end = new Date().getTime());

				if (state == "OK") {
					Application.controller.downloadTasks[actionId].state = "COMPLETE";
					TaskService.getTaskResult(taskId).done(function(data) {
						var questionnaire = data.result;
						render(questionnaire, modal);
					}).fail(function(error) {
						Helper.alert(error);
						modal.destroy();
					});

				} else if (state == "RUNNING") {
					makeTaskResult(taskId, modal);
				} else if (state == "CANCEL") {
					Application.controller.downloadTasks[actionId].state = "CANCEL";
					Helper.alert("任务意外中断，请稍后重试！");
					modal.destroy();
				} else if (state == "ERROR") {
					Application.controller.downloadTasks[actionId].state = "ERROR";
					Helper.alert("任务失败，请稍后重试！");
					modal.destroy();
				}
			}).fail(function(error) {
				Helper.alert(error);
				modal.destroy();
			});
		}, 500);
	}

	function render(questionnaire, modal) {
		questionnaire.choices = questionnaire.choices || [];
		modal.html(template("app/templates/questionnaire/statistics", {
			questionnaire: questionnaire
		}));

		setTimeout(function() {
			modal.box.find(".progress").each(function(idx, item) {
				$(item).width(+$(item).attr("data-value"));
			});
		}, 200);
	}

	module.exports = function(questionnaireId, options) {
		return new StatisticsBox(questionnaireId, options);
	};
});