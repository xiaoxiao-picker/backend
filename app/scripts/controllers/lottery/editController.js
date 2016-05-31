define(function(require, exports, module) {
	require("datetimepicker");

	var baseController = require('scripts/baseController');
	var template = require('template');
	var bC = new baseController();
	var LotteryService = require("LotteryService");
	var Helper = require("helper");
	// 日期对比函数库
	var dateCompare = require("dateCompare");
	var LotteryModel = require("scripts/dataModels/lottery/info");

	var orgId, lotteryId, LotteryInfo, LotteryInfoClone;

	var Controller = function() {
		var controller = this;
		controller.namespace = "lottery.edit";
		// 编辑状态
		controller.editing = false;
		controller.autoSaveTips = "抽奖处于编辑状态，自动保存修改？";
		// 自动保存
		controller.autoSave = function(callback) {
			Helper.execute(callback);
			if (!LotteryModel.validate(LotteryInfo)) {
				return;
			};
			Helper.confirm(controller.autoSaveTips, function() {
				saveThen(null, function() {
					Helper.successToast("抽奖自动保存成功！");
				}, function() {
					Helper.errorToast("抽奖自动保存失败！");
				});
			});
		};
		controller.actions = {
			// 普通输入框文字修改
			inputModify: function() {
				var _input = this;
				var name = _input.attr("name");
				var value = $.trim(_input.val());
				var type = _input.attr("data-type");

				if (type == "DATETIME") {
					LotteryInfo[name] = value ? new Date(value).getTime() : "";
				} else if (type == "INT") {
					if (!Helper.validation.isIntNull(value)) {
						_input.val("");
						return;
					}
					LotteryInfo[name] = value == "" ? "" : +value;
				} else {
					LotteryInfo[name] = value;
				}

				controller.editing = checkAdjusted();
			},
			descriptionModify: function() {
				var _input = this;
				var description = $.trim(_input.val());
				if (description.length > 200) {
					description = description.substr(0, 200);
					_input.val(description);
				}
				$("#DescriptionRemain").text(200 - description.length);
				LotteryInfo.description = description;
				controller.editing = checkAdjusted();
			},
			// 勾选框修改
			checkboxModify: function() {
				var _input = this;
				var name = _input.attr("name");
				var checked = _input.prop("checked");
				LotteryInfo[name] = checked;
				controller.editing = checkAdjusted();
			},
			// 添加自定义资料
			addElseInfo: function() {
				require.async("FormBox", function(FormBox) {
					FormBox({
						title: ""
					}, {
						title: '添加中奖所需资料',
						save: function(data) {
							var name = data.title;
							if (LotteryInfo.requireElseInfos.indexOfAttr("title", name) > -1) {
								Helper.errorToast("中奖所需资料不能重复！");
								return;
							}
							LotteryInfo.requireElseInfos.push(data);
							renderRequireElseInfo();
							controller.editing = checkAdjusted();
							this.destroy();
						}
					});
				});
			},
			checkElseInfo: function() {
				var _btn = this;
				var value = _btn.attr("data-value");
				var index = LotteryInfo.requireElseInfos.indexOfAttr("title", value);
				var elseInfo = LotteryInfo.requireElseInfos[index];

				require.async("FormBox", function(FormBox) {
					FormBox({
						title: elseInfo.title,
						type: elseInfo.type,
						required: elseInfo.required,
						options: elseInfo.options
					}, {
						title: '修改中奖所需资料',
						save: function(data) {
							var name = data.title;
							var index2 = LotteryInfo.requireElseInfos.indexOfAttr("title", name);
							if (index2 > -1 && index2 != index) {
								Helper.errorToast("资料不能重复！");
								return;
							}
							LotteryInfo.requireElseInfos[index] = data;
							renderRequireElseInfo();
							controller.editing = checkAdjusted();
							this.destroy();
						}
					});
				});
			},
			// 删除自定义资料
			removeElseInfo: function() {
				var _btn = this;
				var value = _btn.attr("data-value");
				var index = LotteryInfo.requireElseInfos.indexOfAttr("title", value);
				if (index == -1) return;

				LotteryInfo.requireElseInfos.splice(index, 1);
				_btn.parents(".TagBox").slideUp(200, function() {
					this.remove();
				});
				controller.editing = checkAdjusted();
			},
			switchBaseInfo: function() {
				var _btn = this;
				var value = _btn.attr("data-value");
				var index = LotteryInfo.requireBaseInfos.indexOfAttr("value", value);
				if (index == -1) {
					Helper.alert('页面内部错误！');
					return;
				}
				LotteryInfo.requireBaseInfos[index].selected = !LotteryInfo.requireBaseInfos[index].selected;
				var selected = LotteryInfo.requireBaseInfos[index].selected;
				_btn[selected ? "addClass" : "removeClass"]("xx-blue");
				controller.editing = checkAdjusted();
			},
			save: function() {
				var success = lotteryId != '0' ? function() {
					controller.editing = false;
					Helper.successToast("抽奖保存成功");
					Helper.go("lotteries");
				} : function() {
					controller.editing = false;
					Helper.successToast("抽奖保存成功");
					Helper.go("lottery/" + lotteryId + "/edit");
				};

				saveThen(this, success, function() {});
			},
			remove: function() {
				var btn = this;

				Helper.confirm("是否确认删除该抽奖？", {}, function() {
					Helper.begin(btn);
					LotteryService.remove(lotteryId).done(function() {
						Helper.go('lotteries');
					}).fail(function(error) {
						Helper.alert(error);
					}).always(function() {
						Helper.end(btn);
					});
				});
			},
			addAward: function() {
				if (lotteryId != '0') {
					openAwardModal();
					return;
				};
				saveThen(null, function() {
					controller.editing = false;
					Helper.successToast("抽奖保存成功");
					App.nextControllerAction = function() {
						openAwardModal();
					};
					window.location.hash = "lottery/" + lotteryId + "/edit";
				});
			},
			editAward: function() {
				var btn = this;
				var awardId = btn.attr('data-value');

				if (awardId) {
					openAwardModal(awardId);
				} else {
					openAwardModal(awardId, {
						name: LotteryInfo.thankYouText || '谢谢参与',
						portraitLotteryUrl: LotteryInfo.thankYouImageUrl || 'http://img.xiaoxiao.la//9907617a-bbab-4eb1-8c4c-bdd3c766e6af.png',
						type: 'SYSTEM'
					});
				}

			},
			removeAward: function() {
				var btn = this;
				var awardId = btn.attr('data-value');

				Helper.confirm("是否确认删除该奖品？", {}, function() {
					LotteryService.award.remove(lotteryId, awardId).done(function(data) {
						renderAwards();
					}).fail(function(error) {
						Helper.alert(error);
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
		lotteryId = Helper.param.hash('lotteryId');

		this.render();
	};

	Controller.prototype.render = function() {
		var controller = this;
		var callback = controller.callback;
		var templateUrl = controller.templateUrl;

		if (lotteryId == '0') {
			LotteryInfo = LotteryModel.dataToModel(LotteryModel.defaultModel(), {});
			renderInit();
		} else {
			LotteryService.get(lotteryId).done(function(data) {
				LotteryInfo = LotteryModel.dataToModel(data.result, data.result.register);
				renderInit();
			}).fail(function(error) {
				Helper.alert(error);
			});
		}

		function renderInit() {
			LotteryInfoClone = $.extend(true, {}, LotteryInfo);
			Helper.globalRender(template(templateUrl, {
				lottery: LotteryInfo
			}));
			initDatetimepicker();
			Helper.execute(callback);

			if (lotteryId != '0') {
				renderAwards();
			};
		};

	};

	function renderAwards() {
		LotteryService.award.getList(lotteryId).done(function(data) {
			var resultAwards = data.result;
			var awards = makeAwards(resultAwards.concat());

			// 奖品数量不得超过8个
			if (awards.length >= 8) {
				$('.btn-award-add').addClass('hide');
			} else {
				$('.btn-award-add').removeClass('hide');
			}

			$('.awards-wrapper').html(template('app/templates/lottery/edit-awards', {
				awards: awards
			}));
		}).fail(function(error) {
			Helper.alert(error);
		});
	};

	function makeAwards(awards) {
		var probability = 0;
		$.each(awards, function(idx, award) {
			if (Helper.validation.isEmptyNull(award.probability)) {
				award.probability = (100 - probability).toFixed(2);
				probability = 100;
				return false;
			};
			award.probability *= 100;
			probability += award.probability;
		});

		awards.push({
			name: LotteryInfo.thankYouText || '谢谢参与',
			portraitUrl: LotteryInfo.thankYouImageUrl || 'http://img.xiaoxiao.la//9907617a-bbab-4eb1-8c4c-bdd3c766e6af.png',
			portraitLotteryUrl: LotteryInfo.thankYouImageUrl || 'http://img.xiaoxiao.la//9907617a-bbab-4eb1-8c4c-bdd3c766e6af.png',
			probability: (100 - probability).toFixed(2)
		});

		return awards;
	};

	// 保存信息
	function saveThen(btn, success, error) {
		// 验证信息
		var messages = LotteryModel.validate(LotteryInfo);
		if (messages.length > 0) {
			Helper.alert("<p>" + messages.join("</p><p>") + "</p>");
			return;
		}

		var formData = LotteryModel.modelToData(LotteryInfo);
		if (formData.state != 'OPEN') {
			Helper.confirm("是否保存并开启该抽奖？", {}, function() {
				formData.state = 'OPEN';
				save();
			}, function() {
				save();
			});
		} else {
			save();
		}

		function save() {
			btn && Helper.begin(btn);
			var action = lotteryId == '0' ? LotteryService.add(orgId, formData) : LotteryService.update(orgId, lotteryId, formData);
			action.done(function(data) {
				if (lotteryId == '0') {
					lotteryId = data.result;
				};
				Helper.execute(success);
			}).fail(function(error) {
				Helper.alert(error);
				Helper.execute(error);
			}).always(function() {
				btn && Helper.end(btn);
			});
		}

	};

	// 检查是否有做改动
	function checkAdjusted() {
		var adjusted = LotteryModel.checkAdjusted(LotteryInfo, LotteryInfoClone);
		adjusted ? $("#content .btn-save").removeAttr("disabled") : $("#content .btn-save").removeAttr("disabled");
		return adjusted;
	}

	// 添加自定义信息后重新渲染其他信息
	function renderRequireElseInfo() {
		$("#RequireElseInfoContainer").html(template("app/templates/public/require-info/else-infos", {
			requireElseInfos: LotteryInfo.requireElseInfos
		}));
	}

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

	function openAwardModal(awardId, award) {
		require.async('scripts/lib/LotteryAwardEditor', function(LotteryAwardEditor) {
			new LotteryAwardEditor(lotteryId, awardId, {
				award: award,
				save: function(info) {
					this.destroy();
					if (award) {
						LotteryInfo.thankYouText = info.name,
							LotteryInfo.thankYouImageUrl = info.portraitLotteryUrl
					}
					renderAwards();
				}
			});
		});
	}

	module.exports = Controller;
});