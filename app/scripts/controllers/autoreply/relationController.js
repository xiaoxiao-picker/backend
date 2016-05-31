define(function(require, exports, module) {
	var baseController = require('baseController');
	var bC = new baseController();

	var AutoreplyService = require('AutoreplyService');
	var EventService = require('EventService');
	var ArticleService = require('ArticleService');
	var VoteService = require('VoteService');
	var ProposalService = require('ProposalService');
	var QuestionnaireService = require('QuestionnaireService');
	var WallService = require('WallService');
	var PublicService = require("PublicService");

	var Helper = require("helper");
	var template = require('template');
	var Pagination = require('lib.Pagination');

	var tmp, callback, orgId, session, skip, limit, page;

	var PublicId, ReplyId, ReplyType, Keywords;
	var Articles, CurrentIndex, Sources, CurrentType;

	var SourceTypes = [{
		type: 'EVENT',
		title: '活动'
	}, {
		type: 'ARTICLE',
		title: '文章'
	}, {
		type: 'VOTE',
		title: '投票'
	}, {
		type: 'PROPOSAL',
		title: '提案'
	}, {
		type: 'POLL',
		title: '问卷'
	}, {
		type: 'WALL',
		title: '微信墙'
	}];

	var Controller = function() {
		var _controller = this;
		_controller.namespace = "autoreply.relation";
		_controller.actions = {
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
				var btn = this;
				if (Articles.length == 1 && !Articles[0].title) {
					Helper.errorToast("至少绑定一个项目！");
					return;
				};
				var param = {
					publicId: PublicId,
					replyId: ReplyId,
					replyType: ReplyType
				};
				if (ReplyType == 'KEYWORD') {
					if (!Keywords.length) {
						Helper.errorToast("至少添加一个关键字！");
						return;
					}
					var matchType = btn.parents("form").find("input[name='matchType']:checked").val();
					param.matchType = matchType;
					param.keywords = Keywords.join(',');
				};

				var articles = [];
				$.each(Articles, function(idx, article) {
					articles.push({
						id: article.id || "",
						sourceId: article.sourceId,
						sourceType: article.type,
						rank: idx + 1
					});
				});

				param.relationJsonStr = JSON.stringify(articles);

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
			switchType: function() {
				var _btn = this;

				CurrentType = _btn.attr("data-value");

				$(".appmsg-tabs li").removeClass('active');
				_btn.parents('li').addClass('active');

				page = 1;
				loadSources();
			},
			switchIndex: function() {
				var _btn = this;

				CurrentIndex = +_btn.attr("data-index");
				renderSelector();
			},
			addItem: function() {
				Articles.push({});
				renderPreview();
				CurrentIndex = Articles.length - 1;
				renderSelector();
			},
			removeItem: function() {
				var _btn = this;
				var index = +_btn.attr("data-index");
				Articles.splice(index, 1);
				if (index == CurrentIndex) {
					CurrentIndex = 0;
				} else if (index < CurrentIndex) {
					CurrentIndex--;
				}
				renderPreview();
				renderSelector();
			},
			selectArticle: function() {
				var _input = this;
				var index = +_input.val();
				var article = Articles[CurrentIndex];
				var source = Sources[index];

				article.type = source.type;
				article.sourceId = source.sourceId;
				article.title = source.title;
				article.picUrl = source.picUrl;
				article.description = source.description;

				renderPreview();
				renderCurrentSource();
			}
		}
	};

	bC.extend(Controller);
	Controller.prototype.init = function(templateName, fn) {
		ReplyType = Helper.param.hash('replyType');
		ReplyId = Helper.param.hash('replyId');
		orgId = App.organization.info.id;
		session = App.getSession();
		tmp = templateName;
		callback = fn;
		page = 1;
		limit = 10;

		Keywords = [];
		Articles = [{}];
		Sources = [];
		CurrentIndex = 0;
		CurrentType = "EVENT";

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
				var articles = data.result;

				Articles = [];
				$.each(articles, function(idx, article) {
					var data = dataToArticle(article.id, article.sourceType, article.source);
					Articles.push(data);
				});

				if (ReplyType == 'KEYWORD') {
					renderKeyword(function() {
						renderPreview();
						renderSelector();
					});
				} else {
					Helper.globalRender(template(tmp, {
						replyType: ReplyType,
						replyId: ReplyId,
						articles: Articles
					}));
					renderPreview();
					renderSelector();
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
			renderPreview();
			renderSelector();
			Helper.execute(callback);
		}


	};

	function renderKeyword(callback) {
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
				articles: Articles,
				matchType: matchType
			}));
			$("#keywordContainer").html(template('app/templates/autoreply/public/keywords', {
				targets: Keywords
			}));
			Helper.execute(callback);

		}).fail(function(error) {
			Helper.errorToast(error);
		});
	};

	function renderPreview() {
		$("#MediaPreviewArea").html(template("app/templates/autoreply/public/graphic-preview", {
			index: CurrentIndex,
			articles: Articles
		}));
	};

	function renderSelector() {
		CurrentType = Articles[CurrentIndex].type ? Articles[CurrentIndex].type : "EVENT";

		$("#MediaEditArea").html(template("app/templates/autoreply/public/relation-selector", {
			index: CurrentIndex,
			curType: CurrentType,
			sourceTypes: SourceTypes
		})).stop().animate({
			"marginTop": CurrentIndex > 0 ? (CurrentIndex - 1) * 121 + 200 : 0
		}, 1000);

		loadSources();
		renderCurrentSource();
	};

	function renderSources(type, data, total) {
		Sources = [];
		$.each(data, function(idx, source) {
			var resultData = dataToArticle("", type, source);
			Sources.push(resultData);
		});

		$("#SourcesBox").html(template("app/templates/autoreply/public/inner-sources", {
			index: CurrentIndex,
			curSource: Articles[CurrentIndex],
			curType: CurrentType,
			sources: Sources,
			limit: limit,
			page: page,
			pagination: Helper.pagination(total, limit, page)
		}));

		Pagination(total, limit, page, {
			container: $('#SourcesBox .footer'),
			theme: 'SIMPLE',
			switchPage: function(pageIndex) {
				page = pageIndex;
				loadSources();
			}
		});
	}

	/**
	 *	渲染已选项目
	 */
	function renderCurrentSource() {
		$("#CurSouresBox").html(template("app/templates/autoreply/public/inner-current-source", {
			source: Articles[CurrentIndex]
		}));
	}

	/**
	 *	根据[sourceType]加载数据列表
	 */
	function loadSources() {

		$("#SourcesBox").html(template('app/templates/partial/loading', {}));

		skip = (page - 1) * limit;
		if (CurrentType == "EVENT") {
			loadEvents();
		} else if (CurrentType == "ARTICLE") {
			loadArticles();
		} else if (CurrentType == "PROPOSAL") {
			loadProposals();
		} else if (CurrentType == "VOTE") {
			loadVotes();
		} else if (CurrentType == "POLL") {
			loadQuestionnaires();
		} else if (CurrentType == "WALL") {
			loadWalls();
		}
	}

	/**
	 *	加载活动数据
	 */
	function loadEvents() {
		EventService.list(orgId, 'PUBLISHED', skip, limit).done(function(data) {
			var events = data.result.data;
			var count = data.result.total;
			renderSources("EVENT", events, count);
		}).fail(function(error) {
			Helper.alert(error);
		});
	}

	/**
	 *	加载文章数据
	 */
	function loadArticles() {
		ArticleService.list(orgId, 'PUBLISHED', skip, limit).done(function(data) {
			var articles = data.result.data;
			var count = data.result.total;
			renderSources("ARTICLE", articles, count);
		}).fail(function(error) {
			Helper.alert(error);
		});
	}

	/**
	 *	加载提案数据
	 */
	function loadProposals() {
		ProposalService.getList({
			orgId: orgId,
			skip: skip,
			limit: limit
		}).done(function(data) {
			var proposals = data.result.data;
			var count = data.result.total;
			renderSources("PROPOSAL", proposals, count);
		}).fail(function(error) {
			Helper.alert(error);
		});
	}

	/**
	 *	加载投票数据
	 */
	function loadVotes() {
		VoteService.getList({
			organizationId: orgId,
			skip: skip,
			limit: limit
		}).done(function(data) {
			var votes = data.result.data;
			var count = data.result.total;
			renderSources("VOTE", votes, count);
		}).fail(function(error) {
			Helper.alert(error);
		});
	}

	/**
	 *	加载问卷数据
	 */
	function loadQuestionnaires() {
		var keyword = "";
		var state = "";
		QuestionnaireService.getList({
			organizationId: orgId,
			skip: skip,
			limit: limit,
			keyword: keyword,
			state: state
		}).done(function(data) {
			var questionnaires = data.result.data;
			var count = data.result.total;
			renderSources("POLL", questionnaires, count);
		}).fail(function(error) {
			Helper.alert(error);
		});
	}

	/**
	 *	加载微信墙数据
	 */
	function loadWalls() {
		WallService.getList({
			orgId: orgId,
			skip: skip,
			limit: limit
		}).done(function(data) {
			var walls = data.result.data;
			var count = data.result.total;
			renderSources("WALL", walls, count);
		}).fail(function(error) {
			Helper.alert(error);
		});
	};

	/**
	 * 根据type将不同结构的数据转换成统一的数据结构
	 */
	function dataToArticle(id, type, source) {
		source = source || {};
		if (type == "EVENT") {
			return {
				id: id,
				title: source.name,
				picUrl: source.thumbnailUrl,
				description: source.terse,
				type: "EVENT",
				sourceId: source.id
			}
		} else if (type == "ARTICLE") {
			return {
				id: id,
				title: source.name,
				picUrl: source.thumbnailUrl,
				description: source.terse,
				type: "ARTICLE",
				sourceId: source.id
			}
		} else if (type == "PROPOSAL") {
			return {
				id: id,
				title: source.title,
				picUrl: source.thumbnailUrls && source.thumbnailUrls.length ? source.thumbnailUrls[0] : '',
				description: source.text,
				type: "PROPOSAL",
				sourceId: source.id
			}
		} else if (type == "VOTE") {
			return {
				id: id,
				title: source.name,
				picUrl: source.thumbnailUrl,
				description: source.terse,
				type: "VOTE",
				sourceId: source.id
			}
		} else if (type == "POLL") {
			return {
				id: id,
				title: source.title,
				picUrl: source.thumbnail,
				description: source.terse,
				type: "POLL",
				sourceId: source.id
			}
		} else if (type == "WALL") {
			return {
				id: id,
				title: source.title,
				picUrl: source.backgroundImagUrl,
				description: source.title,
				type: "WALL",
				sourceId: source.id
			}
		}
	};

	// 提交
	function submit(btn, data, success) {
		var action = ReplyId != 'add' ? "update" : "add";
		(ReplyId == "add") && (delete data.replyId);
		Helper.begin(btn);
		AutoreplyService[action].relation(data).done(function(data) {
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
	// function activate() {
	// 	AutoreplyService.activate(ReplyId).done(function(data) {
	// 		Helper.successToast("保存并启用成功");
	// 		window.location.hash = "autoreply/" + ReplyType + "/list";
	// 	}).fail(function(error) {
	// 		Helper.errorToast(error);
	// 	});
	// };

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