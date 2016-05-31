define(function(require, exports, module) {
	var baseController = require('baseController');
	var template = require('template');
	var bC = new baseController();
	var AutoreplyService = require('AutoreplyService');
	var Helper = require("helper");

	var FaceBox = require("facebox");
	var LinkBox = require("linkbox");

	var tmp, callback, orgId, facebox, linkbox;

	var PublicId, ReplyId, ReplyType, Keywords;

	var Controller = function() {
		var _controller = this;
		_controller.namespace = "autoreply.text";
		_controller.actions = {
			textModify: function() {
				var $input = this;
				var context = $input.val();
				if (context.length > 600) {
					context = context.substr(0, 600);
					_input.val(context);
				}
				$("#TerseRemain").text(600 - context.length);
			},
			openKeywordModel: function() {
				keywordModal();
			},
			save: function() {
				var btn = this;
				var form = btn.parents("form");
				var data = Helper.getFormData(form);

				var param = {
					publicId: PublicId,
					replyId: ReplyId,
					replyType: ReplyType,
					text: data.content
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
				}
			},
			removeKeyword: function() {
				var _btn = this,
					keyWord = _btn.attr("data-value");
				var index = Keywords.indexOf(keyWord);
				if (index > -1) {
					Keywords.splice(index, 1);
				}
				_btn.parents(".xx-tag-wrapper").remove();
			},
			openFaces: function() {
				var container = this.parents(".icon");
				if (facebox.show) {
					facebox.destroy();
				} else {
					facebox.render(container);
				}
			},
			openLink: function() {
				var container = this.parents(".icon");
				if (linkbox.show) {
					linkbox.destroy();
				} else {
					linkbox.render(container);
				}
			}
		}
	};

	bC.extend(Controller);
	Controller.prototype.init = function(templateName, fn) {
		ReplyType = Helper.param.hash('replyType');
		ReplyId = Helper.param.hash('replyId');
		orgId = App.organization.info.id;
		tmp = templateName;
		callback = fn;
		Content = '';
		Keywords = [];

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
				Content = data.result;

				if (ReplyType == 'KEYWORD') {
					renderKeyword();
				} else {
					Helper.globalRender(template(tmp, {
						replyType: ReplyType,
						replyId: ReplyId,
						content: Content
					}));
					facebox = FaceBox($("#Content").get(0), {});
					linkbox = LinkBox($("#Content").get(0), {});
				}


			}).fail(function(error) {
				Helper.errorToast(error);
			}).always(function() {
				Helper.execute(callback);
			});
		} else {
			Helper.globalRender(template(tmp, {
				replyType: ReplyType
			}));
			facebox = FaceBox($("#Content").get(0), {});
			linkbox = LinkBox($("#Content").get(0), {});
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
				content: Content,
				matchType: matchType
			}));
			facebox = FaceBox($("#Content").get(0), {});
			linkbox = LinkBox($("#Content").get(0), {});

			$("#keywordContainer").html(template('app/templates/autoreply/public/keywords', {
				targets: Keywords
			}));

		}).fail(function(error) {
			Helper.errorToast(error);
		});
	};

	// 保存
	function save(btn, data) {
		var param = {
			publicId: PublicId,
			replyId: ReplyId,
			replyType: ReplyType,
			text: data.content
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
			// Helper.confirm("保存成功后是否自动启用该文字回复？", {
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
	}

	// 提交
	function submit(btn, data, success) {
		var action = ReplyId != 'add' ? "update" : "add";
		(ReplyId == "add") && (delete data.replyId);
		Helper.begin(btn);
		AutoreplyService[action].text(data).done(function(data) {
			if (ReplyId == 'add') {
				ReplyId = data.result;
			};
			success && $.isFunction(success) && success.call($(this));
		}).fail(function(error) {
			Helper.alert(error);
		}).always(function() {
			Helper.end(btn);
		});
	}

	// 启用回复
	function activate() {
		AutoreplyService.activate(ReplyId).done(function(data) {
			Helper.successToast("保存并启用成功");
			window.location.hash = "autoreply/" + ReplyType + "/list";
		}).fail(function(error) {
			Helper.errorToast(error);
		});
	}

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