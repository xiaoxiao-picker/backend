define(function(require, exports, module) {
	var template = require('template');
	var Helper = require("helper");
	var UserService = require('UserService');

	var infos = [{
		icon: "./images/guide/guide1_icon.png",
		img: "./images/guide/guide1_img.png",
		style: "guide1", 
		btn_class: "btn-first",
		nextText: "下一步"
	}, {
		icon: "./images/guide/guide2_icon.png",
		img: "./images/guide/guide2_img.png",
		style: "guide2", 
		btn_class: "btn-second",
		nextText: "下一步"
	}, {
		icon: "./images/guide/guide3_icon.png",
		img: "./images/guide/guide3_img.png",
		style: "guide3", 
		btn_class: "btn-third",
		nextText: "立即体验"
	}];

	var boxTemp = "app/templates/public/guide-modal";

	var userId;

	var GuideModal = function(options) {
		this.namespace = "guide-modal";
		this.template = options.template || template;
		this.container = options.container || $(document.body);
		this.box = options.box || $(this.template('app/templates/public/shadow-box', {}));
		this.options = $.extend({}, options);

		init(this);
		addListener(this);
	}

	function init(guide) {
		userId = App.userInfo.id;

		guide.container.append(guide.box);
		render(guide, infos[0]);
	}

	function render(guide, data) {
		guide.box.find('.inner-box').html(guide.template(boxTemp, data));
	}

	function addListener(guide) {

		//第一页
		guide.box.on('click.' + guide.namespace, ".btn-first", function() {
			render(guide, infos[1]);
		});

		//第二页
		guide.box.on('click.' + guide.namespace, ".btn-second", function() {
			render(guide, infos[2]);
		});

		//第三页
		guide.box.on('click.' + guide.namespace, ".btn-third", function() {
			guide.destroy();

			UserService.updateUserConfig(userId, {
				needOrgInfoEditGuide: false
			}).done(function() {
				App.userInfo.config.needOrgInfoEditGuide = false;
			}).fail(function(error) {
				Helper.alert(error);
			})
		});
	}

	GuideModal.prototype.destroy = function() {
		var guide = this;
		guide.box.remove();
		guide.box.off("." + guide.namespace);
	};

	module.exports = function(options) {
		new GuideModal(options);
	};
});
