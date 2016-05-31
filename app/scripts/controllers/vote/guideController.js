define(function(require, exports, module) {
    var Helper = require("helper");
    var baseController = require('baseController');
    var bC = new baseController();
    var template = require('template');

    var orgId;

    var Controller = function() {
        var _controller = this;
        _controller.namespace = "vote.guide";
        _controller.actions = {

        }
    };

    bC.extend(Controller);
    Controller.prototype.init = function(templateUrl, callback) {
        this.callback = callback;
        this.templateUrl = templateUrl;
        orgId = App.organization.info.id;

        this.render();
    };

    Controller.prototype.render = function() {
        var callback = this.callback;
        var templateUrl = this.templateUrl;

        Helper.globalRender(template(templateUrl, {}));
        Helper.execute(callback);
    };

    module.exports = Controller;
});
