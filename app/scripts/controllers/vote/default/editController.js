define(function(require, exports, module) {
	require("datetimepicker");

	var Helper = require("helper");
	var baseController = require('baseController');
	var template = require('template');
	var bC = new baseController();
	var PublicService = require("PublicService");
	var VoteService = require("VoteService");
	var WechatAttentionService = require("WechatAttentionService");

	var VoteModel = require("scripts/dataModels/vote/default/info");
	var DatetimeGroup = require("lib.DatetimeGroup");
	// var RichTextEditor = require("ueditor");

	var orgId;

	var voteId;
	var VoteInfo, VoteInfoClone;

	var Controller = function() {
		var _controller = this;
		_controller.namespace = "vote.edit";
		// 页面销毁
		_controller.destroy = function() {
			// UE.getEditor('context').destroy();
		};
		// 编辑状态
		_controller.editing = false;
		_controller.autoSaveTips = "投票处于编辑状态，自动保存修改？";
		// 自动保存
		_controller.autoSave = function(callback) {
			Helper.execute(callback);
			if (!VoteModel.validate(VoteInfo)) {
				return;
			};
			Helper.confirm(_controller.autoSaveTips, function() {
				saveThen(null, function() {
					Helper.successToast("投票自动保存成功！");
				}, function() {
					Helper.errorToast("投票自动保存失败！");
				});
			});
		};
		// 页面销毁
		_controller.destroy = function() {
			// UE.getEditor('context').destroy();
		};
		_controller.actions = {
			lotteryManage: function() {
				var btn = $(".content-body .btn-save");
				if (voteId == 'add') {
					return Helper.alert("当前投票未保存，不可添加抽奖！");
				}
				saveThen(btn, function() {
					_controller.editing = false;
					Helper.successToast("投票已自动保存！");
					Helper.go("lottery/relation/Vote/" + voteId + "/list?from=edit");
				});
			},
			// 普通输入框文字修改
			inputModify: function() {
				var _input = this;
				var name = _input.attr("name");
				var value = $.trim(_input.val());
				var type = _input.attr("data-type");

				if (type == "DATETIME") {
					VoteInfo[name] = value ? new Date(value).getTime() : "";
				} else if (type == "INT") {
					if (!Helper.validation.isIntNull(value)) {
						_input.val("");
						return;
					}
					VoteInfo[name] = value == "" ? "" : +value;
				} else {
					VoteInfo[name] = value;
				}

				_controller.editing = checkAdjusted();
			},
			// 修改简介
			terseModify: function() {
				var _input = this;
				var terse = $.trim(_input.val());
				if (terse.length > 200) {
					terse = terse.substr(0, 200);
					_input.val(terse);
				}
				$("#TerseRemain").text(200 - terse.length);
				VoteInfo.terse = terse;
				_controller.editing = checkAdjusted();
			},
			// 图片库选择器
			openImageSelector: function() {
				require.async("ImageSelector", function(ImageSelector) {
					ImageSelector({
						title: '选择投票海报',
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
					ImageCrop(VoteInfo.thumbnailUrl, {
						title: "剪切投票海报",
						cut: function(imageUrl) {
							updatePic(_controller, this, imageUrl);
						}
					});
				});
			},
			// 勾选框修改
			checkboxModify: function() {
				var _input = this;
				var name = _input.attr("name");
				var checked = _input.prop("checked");
				if (!checked && name == "compulsivelyBindPhoneNumber") {
					Helper.alert("不需要投票人员绑定手机号码可能存在刷票风险！");
				}
				if (name == "hideVotes") {
					VoteInfo[name] = !checked;
				} else {
					VoteInfo[name] = checked;
				}
				_controller.editing = checkAdjusted();
			},
			// 若设置关注后投票需要判断组织是否绑定微信公众号且已上传二维码名片
			needAttentionModify: function() {
				var _input = this;
				var checked = _input.prop("checked");
				// 关闭关注投票
				if (!checked) {
					setTimeout(function() {
						_input.removeAttr("checked");
						VoteInfo.permitAttentionComment = false;
						_controller.editing = checkAdjusted();
					}, 0);
					return;
				}
				// 开启关注投票
				if (!(App.organization.wechat && !!App.organization.wechat.id)) {
					Helper.alert("你需要绑定微信公众号才能使用该选项！");
					_input.removeAttr("checked");
					VoteInfo.permitAttentionComment = false;
					_controller.editing = checkAdjusted();
					return;
				} else if (!App.organization.wechat.qrCodeUrl) {
					Helper.alert("你需要在【公众号设置】=》【高级设置】中上传公众号二维码名片才能开启此选项！");
					_input.removeAttr("checked");
					VoteInfo.permitAttentionComment = false;
					_controller.editing = checkAdjusted();
					return;
				}
				setTimeout(function() {
					_input.prop("checked", true);
					VoteInfo.permitAttentionComment = true;
					_controller.editing = checkAdjusted();
				}, 0);
			},
			save: function() {
				var success = voteId ? function() {
					_controller.editing = false;
					Helper.successToast("投票保存成功");
					Helper.go("vote/default/list");
				} : function() {
					_controller.editing = false;
					Helper.successToast("投票保存成功");
					Helper.go("vote/default/" + voteId + "/edit");
				};

				saveThen(this, success, error);

				function error() {}
			},
			addOption: function() {
				var _btn = this;
				if (voteId != 'add') {
					openOptionEditor(0);
					return;
				}
				saveThen(null, function() {
					_controller.editing = false;
					Helper.successToast("投票保存成功");
					App.nextControllerAction = function() {
						openOptionEditor(0);
					};
					window.location.hash = "vote/" + voteId + "/edit";
				});
			},
			editOption: function() {
				var optionId = this.attr("data-value");
				openOptionEditor(optionId);
			},
			removeOption: function() {
				var _btn = this;
				var optionId = _btn.attr("data-value");
				Helper.confirm("确定删除该投票选项？", function() {
					Helper.begin(_btn);
					VoteService.option.remove(optionId).done(function(data) {
						renderOptions();
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
		orgId = App.organization.info.id;
		voteId = Helper.param.hash('voteId');

		this.render();
	};

	Controller.prototype.render = function() {
		var controller = this;
		var callback = this.callback;
		var templateUrl = this.templateUrl;

		var getVoteInfo = voteId == "add" ? (function() {
			VoteInfo = VoteModel.defaultModel();
		})() : VoteService.get(voteId).done(function(data) {
			var voteData = data.result;
			VoteInfo = VoteModel.dataToModel(voteData);
		});

		$.when(App.organization.getWechat(), getVoteInfo).done(function() {
			var bindWechat = App.organization.wechat && !!App.organization.wechat.id;
			VoteInfoClone = $.extend(true, {}, VoteInfo);
			Helper.globalRender(template(templateUrl, {
				vote: VoteInfo,
				bindWechat: bindWechat,
				organization: Application.organization
			}));
			renderOptions();
			DatetimeGroup(controller.dom.find(".datetimepicker-group"), {
				minErrorMessage: "投票开始时间不能大于结束时间",
				maxErrorMessage: "投票开始时间不能大于结束时间"
			});
			checkAdjusted();
			// var editor = RichTextEditor.init("context");
			// editor.addListener("contentchange", function() {
			// 	VoteInfo.description = UE.getEditor('context').getContent();
			// 	_controller.editing = checkAdjusted();
			// });
		}).fail(function(error) {
			Helper.alert(error);
		}).always(function() {
			Helper.execute(callback);
		});
	};


	// 保存投票信息
	function saveThen(btn, success, error) {
		if (VoteInfo.needAttention && (!(App.organization.wechat && !!App.organization.wechat.id))) {
			Helper.alert("当前组织未绑定微信公众平台，不能启用关注后投票！");
			// VoteInfo.needAttention = false;
			return;
		}

		// 投票详情暂时屏蔽
		// VoteInfo.description = UE.getEditor('context').getContent();

		// 验证投票信息
		var messages = VoteModel.validate(VoteInfo);
		if (messages.length > 0) {
			Helper.alert("<p>" + messages.join("</p><p>") + "</p>");
			return;
		}

		var formData = VoteModel.modelToData(VoteInfo);
		btn && Helper.begin(btn);
		var action = voteId == 'add' ? VoteService.add(orgId, formData) : VoteService.update(voteId, formData);
		action.done(function(data) {
			if (voteId == 'add') {
				voteId = data.result;
			};

			// 如果投票状态为关闭状态，则询问是否开启
			if (VoteInfo.state == "CLOSED") {
				openVote(success);
			} else {
				Helper.execute(success);
			}
		}).fail(function(errorMsg) {
			Helper.execute(error);
			Helper.alert(errorMsg);
		}).always(function() {
			btn && Helper.end(btn);
		});
	};

	// 开启投票
	function openVote(callback) {
		Helper.confirm("当前投票状态为关闭状态，是否开启？", function() {
			VoteService.open(voteId).done(function(data) {
				Helper.execute(callback);
			}).fail(function(error) {
				Helper.alert(error);
			});
		}, function() {
			Helper.execute(callback);
		});
	};

	// 检查是否有做改动
	function checkAdjusted() {
		var adjusted = VoteModel.checkAdjusted(VoteInfo, VoteInfoClone);
		adjusted ? $("#content .btn-save").removeAttr("disabled") : $("#content .btn-save").removeAttr("disabled");
		return adjusted;
	}

	// 渲染投票选项
	function renderOptions() {
		if (voteId != 'add') {
			VoteService.option.getList(voteId, 1, 1000).done(function(data) {
				var options = data.result;
				var count = options.length;
				$("#voteMembersContainer").html(template("app/templates/vote/default/members", {
					count: count,
					options: options
				}));
			}).fail(function(error) {
				Helper.alert(error);
			});
		} else {
			$("#voteMembersContainer").html(template("app/templates/vote/default/members", {
				count: 0,
				options: []
			}));
		}
	};

	// 打开选项编辑器
	function openOptionEditor(optionId, success) {
		require.async("scripts/lib/VoteOptionEditor", function(VoteOptionEditor) {
			VoteOptionEditor(voteId, optionId, {
				save: function() {
					Helper.execute(success);
					renderOptions();
					this.destroy();
				}
			});
		});
	};

	// 初始化时间选择器控件
	function initDatetimepicker() {
		$('.datetimepicker').datetimepicker({
			format: 'yyyy/mm/dd hh:ii',
			autoclose: true,
			language: 'zh-CN',
			pickerPosition: 'bottom-right'
		}).on("changeDate", function(evt) {
			var _input = $(this);
			var date = evt.date.valueOf();
			dateCompare.compare(_input, Helper.errorToast);
		});
	};

	function updatePic(controller, selector, url) {
		if (!VoteInfo.thumbnailUrl) {
			$(".xx-inner-content .btn-cut").removeClass('hide');
		}
		VoteInfo.thumbnailUrl = url;
		$("#VoteAvatar").attr("src", url);
		selector.destroy();
		controller.editing = true;
	}


	module.exports = Controller;
});