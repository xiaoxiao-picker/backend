define(function(require, exports, module) {
	var baseController = require('baseController');
	var bC = new baseController();
	var template = require('template');
	var Helper = require("helper");
	var RichTextEditor = require("ueditor");

	var WechatResourceService = require("WechatResourceService");

	var organizationId = Application.organization.id;
	var resourceId; // 图文消息ID
	var resourceInfo;

	var editor;

	var Controller = function() {
		var controller = this;
		controller.namespace = "resource.weixin.edit";
		controller.destroy = function() {
			editor && editor.destroy();
		};
		controller.actions = {
			// 图片库选择器
			openImageSelector: function() {
				var $btn = this;
				var index = +$btn.parents(".appmsg-editor").attr("data-current-index");
				require.async("ImageSelector", function(ImageSelector) {
					ImageSelector({
						title: '选择封面',
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
					resourceInfo.articles[index].xiaoxiaoUrl = imageUrl;
					$("#Image").attr("src", imageUrl);
					selector.destroy();
					renderPreview(index);
				}
			},
			modifyTitle: function() {
				var $input = this;
				var index = +$input.parents(".appmsg-editor").attr("data-current-index");
				resourceInfo.articles[index].title = $input.val();
				renderPreview(index);
			},
			modifyAuthor: function() {
				var $input = this;
				var index = +$input.parents(".appmsg-editor").attr("data-current-index");
				resourceInfo.articles[index].author = $input.val();
				renderPreview(index);
			},
			modifyDescription: function() {
				var $input = this;
				var index = +$input.parents(".appmsg-editor").attr("data-current-index");
				resourceInfo.articles[index].digest = $input.val();
				renderPreview(index);
			},
			modifyShowCoverPic: function() {
				var checked = this.get(0).checked;
				var index = getCurrentEditIndex();
				resourceInfo.articles[index].showCoverPic = checked;
			},
			modifyContentSourceUrl: function() {
				var $input = this;
				var index = +$input.parents(".appmsg-editor").attr("data-current-index");
				var contentSourceUrl = $input.val();
				if (!Helper.validation.isEmptyNull(contentSourceUrl) && !Helper.validation.isUrl(contentSourceUrl)) return Helper.errorToast("无效的原文链接地址！");
				resourceInfo.articles[index].contentSourceUrl = contentSourceUrl;
			},
			switchIndex: function() {
				var index = +this.attr("data-index");
				var currentIndex = getCurrentEditIndex();
				if (index == currentIndex) return;
				var article = resourceInfo.articles[currentIndex];
				article.content = editor.getContent();
				renderEditor(index);
			},
			addItem: function() {
				resourceInfo.articles.push({
					author: "",
					content: "",
					digest: "",
					xiaoxiaoUrl: "",
					title: "",
					showCoverPic: false,
					contentSourceUrl: ""
				});
				renderPreview(resourceInfo.articles.length - 1);
				renderEditor(resourceInfo.articles.length - 1);
			},
			removeItem: function() {
				var index = +this.attr("data-index");
				resourceInfo.articles.splice(index, 1);
				var currentIndex = getCurrentEditIndex();
				if (index == currentIndex) {
					index = 0;
				} else if (index < currentIndex) {
					renderPreview(currentIndex - 1);
					renderEditor(currentIndex - 1);
				} else {
					renderPreview(index);
					renderEditor(index);
				}

			},
			save: function() {
				var $btn = this;
				var currentIndex = getCurrentEditIndex();
				var article = resourceInfo.articles[currentIndex];
				article.content = editor.getContent();

				var validateResult = true;
				$(resourceInfo.articles).each(function(idx, article) {
					if (Helper.validation.isEmptyNull(article.title)) {
						renderEditor(idx);
						Helper.errorToast("请填写标题！");
						return validateResult = false;
					}
					if (Helper.validation.isEmptyNull(article.content)) {
						renderEditor(idx);
						Helper.errorToast("请填写正文！");
						return validateResult = false;
					}
					if (Helper.validation.isEmptyNull(article.xiaoxiaoUrl)) {
						renderEditor(idx);
						Helper.errorToast("请选择封面！");
						return validateResult = false;
					}
					if (!Helper.validation.isEmptyNull(article.contentSourceUrl) && !Helper.validation.isUrl(article.contentSourceUrl)) {
						renderEditor(idx);
						Helper.errorToast("无效的原文链接地址！");
						return validateResult = false;
					}
				});

				if (!validateResult) return;

				Helper.begin($btn);
				WechatResourceService.graphic.add(organizationId, JSON.stringify(resourceInfo.articles)).done(function(data) {
					Helper.successToast("添加成功");
					Helper.go("resource/weixin/graphic/list");
				}).fail(function(error) {
					Helper.alert(error);
				}).done(function() {
					Helper.end($btn);
				});
			}
		};
	};

	bC.extend(Controller);
	Controller.prototype.init = function() {
		resourceId = Helper.param.hash("resourceId");
		Helper.globalRender(template('app/templates/resource/weixin/graphic/edit', {}));
		this.render();
	};
	Controller.prototype.render = function(callback) {
		var controller = this;
		var getGraphicInfo = resourceId == "add" ? (function() {
			resourceInfo = {
				articles: [{
					"title": "",
					"xiaoxiaoUrl": "",
					"author": "",
					"digest": "",
					"showCoverPic": false,
					"content": "",
					"contentSourceUrl": ""
				}]
			};
		})() : WechatResourceService.graphic.get(resourceId).done(function(data) {
			resourceInfo = data.result;
			$(resourceInfo.articles).each(function(idx, article) {
				article.showCoverPic = article.show_cover_pic;
				article.contentSourceUrl = article.content_source_url;
				delete article.show_cover_pic;
				delete article.content_source_url;
			});
		});

		$.when(getGraphicInfo).done(function() {
			renderPreview(0);
			renderEditor(0);
		}).fail(function(error) {
			Helper.alert(error);
		}).always(function() {
			callback || (callback = controller.callback)
			Helper.execute(callback);
		});
	};

	// 渲染预览图
	function renderPreview(index) {
		$("#MediaPreviewArea").html(template("app/templates/resource/weixin/graphic/graphic-preview", {
			index: index,
			articles: resourceInfo.articles
		}));
	}

	// 渲染编辑框
	function renderEditor(index) {
		$("#MediaEditArea").html();
		var article = resourceInfo.articles[index];
		$("#MediaEditArea").html(template("app/templates/resource/weixin/graphic/graphic-edit", {
			index: index,
			article: article,
			count: resourceInfo.articles.length
		})).animate({
			"marginTop": index > 0 ? (index - 1) * 121 + 200 : 0
		}, 1000);

		setTimeout(function() {
			//富文本编辑器图片上传事件监听
			editor && editor.destroy();
			editor = RichTextEditor.init("Context");
		}, 100);
	}

	function getCurrentEditIndex() {
		return +$(".appmsg-editor").attr("data-current-index");
	}


	module.exports = Controller;

});