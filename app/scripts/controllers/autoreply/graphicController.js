define(function(require, exports, module) {
	var baseController = require('baseController');
	var bC = new baseController();

	var template = require('template');

	var AutoreplyService = require('AutoreplyService');
	var Helper = require("helper");
	var RichTextEditor = require("ueditor");
	var GUID = require("factory.guid");

	var orgId;

	var editor;

	var PublicId, ReplyId, ReplyType, Keywords, Articles, CurrentIndex;

	var Controller = function() {
		var _controller = this;
		_controller.namespace = "autoreply.graphic";
		// 页面销毁
		_controller.destroy = function() {
			editor && editor.destroy();
		};
		_controller.actions = {
			// 图片库选择器
			openImageSelector: function() {
				require.async("ImageSelector", function(ImageSelector) {
					ImageSelector({
						title: '选择海报',
						crop: {
							aspectRatio: 300 / 160,
							previewWidth: 187,
							previewHeight: 100
						},
						cut: function(imageUrl) {
							updatePic(this, imageUrl);
						},
						choose: function(imageUrls) {
							updatePic(this, imageUrls[0]);
						}
					});
				});

				function updatePic(selector, imageUrl) {
					Articles[CurrentIndex].picUrl = imageUrl;
					$("#Image").attr("src", imageUrl);
					selector.destroy();
					renderPreview();
				}
			},
			openKeywordModel: function() {
				keywordModal();
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
			save: function() {
				var _btn = this,
					form = _btn.parents("form"),
					data = Helper.getFormData(form);

				save(_btn, data);
			},
			modifyTitle: function() {
				var _input = this;
				Articles[CurrentIndex].title = _input.val();
				renderPreview();
			},
			modifyAuthor: function() {
				var _input = this;
				Articles[CurrentIndex].author = _input.val();
				renderPreview();
			},
			modifyArticleType: function() {
				var type = this.val();
				if (type == "ARTICLE") {
					$("#ArticleContent").removeClass('hide');
					$("#AuthorContainer").removeClass('hide');
					$("#CustomizeUrl").addClass('hide');
				} else {
					$("#CustomizeUrl").removeClass('hide');
					$("#AuthorContainer").addClass('hide');
					$("#ArticleContent").addClass('hide');
				}
				Articles[CurrentIndex].articleType = type;
				renderEdit();
			},
			switchIndex: function() {
				var index = +this.attr("data-index");
				if (index == CurrentIndex) return;
				var article = Articles[CurrentIndex];
				article.content = article.articleType == "ARTICLE" ? editor.getContent() : $("#Url").val();
				CurrentIndex = index;
				renderEdit();
			},
			addItem: function() {
				Articles.push({
					id: (new GUID).newGUID(),
					articleType: "ARTICLE",
					author: "",
					content: "",
					description: "",
					picUrl: "",
					title: ""
				});
				renderPreview();
			},
			removeItem: function() {
				var index = +this.attr("data-index");
				Articles.splice(index, 1);
				if (index == CurrentIndex) {
					CurrentIndex = 0;
				} else if (index < CurrentIndex) {
					CurrentIndex--;
				}
				renderPreview();
				renderEdit();
			}
		}
	};

	bC.extend(Controller);
	Controller.prototype.init = function() {
		var controller = this;

		ReplyType = Helper.param.hash('replyType');
		ReplyId = Helper.param.hash('replyId');
		orgId = App.organization.info.id;


		Keywords = [];
		Articles = [{
			id: (new GUID).newGUID(),
			articleType: "ARTICLE",
			author: "",
			content: "",
			description: "",
			picUrl: "",
			title: ""
		}];
		CurrentIndex = 0;

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
			controller.render();
		});
	};

	Controller.prototype.render = function() {
		var callback = this.callback;
		var templateUrl = this.templateUrl;

		// add
		if (ReplyId == 'add') {
			Helper.globalRender(template(templateUrl, {
				replyType: ReplyType
			}));
			renderPreview();
			renderEdit();
			Helper.execute(callback);
			return;
		}

		AutoreplyService.get(ReplyId).done(function(data) {
			Articles = data.result;

			if (ReplyType == 'KEYWORD') {
				renderKeyword(templateUrl);
			} else {
				Helper.globalRender(template(templateUrl, {
					replyType: ReplyType,
					replyId: ReplyId,
					articles: Articles
				}));
				renderPreview();
				renderEdit();
			}


		}).fail(function(error) {
			Helper.errorToast(error);
		}).always(function() {
			Helper.execute(callback);
		});
	};

	function renderKeyword(templateUrl) {
		AutoreplyService.keywords(ReplyId).done(function(data) {
			var keywords = data.result;

			var matchType;
			if (keywords.length) {
				$.each(keywords, function(idx, option) {
					Keywords.push(option.keyWord);
				});
				matchType = keywords[0].matchType;
			};

			Helper.globalRender(template(templateUrl, {
				replyType: ReplyType,
				replyId: ReplyId,
				articles: Articles,
				matchType: matchType
			}));
			$("#keywordContainer").html(template('app/templates/autoreply/public/keywords', {
				targets: Keywords
			}));
			renderPreview();
			renderEdit();

		}).fail(function(error) {
			Helper.errorToast(error);
		});
	}

	function renderPreview() {
		$("#MediaPreviewArea").html(template("app/templates/autoreply/public/graphic-preview", {
			index: CurrentIndex,
			articles: Articles
		}));
	};

	function renderEdit() {
		var article = Articles[CurrentIndex];
		$("#MediaEditArea").html(template("app/templates/autoreply/public/graphic-edit", {
			index: CurrentIndex,
			article: article,
			count: Articles.length
		})).animate({
			"marginTop": CurrentIndex > 0 ? (CurrentIndex - 1) * 121 + 200 : 0
		}, 1000);
		if (article.articleType == "ARTICLE") {
			setTimeout(function() {
				//富文本编辑器图片上传事件监听
				editor && editor.destroy();
				editor = RichTextEditor.init("Context");
			}, 100);
		}
	};

	function validateItems() {
		var result = true;
		$.each(Articles, function(idx, item) {
			if (!item.title || item.title.length == 0) {
				Helper.errorToast("请填写标题！");
				CurrentIndex = idx;
				renderEdit();
				result = false;
				return false;
			}
			if (item.title.length > 64) {
				Helper.errorToast("标题长度不能超过64字！");
				CurrentIndex = idx;
				renderEdit();
				result = false;
				return false;
			}
			if (!item.picUrl) {
				Helper.errorToast("图片不能为空！");
				CurrentIndex = idx;
				renderEdit();
				result = false;
				return false;
			}
			if (!item.content || item.content.length == 0) {
				Helper.errorToast(item.articleType == "ARTICLE" ? "正文不能为空！" : "访问网址不能为空！");
				CurrentIndex = idx;
				renderEdit();
				result = false;
				return false;
			}
		});
		return result;
	};

	// 保存
	function save(btn, data) {
		var articleType = $("input:radio[name=articleType]:checked").val();
		Articles[CurrentIndex].articleType = articleType;
		Articles[CurrentIndex].content = articleType == "ARTICLE" ? editor.getContent() : $("#Url").val();

		if (!validateItems()) {
			return;
		}

		$(Articles).each(function(idx, article) {
			article.rank = idx + 1;
		});

		var param = {
			publicId: PublicId,
			replyId: ReplyId,
			replyType: ReplyType,
			messageType: Articles.length == 1 ? 'SINGLE_ARTICLE' : 'MULTIPLE_ARTICLE',
			articleJsonStr: JSON.stringify(Articles)
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
	};

	// 提交
	function submit(btn, data, success) {
		var action = ReplyId != 'add' ? "update" : "add";
		(ReplyId == "add") && (delete data.replyId);
		Helper.begin(btn);
		AutoreplyService[action].graphic(data).done(function(data) {
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