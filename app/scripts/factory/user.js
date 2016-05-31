define(function(require, exports, module) {
	var Helper = require("helper");
	var UserService = require("UserService");

	var User = function(userId) {
		this.id = userId;
	};

	User.prototype.reload = function(done, fail, always) {
		var userId = this.id;
		var user = this;
		return UserService.get(userId).done(function(data) {
			user.info = data.result;
		});
	};


	module.exports = function(userId) {
		return new User(userId);
	};
});