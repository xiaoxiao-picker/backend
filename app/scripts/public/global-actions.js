define(function(require, exports, module) {
	var ExportService = require("ExportService");
	var TaskService = require("TaskService");
	var Helper = require("helper");
	module.exports = {
		goBack: function() {
			window.history.back();
		},
		checkUser: function() {
			var userId = this.attr("data-user-id");
			require.async("lib.UserModal", function(UserModal) {
				UserModal(userId);
			});
		},
		exportReport: function() {
			var btn = this;
			var sourceId = btn.attr("data-source-id");
			var sourceType = btn.attr("data-source-type").toLowerCase();
			var sourceExportFileName = btn.attr("data-export-file-name") || "";

			Application.controller.downloadTasks = Application.controller.downloadTasks || {};

			Helper.begin(btn);

			var date = new Date().getTime();
			var actionId = sourceType + "." + sourceId + "." + date;
			Application.controller.downloadTasks[actionId] = {
				state: "RUNNING",
				start: date,
				count: 0
			};
			ExportService[sourceType](sourceId).done(function(data) {
				var taskId = data.result;
				makeTaskResult(taskId);
			}).fail(function(error) {
				Helper.alert(error);
				Helper.end(btn);
			});

			Helper.begin(btn);

			function makeTaskResult(taskId) {
				setTimeout(function() {
					Application.controller.downloadTasks[actionId].count++;
					TaskService.checkTaskState(taskId).done(function(data) {
						var state = data.result;
						(state != "RUNNING") && (Application.controller.downloadTasks[actionId].end = new Date().getTime());

						if (state == "OK") {
							Application.controller.downloadTasks[actionId].state = "COMPLETE";

							var exportURL = "/api-oa/task/export/result?session=" + App.getSession() + "&taskId=" + taskId + "&fileName=" + sourceExportFileName;
							var frame = document.createElement("iframe");
							frame.src = exportURL;
							$(frame).hide().appendTo(document.body);
							setTimeout(function() {
								$(frame).remove();
							}, 2000)
							Helper.end(btn);
						} else if (state == "RUNNING") {
							makeTaskResult(taskId);
						} else if (state == "CANCEL") {
							Application.controller.downloadTasks[actionId].state = "CANCEL";
							Helper.alert("任务意外中断，请稍后重试！");
							Helper.end(btn);
						} else if (state == "ERROR") {
							Application.controller.downloadTasks[actionId].state = "ERROR";
							Helper.alert("任务失败，请稍后重试！");
							Helper.end(btn);
						}
					}).fail(function(error) {
						Helper.alert(error);
						Helper.end(btn);
					});
				}, 500);
			}
		},
		checkQRCode: function() {
			var btn = this;
			var sourceName = btn.attr("data-source-name");
			var sourceId = btn.attr("data-source-id");
			var sourceUrl = btn.attr("data-source-url");
			var sourceType = btn.attr("data-source-type").toUpperCase();

			require.async("lib.ImageModal", function(ImageModal) {
				ImageModal(getSourceUrl(), {
					title: sourceName + " 二维码",
					width: "300px",
					description: "扫描二维码进入[ " + sourceName + " ]页面"
				});
			});

			function getSourceUrl() {
				var organizationId = Application.organization.id;
				var url = Helper.config.pages.frontRoot + '/index.html';
				switch (sourceType) {
					case 'ARTICLE_CATEGORY':
						url += '#organization/' + organizationId + '/articles&categoryId=' + sourceId + '&title=' + sourceName;
						break;
					case 'EVENT_CATEGORY':
						url += '#organization/' + organizationId + '/events&categoryId=' + sourceId + '&title=' + sourceName;
						break;
					case 'PROPOSAL_CATEGORY':
						url += '#organization/' + organizationId + '/proposals&categoryId=' + sourceId + '&title=' + sourceName;
						break;
					case 'ORGANIZATION_CATEGORY':
						url += '#organization/' + organizationId + '/list/school&categoryId=' + sourceId + '&title=' + sourceName;
						break;
					case 'HOMEPAGE':
						url += '#organization/' + organizationId + '/index&pid=' + sourceId + "&title=" + name;
						break;
					case 'VOTE_DEFAULT':
						url += '#organization/' + organizationId + '/vote/' + sourceId + '/info';
						break;
					case 'VOTE_UGC':
						url += '#organization/' + organizationId + '/vote/' + sourceId + '/info/ugc';
						break;
					case 'TICKET':
						url += '#organization/' + organizationId + '/ticket/' + sourceId + '/info';
						break;
					case 'WALL':
						url += '#organization/' + organizationId + '/wall/' + sourceId + '/message';
						break;
					case 'LOST':
						url += '#organization/' + organizationId + '/lost/' + sourceId + '/info';
						break;
					case 'PROPOSAL':
						url += '#organization/' + organizationId + '/proposal/' + sourceId + '/info';
						break;
					case 'QUESTIONNAIRE':
						url += '#organization/' + organizationId + '/questionnaire/' + sourceId + '/info';
						break;
					case 'E_MEMBER':
						url += '#organization/' + organizationId + '/user/' + sourceId + '/resume';
						break;
					case 'LOTTERY':
						url += '#organization/' + organizationId + '/lottery/' + sourceId + '/draw';
						break;
					case 'LINK':
						url = sourceUrl;
						break;
				}

				return url;
			}
		}
	};
});