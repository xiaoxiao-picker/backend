define(function(require, exports, module) {

	var Helper = require("helper");

	var baseController = require('baseController');
	var bC = new baseController();

	var WallService = require('WallService');
	var template = require('template');

	var wallId, WallInfo;

	var Controller = function() {
		var _controller = this;
		_controller.namespace = "wall.lottery";
		_controller.actions = {};
	};

	bC.extend(Controller);
	Controller.prototype.init = function(templateUrl, callback) {
		this.templateUrl = templateUrl;
		this.callback = callback;
		wallId = Helper.param.hash("wallId");
		this.render();
	};

	Controller.prototype.render = function() {
		var callback = this.callback;
		var templateUrl = this.templateUrl;

		WallService.lottery.getList(wallId).done(function(data) {
			var users = data.result;

			var groups = groupUsers(users);

			Helper.globalRender(template(templateUrl, {
				groups: groups,
				count: groups.length,
				wallId: wallId
			}));
		}).fail(function(error) {
			Helper.alert(error);
		}).always(function() {
			Helper.execute(callback);
		});
	};

	function groupUsers(users) {
		var groups = [];
		$.each(users, function(idx, user) {
			if (!groups.length) {
				groups.push({
					date: user.drawOrder,
					users: [user]
				});
			} else {
				var has = false;
				$.each(groups, function(g_idx, group) {
					if (group.date == user.drawOrder) {
						group.users.push(user);
						has = true;
						return false;
					}
				});
				if (!has) {
					groups.push({
						date: user.drawOrder,
						users: [user]
					});
				}
			}
		});

		return groups;
	}

	module.exports = Controller;
});