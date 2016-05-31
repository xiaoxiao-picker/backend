define(function(require, exports, module) {
	var Helper = require("helper");
	var baseController = require('baseController');
	var bC = new baseController();

	var WallService = require('WallService');
	var PublicService = require("PublicService");
	var DatetimeGroup = require("lib.DatetimeGroup");

	var template = require('template');

	var WallModel = require("scripts/dataModels/wall/info");
	var Themes = require("scripts/controllers/wall/themes");

	var wallId, WallInfo, WallInfoClone;

	var Controller = function() {
		var _controller = this;
		_controller.namespace = "wall.edit";

		_controller.editing = false;
		_controller.autoSaveTips = "上墙页面正在编辑状态，自动保存？";
		_controller.autoSave = function(callback) {
			Helper.execute(callback);
			if (WallModel.validate(WallInfo).length > 0) {
				return;
			};

			Helper.confirm(_controller.autoSaveTips, function() {
				saveThen(null, function() {
					Helper.successToast("上墙自动保存成功！");
				}, function() {
					Helper.alert("上墙自动保存失败！");
				});
			});
		};

		_controller.actions = {
			voteManage: function() {
				jumpBeforeSave(this, 'VOTE', _controller);
			},
			lotteryManage: function() {
				jumpBeforeSave(this, 'LOTTERY', _controller);
			},
			inputModify: function() {
				var $input = this;
				var name = $input.attr("name");
				var value = $input.val();
				WallInfo[name] = value;
				_controller.editing = checkAdjusted();
			},
			openImageSelector: function() {
				require.async("ImageSelector", function(ImageSelector) {
					ImageSelector({
						title: '选择微信墙皮肤',
						systemCode: 'WECHAT_WALL',
						crop: {
							aspectRatio: 1440  /  1080
						},
						cut: function(imageUrl) {
							updatePic(this, imageUrl);
						},
						choose: function(imageUrls) {
							updatePic(this, imageUrls[0]);
						}
					});
				});

				function updatePic(selector, url) {
					WallInfo.themeData.backgroundImageUrl = url;
					$("#Profile_CUSTOM").attr("src", url + '@100w_72h_1e_1c');

					selector.destroy();
				}
			},
			modifyCheckBox: function() {
				var $input = this;
				var checked = $input.prop("checked");
				var attrName = $input.attr("name");
				WallInfo[attrName] = checked;
			},
			switchSponsor: function() {
				var $input = this;
				var checked = $input.prop("checked");
				var $content = $input.parents(".form-group").find(".xx-inner-content");
				var $image = $content.find(".sponsor-poster");
				if (checked) {
					$content.removeClass("hide");
				} else {
					$content.addClass("hide");
					WallInfo.sponsor = "";
					$image.attr("src", WallInfo.sponsor);
				}
			},
			selectWallSponsor: function() {
				var $btn = this;
				var $image = $btn.parents(".xx-inner-content").find(".sponsor-poster");
				require.async("ImageSelector", function(ImageSelector) {
					ImageSelector({
						title: "设置赞助商",
						crop: {
							aspectRatio: 1440  /  1080
						},
						cut: function(imageUrl) {
							updatePic(this, imageUrl);
						},
						choose: function(imageUrls) {
							updatePic(this, imageUrls[0]);
						}
					});
				});

				function updatePic(selector, url) {
					WallInfo.sponsor = url;
					$image.attr("src", url);

					selector.destroy();
				}
			},
			selectTheme: function() {
				var $themeBox = $(this).parents(".theme-container");
				var themeCode = $themeBox.attr("data-theme-code");
				if (themeCode == WallInfo.themeCode) {
					return;
				}
				if (themeCode == "CUSTOM" && !WallInfo.themeData.backgroundImageUrl) {
					return Helper.alert("请先编辑自定义主题！");
				}

				$themeBox.siblings(".theme-container").removeClass("active").find(".theme-selected").removeClass("choose");

				$themeBox.addClass("active");
				WallInfo.themeCode = themeCode;
			},

			previewTheme: function() {
				var themeCode = this.parents(".theme-container").attr("data-theme-code");
				var theme = themeCode == "CUSTOM" ? {
					code: "CUSTOM",
					name: "自定义",
					profile: WallInfo.themeData.backgroundImageUrl,
					previewProfile: WallInfo.themeData.backgroundImageUrl
				} : Themes.objOfAttr("code", themeCode);
				if (themeCode == "CUSTOM" && !WallInfo.themeData.backgroundImageUrl) {
					return Helper.alert("尚未上传图片，不能预览！");
				}
				var options = {
					"width": "600px;",
					"title": "主题【" + theme.name + "】预览图"
				}

				var modal = Helper.modal(options);
				var html = "<div class='wall-theme-preview-box'><img class='preview' src='" + theme.previewProfile + "' ></div> "
				modal.html(html);
			},

			// 保存
			save: function() {
				var btn = this;

				saveThen(btn, function(data) {
					_controller.editing = false;
					if (wallId == "add") {
						wallId = data.result;
						Helper.successToast("添加成功！");
						Helper.go("#walls");
					} else {
						Helper.successToast("修改成功！");
						Helper.go("#walls");
					}
				});
			},
			terseValidate: function() {
				var _input = this;
				var terse = _input.val();
				if (terse.length > 100) {
					terse = terse.substr(0, 100);
					_input.val(terse);
				}
				$("#TerseRemain").text(100 - terse.length);

				WallInfo.notice = terse;
			}
		};
	};

	bC.extend(Controller);
	Controller.prototype.init = function() {
		wallId = Helper.param.hash("wallId");
		this.render();
	};

	Controller.prototype.render = function() {
		var controller = this;
		var callback = this.callback;
		var templateUrl = this.templateUrl;
		var themes = Themes.clone();
		// 新建
		if (wallId == 'add') {
			WallInfo = {
				wallState: "CLOSED",
				themeCode: "RABBIT",
				themeData: {
					backgroundImageUrl: ""
				},
				needCheck: false,
				compulsivelyBindPhoneNumber: true
			};

			render();
			Helper.execute(callback);
			return;
		};
		// 已存在
		WallService.get(wallId).done(function(data) {
			WallInfo = WallModel.dataToModel(data.result);
			render();
		}).fail(function(error) {
			Helper.alert(error);
		}).always(function() {
			Helper.execute(callback);
		});

		function render() {
			WallInfoClone = $.extend(true, {}, WallInfo);
			themes.splice(0, 0, {
				code: "CUSTOM",
				name: "自定义",
				backgroundImage: WallInfo.themeData.backgroundImageUrl
			});
			var innerHtml = template(templateUrl, {
				wall: WallInfo,
				themes: themes
			});
			Helper.globalRender(innerHtml);

			DatetimeGroup(controller.dom.find(".datetimepicker-group"), {
				minErrorMessage: "开始时间不能大于结束时间",
				maxErrorMessage: "结束时间不能小于开始时间"
			});
		}
	};

	function saveThen(btn, success, error) {
		var messages = WallModel.validate(WallInfo);
		if (messages.length > 0) {
			Helper.alert("<p>" + messages.join("</p><p>") + "</p>");
			return;
		}

		var data = WallModel.modelToData(WallInfo);

		btn && Helper.begin(btn);
		var action = wallId == "add" ? WallService.add(Application.organization.id, data) : WallService.update(Application.organization.id, wallId, data);
		action.done(function(data) {
			Helper.execute(success, data);
		}).fail(function(error) {
			Helper.alert(error);
		}).always(function() {
			Helper.end(btn);
		});
	};

	function jumpBeforeSave(btn, type, controller) {
		if (wallId == "add") {
			Helper.alert("当前上墙尚未保存，不可进行该操作！");
			return;
		}

		var callback = function() {
			controller.editing = false;
			var jumpUrl = "";
			switch (type) {
				case 'VOTE':
					jumpUrl = "vote/relation/Wall/" + wallId + "/list?from=edit";
					break;
				case 'LOTTERY':
					jumpUrl = "lottery/relation/Wall/" + wallId + "/list?from=edit";
					break;
			}
			Helper.go(jumpUrl);
		};

		var adjustedFields = WallModel.getAdjustedFields(WallInfo, WallInfoClone);
		// 如果未做修改，直接跳转
		if (adjustedFields.length == 0) {
			Helper.execute(callback);
			return;
		}
		var tips = "<p>当前上墙已做如下修改：</p><p>" + adjustedFields.join(",") + "</p><p>是否保存再跳转？</p>";
		Helper.confirm(tips, {
			yesText: "保存并跳转",
			noText: "继续编辑"
		}, function() {
			saveThen(btn, callback);
		});
	};

	function checkAdjusted() {
		return WallModel.checkAdjusted(WallInfo, WallInfoClone);
	}

	module.exports = Controller;
});