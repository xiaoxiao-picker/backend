define(function(require, exports, module) {
	var baseController = require('baseController');
	var template = require('template');
	var bC = new baseController();
	var AutoreplyService = require('AutoreplyService');
	var Helper = require("helper");

	var tmp, callback, orgId, session, imgUrl;

	var PublicId, ReplyId, ReplyType, Keywords;

	var Controller = function() {
		var _controller = this;
		_controller.namespace = "autoreply.image";
		_controller.actions = {
			// 图片库选择器
			openImageSelector: function() {
				require.async("ImageSelector", function(ImageSelector) {
					ImageSelector({
						title: '选择图片',
						cut: function(imageUrl) {
							updatePic(this, imageUrl);
						},
						choose: function(imageUrls) {
							updatePic(this, imageUrls[0]);
						}
					});
				});

				function updatePic(selector, imageUrl) {
					imgUrl = imageUrl;
					$("#ImgWrapper").attr("src", imageUrl);
					selector.destroy();
				}
			},
			openKeywordModel: function() {
				keywordModal();
			},
			save: function() {
				var _btn = this,
					form = _btn.parents("form"),
					data = Helper.getFormData(form);

				save(_btn, data);
			},
			removeKeyword: function() {
				var _btn = this,
					keyWord = _btn.attr("data-value");
				var index = Keywords.indexOf(keyWord);
				if (index > -1) {
					Keywords.splice(index, 1);
				}
				_btn.parents(".xx-tag-wrapper").remove();
			}
		}
	};

	bC.extend(Controller);
	Controller.prototype.init = function(templateName, fn) {
		ReplyType = Helper.param.hash('replyType');
		ReplyId = Helper.param.hash('replyId');
		orgId = App.organization.info.id;
		session = App.getSession();
		Keywords = [];
		imgUrl = "";
		tmp = templateName;
		callback = fn;

		App.organization.getWechat(false).done(function() {
			PublicId = App.organization.wechat ? App.organization.wechat.id : "";
			if (!PublicId) {
				Helper.confirm("您的组织还未绑定微信公众号，暂不能使用该功能！", {
					yesText: "立即绑定"
				}, function() {
					Helper.go("wechat/info");
				});
				Helper.execute(callback);
				return;
			};
			render();
		});
	};

	function render() {
		if (ReplyId != 'add') {
			AutoreplyService.get(ReplyId).done(function(data) {
				imgUrl = data.result;

				if (ReplyType == 'KEYWORD') {
					renderKeyword();
				} else {
					Helper.globalRender(template(tmp, {
						replyType: ReplyType,
						replyId: ReplyId,
						imageUrl: imgUrl
					}));
				}
				// $("[data-toggle=tooltip]").tooltip();

			}).fail(function(error) {
				Helper.errorToast(error);
			}).always(function() {
				Helper.execute(callback);
			});
		} else {
			Helper.globalRender(template(tmp, {
				replyType: ReplyType
			}));
			// $("[data-toggle=tooltip]").tooltip();
			Helper.execute(callback);
		}

	}

	function renderKeyword() {
		AutoreplyService.keywords(ReplyId).done(function(data) {
			var keywords = data.result;

			var matchType;
			if (keywords.length) {
				$.each(keywords, function(idx, option) {
					Keywords.push(option.keyWord);
				});
				matchType = keywords[0].matchType;
			};
			Helper.globalRender(template(tmp, {
				replyType: ReplyType,
				replyId: ReplyId,
				imageUrl: imgUrl,
				matchType: matchType
			}));
			$("#keywordContainer").html(template('app/templates/autoreply/public/keywords', {
				targets: Keywords
			}));

		}).fail(function(error) {
			Helper.errorToast(error);
		});
	};

	// 保存
	function save(btn, data) {
		if (!imgUrl) {
			Helper.errorToast("回复图片不存在，请先添加！");
			return;
		};

		var param = {
			publicId: PublicId,
			replyId: ReplyId,
			replyType: ReplyType,
			imageUrl: imgUrl
		};
		if (ReplyType == 'KEYWORD') {
			if (!Keywords.length) {
				Helper.errorToast("至少添加一个关键字！");
				return;
			}
			param.matchType = data.matchType;
			param.keywords = Keywords.join(',');
		};

		if (ReplyType == 'KEYWORD') {
			submit(btn, param, function() {
				Helper.go("autoreply/KEYWORD/list");
			});
		} else {
			submit(btn, param, function() {
				Helper.successToast("操作成功");
				window.location.hash = "autoreply/" + ReplyType + "/list";
			});
			// Helper.confirm("保存成功后是否自动启用该图片回复？", {
			// 	yesText: "启用",
			// 	noText: "不启用"
			// }, function() {
			// 	submit(btn, param, function() {
			// 		activate();
			// 	});
			// }, function() {
			// 	submit(btn, param, function() {
			// 		Helper.successToast("操作成功");
			// 		window.location.hash = "autoreply/" + ReplyType + "/list";
			// 	});
			// });
		}
	};

	// 提交
	function submit(btn, data, success) {
		var action = ReplyId != 'add' ? "update" : "add";
		(ReplyId == "add") && (delete data.replyId);
		Helper.begin(btn);
		AutoreplyService[action].image(data).done(function(data) {
			if (ReplyId == 'add') {
				ReplyId = data.result;
			};
			success && $.isFunction(success) && success.call($(this));
		}).fail(function(error) {
			Helper.alert(error);
		}).always(function() {
			Helper.end(btn);
		});
	};

	// 启用回复
	function activate() {
		AutoreplyService.activate(ReplyId).done(function(data) {
			Helper.successToast("保存并启用成功");
			window.location.hash = "autoreply/" + ReplyType + "/list";
		}).fail(function(error) {
			Helper.errorToast(error);
		});
	};

	// 添加关键词
	function keyWordAppend(modal) {
		var _input = modal.box.find('.input');
		var keyWord = _input.val();

		if (Helper.validation.isEmpty(keyWord)) {
			Helper.errorToast("关键字不能为空！");
			return;
		}

		if (Keywords.indexOf(keyWord) > -1) {
			Helper.errorToast("关键字不能重复添加！");
			return;
		}
		Keywords.push(keyWord);
		$("#keywordContainer").append(template('app/templates/autoreply/public/keywords', {
			targets: [keyWord]
		}));
		modal.close();
	}

	function keywordModal() {
		Helper.singleInputModal({
			id: "",
			name: "关键词",
			value: "",
			title: "添加关键词",
			action: keyWordAppend
		});
	}

	module.exports = Controller;

});