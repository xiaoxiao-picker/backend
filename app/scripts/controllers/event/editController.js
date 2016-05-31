define(function(require, exports, module) {
	require("plugins/select2/select2.js");
	
	var baseController = require('baseController');
	var bC = new baseController();
	var Helper = require("helper");
	var template = require('template');

	var EventService = require('EventService');

	// 报名所需信息处理函数库
	var REQUIREINFO = require("requireUserInfo");

	// 日期对比函数库
	var DatetimeGroup = require("lib.DatetimeGroup");
	var RichTextEditor = require("ueditor");

	var EventModel = require("scripts/dataModels/event/info");

	var orgId;
	var eventId;
	var EventInfo, EventInfoClone;
	var advAvailable;
	var editor;

	var Controller = function() {
		var _controller = this;
		_controller.namespace = "event.edit";
		// 编辑状态
		_controller.editing = false;
		_controller.autoSaveTips = "活动处于编辑状态，自动保存修改？";
		// 自动保存
		_controller.autoSave = function(callback) {
			Helper.execute(callback);
			if (EventModel.validate(EventInfo).length > 0) {
				return;
			};

			Helper.confirm(_controller.autoSaveTips, function() {
				saveThen(null, function() {
					Helper.successToast("活动自动保存成功！");
				}, function() {
					Helper.alert("活动自动保存失败！");
				});
			});
		};
		// 页面销毁
		_controller.destroy = function() {
			editor.destroy();
		};
		_controller.actions = {
			// 广告管理
			advertManage: function() {
				jumpBeforeSave(this, 'ADVERT', _controller);
			},
			// 分类管理
			classficationManage: function() {
				jumpBeforeSave(this, 'CATEGORY', _controller);
			},
			// 投票管理
			voteManage: function() {
				jumpBeforeSave(this, 'VOTE', _controller);
			},
			// 电子票管理
			ticketManage: function() {
				jumpBeforeSave(this, 'TICKET', _controller);
			},
			// 抽奖管理
			lotteryManage: function() {
				jumpBeforeSave(this, 'LOTTERY', _controller);
			},
			// 监控活动名称、地点、活动时间、分类、报名时间 等字段的修改情况
			inputModify: function() {
				var _input = this;
				var name = _input.attr("name");
				var value = _input.val();
				EventInfo[name] = value;
				_controller.editing = checkAdjusted();
			},
			// 监控简介修改
			terseModify: function() {
				var _input = this;
				var terse = _input.val();
				if (terse.length > 100) {
					terse = terse.substr(0, 100);
					_input.val(terse);
				}
				$("#TerseRemain").text(100 - terse.length);
				EventInfo.terse = terse;
				_controller.editing = checkAdjusted();
			},
			modifyCheckBox: function() {
				var $input = this;
				var checked = $input.prop("checked");
				var attrName = $input.attr("name");
				EventInfo[attrName] = checked;
			},
			// 控制是否能报名
			controllRegister: function() {
				var _input = this;
				var allowToSignUp = _input.prop("checked");

				if (allowToSignUp) {
					$("#RegisterInfo").removeClass("hide");
				} else {
					$("#RegisterInfo").addClass("hide");
				}
				EventInfo.allowToSignUp = allowToSignUp;
				_controller.editing = checkAdjusted();
			},
			// 保存
			save: function() {
				EventInfo.detail = editor.getContent();
				saveThen(this, function() {
					_controller.editing = false;
					Helper.go("events?state=" + EventInfo.state);
				});
			},
			// 发布
			publish: function() {
				var _btn = this;
				var state = EventInfo.state;
				EventInfo.detail = editor.getContent();
				Helper.confirm("活动发布后即对外开放，确定发布？", {}, function() {
					EventInfo.state = 'PUBLISHED';
					saveThen(_btn, function() {
						_controller.editing = false;
						Helper.successToast("发布成功！");
						Helper.go("events?state=PUBLISHED");
					}, function() {
						// 发布失败状态改回来
						EventInfo.state = state;
					});
				});
			},
			// 下线
			archive: function() {
				var _btn = this;
				var state = EventInfo.state;
				EventInfo.detail = editor.getContent();
				Helper.confirm("下线后活动将会移至已结束活动，仍继续？", {}, function() {
					EventInfo.state = 'ARCHIVED';
					saveThen(_btn, function() {
						_controller.editing = false;
						Helper.successToast("操作成功！");
						Helper.go("events?state=ARCHIVED");
					}, function() {
						// 发布失败状态改回来
						EventInfo.state = state;
					});
				});
			},
			// 移至回收站
			moveToDustbin: function() {
				var _btn = this;
				var state = EventInfo.state;
				EventInfo.detail = editor.getContent();
				Helper.confirm("删除后活动将会移至回收站，仍继续？", {}, function() {
					EventInfo.state = 'RUBBISH';
					saveThen(_btn, function() {
						_controller.editing = false;
						Helper.successToast("操作成功！");
						Helper.go("events?state=RUBBISH");
					}, function() {
						// 发布失败状态改回来
						EventInfo.state = state;
					});
				});
			},
			// 删除活动
			remove: function() {
				var _btn = this;
				EventInfo.detail = editor.getContent();
				Helper.confirm("彻底删除此活动？", {}, function() {
					Helper.begin(_btn);
					EventService.remove(orgId, eventId).done(function(data) {
						Helper.successToast("删除成功");
						Helper.go("events");
					}).fail(function(error) {
						Helper.alert(error);
					}).always(function() {
						Helper.end(_btn);
					});
				});
			},
			// 添加活动分类
			addCategory: function() {
				Helper.singleInputModal({
					title: '活动分类管理',
					id: "",
					name: "活动分类名称",
					placeholder: "请输入活动分类名称",
					value: "",
					action: function(modal) {
						var _btn = $(this);
						var _input = modal.box.find('.input');
						var categoryName = $.trim(_input.val());

						if (Helper.validation.isEmpty(categoryName)) {
							Helper.errorToast("分类名称不能为空");
							return;
						}

						Helper.begin(_btn);
						EventService.category.add(orgId, categoryName).done(function(data) {
							Helper.successToast("添加成功");
							var categoryId = data.result;
							App.organization.eventCategories.push({
								id: categoryId,
								name: categoryName
							});

							//默认添加关键词回复
							require.async('KeywordModel', function(KeywordModel) {
								KeywordModel.custom.event(categoryId, categoryName);
							});

							modal.close();
							renderEventCategories();
						}).fail(function(error) {
							Helper.errorToast(error);
							Helper.end(_btn);
						});
					}
				});
			},
			// 添加自定义报名所需资料
			addElseInfo: function() {
				require.async("FormBox", function(FormBox) {
					FormBox({
						title: ""
					}, {
						title: '添加报名所需资料',
						save: function(data) {
							var name = data.title;
							if (EventInfo.requireElseInfos.indexOfAttr("title", name) > -1) {
								Helper.errorToast("报名所需资料不能重复！");
								return;
							}
							EventInfo.requireElseInfos.push(data);
							renderRequireElseInfo();
							_controller.editing = checkAdjusted();
							this.close();
						}
					});
				});
			},
			checkElseInfo: function() {
				var _btn = this;
				var value = _btn.attr("data-value");
				var index = EventInfo.requireElseInfos.indexOfAttr("title", value);
				var elseInfo = EventInfo.requireElseInfos[index];

				require.async("FormBox", function(FormBox) {
					FormBox({
						title: elseInfo.title,
						type: elseInfo.type,
						required: elseInfo.required,
						options: elseInfo.options
					}, {
						title: '修改报名所需资料',
						save: function(data) {
							var name = data.title;
							var index2 = EventInfo.requireElseInfos.indexOfAttr("title", name);
							if (index2 > -1 && index2 != index) {
								Helper.errorToast("报名所需资料不能重复！");
								return;
							}
							EventInfo.requireElseInfos[index] = data;
							renderRequireElseInfo();
							_controller.editing = checkAdjusted();
							this.close();
						}
					});
				});
			},
			// 删除自定义报名资料
			removeElseInfo: function() {
				var _btn = this;
				var value = _btn.attr("data-value");
				var index = EventInfo.requireElseInfos.indexOfAttr("title", value);
				if (index == -1) return;

				EventInfo.requireElseInfos.splice(index, 1);
				_btn.parents(".TagBox").slideUp(200, function() {
					this.remove();
				});
				_controller.editing = checkAdjusted();
			},
			// 
			switchBaseInfo: function() {
				var _btn = this;
				var value = _btn.attr("data-value");
				var index = EventInfo.requireBaseInfos.indexOfAttr("value", value);
				if (index == -1) {
					Helper.alert('页面内部错误！');
					return;
				}
				EventInfo.requireBaseInfos[index].selected = !EventInfo.requireBaseInfos[index].selected;
				var selected = EventInfo.requireBaseInfos[index].selected;
				_btn[selected ? "addClass" : "removeClass"]("xx-blue");
				_controller.editing = checkAdjusted();
			},
			// 图片库选择器
			openImageSelector: function() {
				require.async("ImageSelector", function(ImageSelector) {
					ImageSelector({
						title: '选择活动海报',
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
					ImageCrop(EventInfo.thumbnailUrl, {
						title: "剪切活动海报",
						cut: function(imageUrl) {
							updatePic(_controller, this, imageUrl);
						}
					});
				});
			},
			// 添加时间段
			addSignUpTime: function() {
				var _btn = this;
				if (eventId == '0') {
					Helper.confirm('活动保存后才可进行该操作，确认保存？', {
						yesText: "保存",
						noText: "继续编辑"
					}, function() {
						saveThen(_btn, function() {
							App.nextControllerAction = function() {
								openTimeBox();
							};
							_controller.editing = false;
							Helper.go("event/" + eventId + "/edit");

						});
					});
				} else {
					openTimeBox();
				}

				function openTimeBox() {
					require.async('SignUpTimeBox', function(SignUpTimeBox) {
						SignUpTimeBox(eventId, {}, {
							title: '添加报名时间段',
							signUpTimes: EventInfo.signUpTimes
						}, {
							save: function() {
								renderTimes();
								this.close();
							}
						});
					});
				};
			},
			// 更新时间段
			updateSignUpTime: function() {
				var _btn = this;
				var index = _btn.attr("data-index");

				var timeInfo = EventInfo.signUpTimes[index];
				require.async('SignUpTimeBox', function(SignUpTimeBox) {
					SignUpTimeBox(eventId, timeInfo, {
						title: '修改报名时间段',
						signUpTimes: EventInfo.signUpTimes
					}, {
						save: function() {
							renderTimes();
							this.close();
						}
					});
				});
			},
			// 删除时间段
			removeSignUpTime: function() {
				var _btn = this;
				var signUpId = _btn.attr("data-value");

				Helper.confirm("确认删除该报名时段？", {}, function() {
					Helper.begin(_btn);
					EventService.signup.time.remove(eventId, signUpId).done(function(data) {
						Helper.successToast("删除成功");
						renderTimes();
					}).fail(function(error) {
						Helper.alert(error);
					}).always(function() {
						Helper.end(_btn);
					});
				});
			}
		};
	};
	bC.extend(Controller);
	/**
	 * 初始化变量，渲染模板
	 */
	Controller.prototype.init = function() {
		eventId = Helper.param.hash('eventId');
		orgId = App.organization.info.id;
		advAvailable = App.organization.config.advAvailable;
		EventInfo = null;
		this.render();
	};

	Controller.prototype.render = function() {
		var controller = this;

		var getEventInfo = eventId == "0" ? (function() {
			EventInfo = EventModel.dataToModel({
				state: "UNPUBLISHED",
				allowToSignUp: true,
				permitComment: true,
				showNumberOfSignUp: true,
				compulsivelyBindPhoneNumber: true
			}, {});
		})() : EventService.load(orgId, eventId).done(function(data) {
			var eventVo = data.result;
			var registerRequireVo = data.result.register;

			EventInfo = EventModel.dataToModel(eventVo, registerRequireVo);
		});

		$.when(App.organization.getEventCategories(true), getEventInfo).done(function() {
			EventInfoClone = $.extend(true, {}, EventInfo, {});
			Helper.globalRender(template(controller.templateUrl, {
				orgId: orgId,
				event: EventInfo,
				organization: Application.organization
			}));
			renderEventCategories();
			if (eventId != '0') {
				renderTimes();
			};
			addListener(controller);

			DatetimeGroup(controller.dom.find(".datetimepicker-group"), {
				minErrorMessage: "活动开始时间不能大于结束时间",
				maxErrorMessage: "活动结束时间不能小于开始时间"
			});
		}).fail(function(error) {
			Helper.alert(error);
		}).always(function() {
			Helper.execute(controller.callback);
		});
	};

	function renderTimes() {
		EventService.signup.time.list(eventId).done(function(data) {
			var signUpTimes = data.result;
			EventInfo.signUpTimes = signUpTimes;
			$(".times-container").html(template('app/templates/event/edit-times', {
				signUpTimes: signUpTimes
			}));
		}).fail(function(error) {
			Helper.alert(error);
		});

	};

	function saveThen(btn, success, error) {
		// EventInfo.detail = UE.getEditor('Context').getContent();
		// 验证活动信息
		var messages = EventModel.validate(EventInfo);
		if (messages.length > 0) {
			Helper.alert("<p>" + messages.join("</p><p>") + "</p>");
			return;
		}

		var formData = EventModel.modelToData(EventInfo);

		btn && Helper.begin(btn);
		var action = eventId != '0' ? 'update' : 'add';
		EventService[action](orgId, eventId, formData).done(function(data) {
			if (eventId == '0') {
				eventId = data.result;
			};
			Helper.execute(success);
		}).fail(function(error) {
			Helper.execute(error);
			Helper.alert(error);
		}).always(function() {
			btn && Helper.end(btn);
		});
	};

	function jumpBeforeSave(btn, type, controller) {
		if (eventId == '0') {
			Helper.alert("当前活动未保存，不可进行该操作！");
			return;
		}

		var callback = function() {
			controller.editing = false;
			var jumpUrl = "";
			switch (type) {
				case 'ADVERT':
					jumpUrl = "advertisement/EVENT/" + eventId + "/info?from=edit";
					break;
				case 'CATEGORY':
					jumpUrl = "event/categories?from=edit&targetId=" + eventId;
					break;
				case 'VOTE':
				case 'TICKET':
				case 'LOTTERY':
					jumpUrl = type.toLowerCase() + "/relation/Event/" + eventId + "/list?from=edit";
					break;
			}
			Helper.go(jumpUrl);
		};

		var adjustedFields = EventModel.getAdjustedFields(EventInfo, EventInfoClone);
		// 如果未做修改，直接跳转
		if (adjustedFields.length == 0) {
			Helper.execute(callback);
			return;
		}
		var tips = "<p>当前活动已做如下修改：</p><p>" + adjustedFields.join(",") + "</p><p>是否保存再跳转？</p>";
		Helper.confirm(tips, {
			yesText: "保存并跳转",
			noText: "继续编辑"
		}, function() {
			saveThen(btn, callback);
		});
	};

	function addListener(controller) {
		//富文本编辑器图片上传事件监听
		editor = RichTextEditor.init("Context");
		editor.addListener("contentchange", function() {
			EventInfo.detail = editor.getContent();
			controller.editing = checkAdjusted();
		});
	};


	// 活动分类下拉框渲染
	function renderEventCategories() {
		var options = App.organization.eventCategories.clone();
		options.splice(0, 0, {
			id: "",
			name: "未分类"
		});
		$(options).each(function(idx, item) {
			item.value = item.id;
			item.selected = item.id == EventInfo['category.id'];
		});
		$("#EventCategories").html(template("app/templates/public/option", {
			options: options
		})).select2({
			formatNoMatches: "暂无分类",
			placeholder: "选择文章分类",
			allowClear: true
		});
	};

	// 判断活动信息是否修改
	function checkAdjusted() {
		var adjusted = EventModel.checkAdjusted(EventInfo, EventInfoClone);
		if (adjusted) {
			$("#content .btn-save").removeAttr("disabled");
		} else {
			$("#content .btn-save").removeAttr("disabled");
			// $("#content .btn-save").attr("disabled", "disabled");
		}
		return adjusted;
	};

	// 添加自定义信息后重新渲染其他信息
	function renderRequireElseInfo() {
		$("#RequireElseInfoContainer").html(template("app/templates/public/require-info/else-infos", {
			requireElseInfos: EventInfo.requireElseInfos
		}));
	}

	function updatePic(controller, selector, url) {
		if (!EventInfo.thumbnailUrl) {
			$(".xx-inner-content .btn-cut").removeClass('hide');
		}
		EventInfo.thumbnailUrl = url;
		$("#EventAvatar").attr("src", url);
		selector.close();
		controller.editing = checkAdjusted();
	}

	module.exports = Controller;
});