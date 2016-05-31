define(function(require, exports, module) {
	require("datetimepicker");

	var baseController = require('baseController');
	var bC = new baseController();
	var TicketService = require('TicketService');
	var Helper = require("helper");
	var template = require('template');

	// 报名所需信息处理函数库
	var REQUIREINFO = require("requireUserInfo");

	var orgId, eventId, sourceId;
	// 电子票信息，电子票信息克隆体
	var TicketInfo, TicketInfoClone;

	var Controller = function() {
		var _controller = this;
		_controller.namespace = "event.ticket.edit";

		// 编辑状态
		_controller.editing = false;
		_controller.autoSaveTips = "电子票处于编辑状态，自动保存修改？";
		// 自动保存
		_controller.autoSave = function(callback) {
			Helper.execute(callback);
			if (!validateTicketInfo(TicketInfo)) {
				// Helper.errorToast("电子票信息不完整，保存失败！");
				return;
			};
			Helper.confirm(_controller.autoSaveTips, function() {
				saveThen(null, function() {
					Helper.successToast("电子票自动保存成功！");
				}, function() {
					Helper.errorToast("电子票自动保存失败！");
				});
			});

		};

		_controller.actions = {
			// 电子票名称修改监听
			nameModify: function() {
				var _input = this;
				var value = $.trim(_input.val());
				TicketInfo.name = value;
				_controller.editing = checkAdjusted();
			},
			// 电子票数量修改监听
			countModify: function() {
				var _input = this;
				var value = +$.trim(_input.val());
				TicketInfo.count = value;
				_controller.editing = checkAdjusted();
			},
			// 电子票简介修改监听
			terseModify: function() {
				var _input = this;
				var terse = $.trim(_input.val());
				if (terse.length > 200) {
					terse = terse.substr(0, 200);
					_input.val(terse);
				}
				$("#TerseRemain").text(200 - terse.length);
				TicketInfo.terse = terse;
				_controller.editing = checkAdjusted();
			},
			modifyCheckBox: function() {
				var $input = this;
				var checked = $input.prop("checked");
				var attrName = $input.attr("name");
				TicketInfo[attrName] = checked;
			},
			tokenModify: function() {
				var _input = this;
				var value = $.trim(_input.val());
				TicketInfo.verificationToken = value;
				_controller.editing = checkAdjusted();
			},
			save: function() {
				var success = sourceId == "add" ? function() {
					_controller.editing = false;
					Helper.successToast("添加成功！");
					Helper.go("ticket/" + sourceId + "/edit");
				} : function() {
					_controller.editing = false;
					Helper.successToast("保存成功！");
					Helper.go("tickets");
				};
				saveThen(this, success);
			},
			// 添加自定义报名资料
			addElseInfo: function() {
				require.async("FormBox", function(FormBox) {
					FormBox({
						title: ""
					}, {
						title: '添加抢票所需资料',
						save: function(data) {
							var name = data.title;
							if (TicketInfo.requireElseInfos.indexOfAttr("title", name) > -1) {
								Helper.errorToast("报名所需资料不能重复！");
								return;
							}
							TicketInfo.requireElseInfos.push(data);
							renderRequireElseInfo();
							_controller.editing = checkAdjusted();
							this.destroy();
						}
					});
				});
			},
			checkElseInfo: function() {
				var _btn = this;
				var value = _btn.attr("data-value");
				var index = TicketInfo.requireElseInfos.indexOfAttr("title", value);
				var elseInfo = TicketInfo.requireElseInfos[index];

				require.async("FormBox", function(FormBox) {
					FormBox({
						title: elseInfo.title,
						type: elseInfo.type,
						required: elseInfo.required,
						options: elseInfo.options
					}, {
						title: '修改抢票所需资料',
						save: function(data) {
							var name = data.title;
							var index2 = TicketInfo.requireElseInfos.indexOfAttr("title", name);
							if (index2 > -1 && index2 != index) {
								Helper.errorToast("资料不能重复！");
								return;
							}
							TicketInfo.requireElseInfos[index] = data;
							renderRequireElseInfo();
							_controller.editing = checkAdjusted();
							this.destroy();
						}
					});
				});
			},
			// 删除自定义报名资料
			removeElseInfo: function() {
				var _btn = this;
				var value = _btn.attr("data-value");
				var index = TicketInfo.requireElseInfos.indexOfAttr("title", value);
				if (index == -1) return;

				TicketInfo.requireElseInfos.splice(index, 1);
				_btn.parents(".TagBox").slideUp(200, function() {
					this.remove();
				});
				_controller.editing = checkAdjusted();
			},
			switchBaseInfo: function() {
				var _btn = this;
				var value = _btn.attr("data-value");
				var index = TicketInfo.requireBaseInfos.indexOfAttr("value", value);
				if (index == -1) {
					Helper.alert('页面内部错误！');
					return;
				}
				TicketInfo.requireBaseInfos[index].selected = !TicketInfo.requireBaseInfos[index].selected;
				var selected = TicketInfo.requireBaseInfos[index].selected;
				_btn[selected ? "addClass" : "removeClass"]("xx-blue");
				_controller.editing = checkAdjusted();
			},


			// 打开电子票开启时间段
			addTimeModal: function() {
				var _btn = this;

				if (sourceId == 'add') {
					Helper.confirm('电子票保存后才可进行该操作，确认保存？', {
						yesText: "保存",
						noText: "继续编辑"
					}, function() {
						saveThen(_btn, function() {
							_controller.editing = false;
							App.nextControllerAction = function() {
								openTimeBox();
							};
							Helper.successToast("添加成功！");
							Helper.go("ticket/" + sourceId + "/edit");
						});
					});
				} else {
					openTimeBox();
				}

				function openTimeBox() {
					require.async('TicketTimeBox', function(TicketTimeBox) {
						TicketTimeBox(sourceId, {}, {
							title: '添加电子票开启时段及票数',
							sourceTimes: []
						}, {
							save: function() {
								timesRender();
								this.close();
							}
						});
					});
				};
			},
			updateTimeModal: function() {
				var _btn = this;
				var index = +_btn.attr("data-index");
				var timeInfo = TicketInfo.times[index];

				require.async('TicketTimeBox', function(TicketTimeBox) {
					TicketTimeBox(sourceId, timeInfo, {
						title: '修改电子票开启时段及票数',
						sourceTimes: TicketInfo.times
					}, {
						save: function() {
							timesRender();
							this.close();
						}
					});
				});
			},
			// 删除时间段
			removeTime: function() {
				var _btn = this;
				var timeId = _btn.attr("data-value");

				Helper.confirm("确认删除该时间段？", {}, function() {
					TicketService.time.remove(sourceId, timeId).done(function() {
						Helper.successToast('删除时间段成功!');
						timesRender();
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
	Controller.prototype.init = function(templateUrl, callback) {
		this.callback = callback;
		this.templateUrl = templateUrl;
		sourceId = Helper.param.hash('ticketId');
		orgId = App.organization.info.id;
		this.render();
	};
	/**
	 * 渲染函数，所有参数均来自Controller环境
	 */
	Controller.prototype.render = function() {
		var callback = this.callback;
		var templateUrl = this.templateUrl;

		var getTicketInfo = sourceId == "add" ? (function() {
			TicketInfo = dataToTicketInfo({
				compulsivelyBindPhoneNumber: true
			}, {});
		})() : TicketService.get(sourceId).done(function(data) {
			TicketInfo = dataToTicketInfo(data.result, data.result.register);
		});

		$.when(getTicketInfo).done(function() {
			TicketInfoClone = $.extend(true, {}, TicketInfo);
			Helper.globalRender(template(templateUrl, {
				ticket: TicketInfo
			}));
			sourceId != 'add' && timesRender();
			checkAdjusted();
		}).fail(function(error) {
			Helper.alert(error);
		}).always(function() {
			Helper.execute(callback);
		});
	};


	function saveThen(btn, success, error) {
		// 验证电子票信息
		var messages = validateTicketInfo(TicketInfo);
		if (messages.length > 0) {
			Helper.alert("<p>" + messages.join("</p><p>") + "</p>");
			return;
		}

		if (TicketInfo.verificationToken && !Helper.validation.isAuthCode(TicketInfo.verificationToken)) {
			Helper.errorToast('检票授权码为4-6位数字');
			return;
		};

		var formData = ticketInfoToData(TicketInfo);
		formData.sourceId = sourceId;

		var action = sourceId == 'add' ? 'add' : 'update';
		btn && Helper.begin(btn);
		TicketService[action](orgId, formData).done(function(data) {
			if (sourceId == 'add') {
				sourceId = data.result;
			};
			Helper.execute(success);
		}).fail(function(error) {
			Helper.execute(error);
			Helper.alert("电子票保存失败：" + error);
		}).always(function() {
			btn && Helper.end(btn);
		});

	};


	// 电子票信息转化为电子票数据模型
	function dataToTicketInfo(ticketVo, requiredVo) {
		ticketVo = ticketVo || {};
		requiredVo = requiredVo || {};
		var ticketInfo = {};
		$(["name", "openTimes", "terse", "count", "status", "compulsivelyBindPhoneNumber", "verificationToken"]).each(function(idx, item) {
			ticketInfo[item] = ticketVo.hasOwnProperty(item) ? ticketVo[item] : "";
		});
		// 电子票开启时间段
		ticketInfo.times = makeOpenTimes(ticketVo.openTimes);

		// 所需资料
		var texts = requiredVo.texts ? requiredVo.texts : [];
		var dates = requiredVo.dates ? requiredVo.dates : [];
		var images = requiredVo.images ? requiredVo.images : [];
		var choices = requiredVo.choices ? requiredVo.choices : [];
		ticketInfo.requireId = requiredVo.id || "";
		ticketInfo.requireBaseInfos = REQUIREINFO.makeBaseInfo(texts, dates, choices);
		ticketInfo.requireElseInfos = REQUIREINFO.makeElseInfo(texts, dates, choices, images);
		return ticketInfo;

		function makeOpenTimes(times) {
			times = times || [];
			var result = [];
			$(times).each(function(idx, time) {
				result.push({
					startDate: time.startDate,
					endDate: time.endDate
				});
			});
			return result;
		}
	};

	// 电子票数据模型转化为电子票信息以供提交
	function ticketInfoToData(ticketInfo) {
		var data = {
			name: ticketInfo.name || "",
			terse: ticketInfo.terse || "",
			compulsivelyBindPhoneNumber: ticketInfo.compulsivelyBindPhoneNumber,
			verificationToken: ticketInfo.verificationToken || ""
		};

		// 自定义信息
		var elseInfoData = REQUIREINFO.getRequireInfo(ticketInfo.requireBaseInfos, ticketInfo.requireElseInfos, ticketInfo.requireId);
		data.registerJson = JSON.stringify(elseInfoData);

		return data;
	};

	// 判断活动信息是否修改
	function checkAdjusted() {
		var adjusted = getAdjustedFields().length > 0;
		if (adjusted) {
			$(".btn-save").removeAttr("disabled");
		} else {
			$(".btn-save").removeAttr("disabled");
			// $(".btn-save").attr("disabled", "disabled");
		}
		return adjusted;
	};

	// 获取活动信息修改了的字段
	function getAdjustedFields() {
		var adjustedFields = [];
		var fields = [{
			field: "name",
			name: "电子票名称"
		}, {
			field: "count",
			name: "电子票数量"
		}, {
			field: "terse",
			name: "电子票简介"
		}, {
			field: "compulsivelyBindPhoneNumber",
			name: "是否需要抢票人员绑定手机号码"
		}, {
			field: "verificationToken",
			name: "检票权限码"
		}];
		$(fields).each(function(idx, item) {
			if (TicketInfo[item.field] != TicketInfoClone[item.field]) {
				adjustedFields.push(item.name);
			}
		});
		if (JSON.stringify(TicketInfo.times) != JSON.stringify(TicketInfoClone.times)) {
			adjustedFields.push("抢票时间段");
		}

		if (JSON.stringify(REQUIREINFO.getRequireInfo(TicketInfo.requireBaseInfos, TicketInfo.requireElseInfos, TicketInfo.requireId)) != JSON.stringify(REQUIREINFO.getRequireInfo(TicketInfoClone.requireBaseInfos, TicketInfo.requireElseInfos, TicketInfo.requireId)))
			adjustedFields.push("抢票所需资料");

		return adjustedFields;
	};

	// 保存时验证活动信息模型
	function validateTicketInfo(ticketInfo) {
		var fields = [{
			field: "name",
			message: "电子票名称不能为空"
		}, {
			field: "terse",
			message: "电子票简介不能为空"
		}];
		var messages = [];
		for (var i = 0; i < fields.length; i++) {
			var item = fields[i];
			if (Helper.validation.isEmptyNull(ticketInfo[item.field])) {
				messages.push(item.message);
			}
		}

		return messages;
	};

	// 添加自定义信息后重新渲染其他信息
	function renderRequireElseInfo() {
		$("#RequireElseInfoContainer").html(template("app/templates/public/require-info/else-infos", {
			requireElseInfos: TicketInfo.requireElseInfos
		}));
	}

	/**
	 * 自定义开启电子票时间段渲染
	 */
	function timesRender() {
		TicketService.time.getList(sourceId).done(function(data) {
			var times = data.result;
			TicketInfo.times = times;

			$("#TimesContainer").html(template("app/templates/ticket/edit-times", {
				times: times
			}));
		}).fail(function(error) {

		});

	};

	module.exports = Controller;
});