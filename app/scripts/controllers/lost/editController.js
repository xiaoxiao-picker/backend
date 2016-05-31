define(function(require, exports, module) {
	require("datetimepicker");

	var baseController = require('baseController');
	var template = require('template');
	var bC = new baseController();
	var PublicService = require("PublicService");
	var LostService = require('LostService');
	var Helper = require("helper");

	// 日期对比函数库
	var dateCompare = require("dateCompare");

	var orgId, session, tmp, callback;

	var Type, LostId;
	var LostInfo; // 当前信息
	var LostInfoClone; // 记录初始值

	var Controller = function() {
		var _controller = this;
		this.namespace = "lost.edit";

		// 编辑状态
		_controller.editing = false;
		_controller.autoSaveTips = "当前处于编辑状态，自动保存修改？";

		// 自动保存
		_controller.autoSave = function(callback) {
			Helper.execute(callback);
			if (!validateLostInfo()) {
				// Helper.errorToast("信息不完整保存失败！");
				return;
			};
			Helper.confirm(_controller.autoSaveTips, function() {
				save(null, function() {
					Helper.successToast("自动保存成功！");
				}, function() {
					Helper.errorToast("自动保存失败！");
				});
			});
		};

		_controller.actions = {
			save: function() {
				var _btn = this;
				save(_btn, function() {
					Helper.successToast("保存成功！");
					_controller.editing = false;
					window.location.hash = "losts?type=" + Type;
				});
			},
			remove: function() {
				var _btn = this;

				Helper.confirm("确认删除该条" + (Type == "LOST" ? "失物招领" : "寻物启事") + "?", {}, function() {
					Helper.begin(_btn);
					LostService.remove(LostId).done(function(data) {
						Helper.successToast("删除成功！");
						Helper.go("losts?type=" + Type);
					}).fail(function(error) {
						Helper.alert(error);
					}).always(function() {
						Helper.end(_btn);
					});
				});
			},
			// 图片库选择器
			openImageSelector: function() {
				require.async("ImageSelector", function(ImageSelector) {
					ImageSelector({
						title: '选择照片',
						optionLimit: 10,
						choose: function(imageUrls) {
							updatePic(this, imageUrls);
						}
					});
				});

				function updatePic(selector, urls) {
					LostInfo.picUrls = LostInfo.picUrls.concat(urls);
					selector.destroy();
					renderPhotos();
					checkEditing(_controller);
				}
			},
			removeImage: function() {
				var _btn = this,
					index = _btn.attr("data-index");

				LostInfo.picUrls.remove(index);
				_btn.parents(".photo-wrapper").remove();

				checkEditing(_controller);
			},
			titleModify: function() {
				LostInfo.title = this.val();
				checkEditing(_controller);
			},
			locationModify: function() {
				LostInfo.location = this.val();
				checkEditing(_controller);
			},
			eventDateModify: function() {
				LostInfo.eventDate = this.val();
				checkEditing(_controller);
			},
			textModify: function() {
				LostInfo.text = this.val();
				checkEditing(_controller);
			},
			nameModify: function() {
				LostInfo.contactInfo.name = this.val();
				checkEditing(_controller);
			},
			phoneModify: function() {
				LostInfo.contactInfo.phone = this.val();
				checkEditing(_controller);
			},
			qqModify: function() {
				LostInfo.contactInfo.QQ = this.val();
				checkEditing(_controller);
			}
		};
	};

	bC.extend(Controller);
	Controller.prototype.init = function(templateName, fn) {
		tmp = templateName;
		callback = fn;
		session = App.getSession();
		orgId = App.organization.info.id;
		Type = Helper.param.search("type") || "LOST";
		LostId = Helper.param.hash('lostId');

		LostInfo = null;
		LostInfoClone = null;

		render();
	};


	// 渲染函数
	function render() {
		if (LostId != '0') {
			LostService.get(orgId, LostId).done(function(data) {
				LostInfo = data.result;
				LostInfo.contactInfo = $.parseJSON(LostInfo.contactInfo);

				if (Type == "LOST") {
					LostInfo.picUrls = LostInfo.picUrls ? LostInfo.picUrls.split(',') : [];
				};

				LostInfoClone = $.extend(true, {}, LostInfo);

				Helper.globalRender(template(tmp, {
					lost: LostInfo,
					type: Type,
					title: Type == "LOST" ? "编辑失物" : "编辑寻物",
					subTitle: Type == "LOST" ? "拾物" : "失物"
				}));
				initDatetimepicker();
			}).fail(function(error) {
				Helper.alert(error);
			}).always(function() {
				Helper.execute(callback);
			});

		} else {
			LostInfo = {
				picUrls: [],
				contactInfo: {},
				type: Type
			};
			LostInfoClone = $.extend(true, {}, LostInfo);

			Helper.globalRender(template(tmp, {
				lost: LostInfo,
				type: Type,
				title: Type == "LOST" ? "编辑失物" : "编辑寻物",
				subTitle: Type == "LOST" ? "拾物" : "失物"
			}));
			initDatetimepicker();
			Helper.execute(callback);
		}

	};

	function renderPhotos() {
		$(".photos-box").html(template("app/templates/lost/edit-photos", {
			lost: LostInfo
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

	function save(btn, successFnc, errorFnc) {
		if (!validateLostInfo()) return;
		var data = getCommitLostInfo();

		btn && Helper.begin(btn);
		if (LostId != '0') {
			LostService.update(orgId, LostId, data).done(function(data) {
				successFnc();
			}).fail(function(error) {
				Helper.alert(error);
				Helper.execute(error);
			}).always(function() {
				btn && Helper.end(btn);
			});
		} else {
			LostService.add(orgId, data).done(function(data) {
				successFnc();
			}).fail(function(error) {
				Helper.alert(error);
				Helper.execute(error);
			}).always(function() {
				btn && Helper.end(btn);
			});
		}
	}

	// 检查页面是否已编辑
	function checkEditing(controller) {
		var editing = false;
		$.each(["title", "location", "eventDate", "text"], function(idx, key) {
			if (LostInfo[key] !== LostInfoClone[key]) {
				editing = true;
				return false;
			}
		});
		$.each(["name", "phone", "QQ"], function(idx, key) {
			if (LostInfo.contactInfo[key] !== LostInfoClone.contactInfo[key]) {
				editing = true;
				return false;
			}
		});
		if (Type == "LOST") {
			if (LostInfo.picUrls.join(',') !== LostInfoClone.picUrls.join(',')) {
				editing = true;
			}
		};
		controller.editing = editing;
		if (editing) {
			$(".btn-save").removeAttr("disabled");
		} else {
			$(".btn-save").attr("disabled", "disabled");
		}
		return editing;
	};

	// 根据当前文章信息获取提交数据
	function getCommitLostInfo() {
		var data = {
			contactInfo: {}
		};
		$.each(["title", "location", "text", "type"], function(idx, key) {
			var value = LostInfo[key];
			if (value) {
				data[key] = value;
			}
		});
		data["eventDate"] = new Date(LostInfo["eventDate"]).getTime();
		data.contactInfo = JSON.stringify(LostInfo.contactInfo);
		if (Type == "LOST") {
			data.picUrls = LostInfo.picUrls.join(',');
		}

		return data;
	};

	// 检查信息是否有效
	function validateLostInfo() {
		var result = true;
		if (Helper.validation.isEmptyNull(LostInfo.title)) {
			Helper.errorToast("名称不能为空！");
			result = false;
			return result;
		}
		if (Helper.validation.isEmptyNull(LostInfo.location)) {
			Helper.errorToast("地点不能为空！");
			result = false;
			return result;
		}
		if (Helper.validation.isEmptyNull(LostInfo.eventDate)) {
			Helper.errorToast("时间不能为空！");
			result = false;
			return result;
		}
		if (Helper.validation.isEmptyNull(LostInfo.text)) {
			Helper.errorToast("简介不能为空！");
			result = false;
			return result;
		}
		if (Helper.validation.isEmptyNull(LostInfo.contactInfo.name)) {
			Helper.errorToast("联系人不能为空！");
			result = false;
			return result;
		}
		if (Helper.validation.isEmptyNull(LostInfo.contactInfo.phone)) {
			Helper.errorToast("联系方式不能为空！");
			result = false;
			return result;
		}
		if (!Helper.validation.isPhoneNumber(LostInfo.contactInfo.phone)) {
			Helper.errorToast("联系方式格式不正确！");
			result = false;
			return result;
		}
		
		return result;
	}

	module.exports = Controller;
});