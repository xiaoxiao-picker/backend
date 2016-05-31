define(function(require, exports, module) {
	require("plugins/select2/select2.js");

	var baseController = require('baseController');
	var bC = new baseController();

	var ArticleService = require('ArticleService');
	var PublicService = require("PublicService");
	var CommentService = require('CommentService');

	var Helper = require("helper");
	var template = require('template');

	var KeywordModel = require('KeywordModel');
	var RichTextEditor = require("ueditor");

	var orgId;

	// 文章信息
	var articleId;
	var ArticleInfo; // 当前文章信息
	var ArticleInfoClone; // 记录初始值

	var editor;

	var Controller = function() {
		var _controller = this;
		_controller.namespace = "article.edit";

		// 编辑状态
		_controller.editing = false;
		_controller.autoSaveTips = "文章处于编辑状态，自动保存修改？";

		// 自动保存
		_controller.autoSave = function(callback) {
			Helper.execute(callback);
			if (!validateArticleInfo()) {
				// Helper.errorToast("文章信息不完整保存失败！");
				return;
			};
			Helper.confirm(_controller.autoSaveTips, function() {
				saveThen(null, function() {
					Helper.successToast("文章自动保存成功！");
				}, function() {
					Helper.alert("文章自动保存失败！");
				});
			});
		};
		// 页面销毁
		_controller.destroy = function() {
			editor.destroy();
		};
		_controller.actions = {
			advertManage: function() {
				jumpBeforeSave(this, 'ADVERT', _controller);
			},
			classficationManage: function() {
				jumpBeforeSave(this, 'CATEGORY', _controller);
			},
			// 保存
			save: function(evt) {
				var _btn = this;
				ArticleInfo.text = editor.getContent();
				saveThen(_btn, function() {
					Helper.successToast("保存成功！");
					_controller.editing = false;
					window.location.hash = "articles?state=" + ArticleInfo.state;
				});
			},
			// 保存并发布
			publish: function(evt) {
				var _btn = this;
				// 记录初始状态
				var state = ArticleInfo.state;
				Helper.confirm("发布后即对外开放，确定发布？", {}, function() {
					ArticleInfo.state = "PUBLISHED";
					saveThen(_btn, function() {
						Helper.successToast("发布成功！");
						_controller.editing = false;
						window.location.hash = "articles?state=PUBLISHED";
					}, function() {
						ArticleInfo.state = state;
					});
				});
			},
			// 下线文章
			archive: function() {
				var _btn = this;
				// 记录初始状态
				var state = ArticleInfo.state;
				Helper.confirm("下线文章将会被移至草稿箱，仍继续？", {}, function() {
					ArticleInfo.state = "UNPUBLISHED";
					saveThen(_btn, function() {
						Helper.successToast("操作成功！");
						_controller.editing = false;
						window.location.hash = "articles?state=UNPUBLISHED";
					}, function() {
						ArticleInfo.state = state;
					});
				});
			},
			// 将文章删除到回收站
			moveToDustbin: function() {
				var _btn = this;
				// 记录初始状态
				var state = ArticleInfo.state;
				Helper.confirm("删除文章将会进入回收站，确定删除？", {}, function() {
					ArticleInfo.state = "RUBBISH";
					saveThen(_btn, function() {
						Helper.success("操作成功！");
						_controller.editing = false;
						window.location.hash = "articles?state=RUBBISH";
					}, function() {
						ArticleInfo.state = state;
					});
				});
			},
			// 彻底删除
			remove: function() {
				var _btn = this;

				Helper.confirm("确定彻底删除此文章？", {}, function() {
					Helper.begin(_btn);
					ArticleService.remove(orgId, articleId).done(function(data) {
						Helper.successToast("删除成功！");
						_controller.editing = false;
						window.location.hash = "articles?state=" + ArticleInfo.state;
					}).fail(function(error) {
						Helper.alert(error);
					}).always(function() {
						Helper.end(_btn);
					});
				});
			},
			openLabelModal: function() {
				Helper.singleInputModal({
					title: "文章分类管理",
					name: "文章分类名称",
					action: function(modal) {
						var _btn = $(this);
						var _input = modal.box.find('.input');
						var categoryName = _input.val();
						var categoryId = _btn.attr("data-value");

						if (Helper.validation.isEmpty(categoryName)) {
							Helper.errorToast("分类名称不能为空");
							return;
						}

						Helper.begin(_btn);
						ArticleService.category.add(orgId, categoryName).done(function(data) {
							Helper.successToast("添加成功");
							modal.close();

							var categoryId = data.result;
							App.organization.articleCategories.push({
								id: categoryId,
								name: categoryName
							});

							//默认添加关键词回复
							KeywordModel.custom.article(data.result, categoryName);

							renderArticleCategories();
						}).fail(function(error) {
							Helper.errorToast(error);
						}).always(function() {
							Helper.end(_btn);
						});
					}
				});
			},
			// 图片库选择器
			openImageSelector: function() {
				require.async("ImageSelector", function(ImageSelector) {
					ImageSelector({
						title: '选择文章海报',
						cut: function(imageUrl) {
							updatePic(_controller, this, imageUrl);
						},
						choose: function(imageUrls) {
							updatePic(_controller, this, imageUrls[0]);
						}
					});
				});
			},
			// 图片截取插件
			openImageCrop: function() {
				require.async("ImageCrop", function(ImageCrop) {
					ImageCrop(ArticleInfo.thumbnailUrl, {
						title: "剪切文章海报",
						cut: function(imageUrl) {
							updatePic(_controller, this, imageUrl);
						}
					});
				});
			},
			// 检查标题是否修改
			checkTitle: function() {
				ArticleInfo.name = this.val();
				checkEditing(_controller);
			},
			// 检查简介是否编辑以及编辑状态
			terseValidate: function() {
				var _input = this;
				var terse = _input.val();
				if (terse.length > 100) {
					terse = terse.substr(0, 100);
					_input.val(terse);
				}
				$("#TerseRemain").text(100 - terse.length);
				ArticleInfo.terse = terse;
				checkEditing(_controller);
			},
			checkType: function() {
				ArticleInfo.category.id = this.val();
				checkEditing(_controller);
			},
			checkCommentState: function() {
				var _input = this;
				var commentState = _input.prop("checked");

				ArticleInfo.commentState = commentState;
				checkEditing(_controller);
			}
		}
	};
	bC.extend(Controller);
	Controller.prototype.init = function(templateName, fn) {
		this.editing = false;
		ArticleInfo = null;
		ArticleInfoClone = null;
		orgId = App.organization.id;
		articleId = Helper.param.hash('articleId');
		this.render();
	};

	Controller.prototype.render = function() {
		var controller = this;
		if (articleId != '0') {
			ArticleService.load(articleId).done(function(data) {
				ArticleInfo = data.result;

				if (!ArticleInfo.category) {
					ArticleInfo.category = {};
				}
				ArticleInfoClone = $.extend(true, {}, ArticleInfo);

				Helper.globalRender(template(controller.templateUrl, {
					articleInfo: ArticleInfo,
					organization: Application.organization
				}));
				addListener(controller);
				renderArticleCategories(ArticleInfo.category ? ArticleInfo.category.id : "");
			}).fail(function(error) {
				Helper.alert(error);
			}).always(function() {
				Helper.execute(controller.callback);
			});
		} else {
			ArticleInfo = {
				state: "UNPUBLISHED",
				category: {},
				commentState: 'OPEN'
			};
			ArticleInfoClone = $.extend(true, {}, ArticleInfo);
			Helper.globalRender(template(controller.templateUrl, {
				articleInfo: ArticleInfo,
				organization: Application.organization
			}));
			addListener(controller);
			renderArticleCategories();
			Helper.execute(controller.callback);
		}
	}


	/**
	 * 保存文章
	 */
	function saveThen(btn, successFnc, errorFnc) {
		if (!validateArticleInfo()) return;
		var data = getCommitArticleInfo();

		btn && Helper.begin(btn);
		if (articleId != '0') {
			ArticleService.update(orgId, articleId, data).done(function(data) {
				successFnc();
			}).fail(function(error) {
				Helper.alert(error);
				Helper.execute(errorFnc);
			}).always(function() {
				btn && Helper.end(btn);
			});
		} else {
			ArticleService.add(orgId, data).done(function(data) {
				successFnc();
			}).fail(function(error) {
				Helper.alert(error);
				Helper.execute(errorFnc);
			}).always(function() {
				btn && Helper.end(btn);
			});
		}

	}

	function jumpBeforeSave(btn, type, controller) {
		if (!articleId) {
			Helper.alert("当前文章未保存，不可进行该操作！");
			return;
		}

		var callback = function() {
			controller.editing = false;
			var jumpUrl = "";
			switch (type) {
				case 'ADVERT':
					jumpUrl = "advertisement/ARTICLE/" + articleId + "/info?from=edit";
					break;
				case 'CATEGORY':
					jumpUrl = "article/categories?from=edit&targetId=" + articleId;
					break;
			}
			Helper.go(jumpUrl);
		};

		if (!controller.editing) {
			Helper.execute(callback);
			return;
		}

		Helper.confirm("当前编辑尚未保存，是否先保存？", {
			yesText: "保存并跳转",
			noText: "继续编辑"
		}, function() {
			saveThen(btn, callback);
		});
	}


	// 事件监听
	function addListener(controller) {
		//富文本编辑器图片上传事件监听
		editor = RichTextEditor.init("Context");
		editor.addListener("contentchange", function() {
			ArticleInfo.text = editor.getContent();
			checkEditing(controller);
		});
	}


	/**
	 * 活动分类下拉框渲染
	 */
	function renderArticleCategories(value) {
		App.organization.getArticleCategories(true).done(function(data) {
			var options = App.organization.articleCategories.clone();
			options.splice(0, 0, {
				id: "",
				name: "未分类"
			});
			$(options).each(function(idx, item) {
				item.value = item.id;
				item.selected = item.id == value;
			});
			$("#ArticleCategories").html(template("app/templates/public/option", {
				options: options
			})).select2();

		}).fail(function(error) {
			Helper.alert(error);
		});
	};

	// 检查页面是否已编辑
	function checkEditing(controller) {
		var editing = false;
		$.each(["title", "thumbnailUrl", "terse", "text", "commentState"], function(idx, key) {
			if (ArticleInfo[key] !== ArticleInfoClone[key]) {
				editing = true;
				return false;
			}
		});
		if (ArticleInfo.category.id !== ArticleInfoClone.category.id) {
			editing = true;
		}
		controller.editing = editing;
		if (editing) {
			$(".btn-save").removeAttr("disabled");
		} else {
			$(".btn-save").removeAttr("disabled");
			// $(".btn-save").attr("disabled", "disabled");
		}
		return editing;
	};

	// 根据当前文章信息获取提交数据
	function getCommitArticleInfo() {
		var data = {};
		ArticleInfo.text = UE.getEditor('Context').getContent();
		$.each(["name", "thumbnailUrl", "terse", "text", "state"], function(idx, key) {
			var value = ArticleInfo[key];
			if (value) {
				data[key] = value;
			}
		});
		data["commentState"] = ArticleInfo["commentState"] ? 'OPEN' : 'CLOSE';
		if (ArticleInfo.category.id) {
			data['category.id'] = ArticleInfo.category.id;
		}
		return data;
	};

	// 检查文章信息是否有效
	function validateArticleInfo() {
		var result = true;
		if (Helper.validation.isEmptyNull(ArticleInfo.name)) {
			Helper.errorToast("文章标题不能为空！");
			result = false;
			return result;
		}
		if (Helper.validation.isEmptyNull(ArticleInfo.thumbnailUrl)) {
			Helper.errorToast("请上传文章主题图片！");
			result = false;
			return result;
		}
		if (Helper.validation.isEmptyNull(ArticleInfo.terse)) {
			Helper.errorToast("文章简介不能为空！");
			result = false;
			return result;
		}
		if (Helper.validation.isEmptyNull(ArticleInfo.text)) {
			Helper.errorToast("文章内容不能为空！");
			result = false;
			return result;
		}
		return result;
	};

	//更新海报
	function updatePic(controller, selector, imageUrl) {
		if (!ArticleInfo.thumbnailUrl) {
			$(".xx-inner-content .btn-cut").removeClass('hide');
		}
		ArticleInfo.thumbnailUrl = imageUrl;
		$("#ArticleAvatar").attr("src", imageUrl);
		checkEditing(controller);
		selector.destroy();
	};

	module.exports = Controller;
});