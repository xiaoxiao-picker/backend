define(function(require, exports, module) {
	var globalResponseHandler = require("ajaxHandler");
	
	exports.checkTaskState = function(taskId) {
		return globalResponseHandler({
			url: "task/" + taskId + "/state"
		}, {
			description: "查看任务状态"
		});
	};
	exports.getTaskResult = function(taskId) {
		return globalResponseHandler({
			url: "task/" + taskId + "/result"
		});
	};
});