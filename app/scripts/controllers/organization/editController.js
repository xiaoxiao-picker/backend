define(function(require, exports, module) {
	require("plugins/select2/select2.js");
	var baseController = require('baseController');
	var bC = new baseController();

	var Helper = require("helper");
	var template = require('template');

	var OrganizationService = require('OrganizationService');
	var PublicService = require("PublicService");

	var RichTextEditor = require("ueditor");
	var UserSelector = require('UserSelector');

	// 报名所需信息处理函数库
	var REQUIREINFO = require("requireUserInfo");

	var orgId, OrgInfo, OrgInfoClone;

	var editor;

	var Controller = function() {
		var _controller = this;
		_controller.namespace = "organization.edit";
		// 页面销毁
		_controller.destroy = function() {
			editor.destroy();
		};
		// 编辑状态
		_controller.editing = false;
		_controller.autoSaveTips = "组织信息处于编辑状态，自动保存修改？";
		// 自动保存
		_controller.autoSave = function(callback) {
			Helper.execute(callback);
			if (!validateOrgInfo(OrgInfo)) {
				// Helper.errorToast("组织信息不完整，保存失败！");
				return;
			};
			Helper.confirm(_controller.autoSaveTips, function() {
				saveThen(null, function() {
					Helper.successToast("组织信息自动保存成功！");
				}, function() {
					Helper.errorToast("组织信息自动保存失败！");
				});
			});

		};

		_controller.actions = {
			// 修改组织名称
			nameModify: function() {
				var _input = this;
				var value = _input.val();
				OrgInfo.name = value;
				_controller.editing = checkAdjusted();
			},
			// 修改联系邮箱
			emailModify: function() {
				var _input = this;
				var value = _input.val();
				OrgInfo.email = value;
				_controller.editing = checkAdjusted();
			},
			// 选择联系人
			selectorDirector: function() {
				var _input = this.parents(".input-group").find(".form-control");
				UserSelector({
					title: '选择组织联系人',
					limit: 1,
					// curMembers: OrgInfo.director ? [OrgInfo.director.id] : [],
					confirm: function(members) {
						var member = members[0];
						var selector = this;
						_input.val(member.remark || member.user.name || member.user.nickname || member.user.phoneNumber);
						selector.destroy();
						OrgInfo.director = member;
						_controller.editing = checkAdjusted();
					}
				});
			},
			// 修改组织类型
			orgTypeModify: function() {
				var _input = this;
				var value = _input.val();
				OrgInfo.orgType = value;
				_controller.editing = checkAdjusted();
			},
			// 图片库选择器
			openImageSelector: function() {
				require.async("ImageSelector", function(ImageSelector) {
					ImageSelector({
						title: '选择组织Logo',
						crop: {
							preview: true,
							borderRadius: true,
							aspectRatio: 1,
							previewWidth: 100,
							previewHeight: 100
						},
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
					ImageCrop(OrgInfo.logoUrl, {
						title: "剪切组织Logo",
						preview: true,
						jcrop: {
							borderRadius: true,
							aspectRatio: 1,
							previewWidth: 100,
							previewHeight: 100
						},
						cut: function(imageUrl) {
							updatePic(_controller, this, imageUrl);
						}
					});
				});
			},
			save: function(evt) {
				OrgInfo.description = editor.getContent();
				saveThen(this, function() {
					_controller.editing = false;
					Helper.successToast("保存成功！");
					Helper.go("#index");
				});
			},
			// 添加自定义报名资料
			addElseInfo: function() {
				require.async("FormBox", function(FormBox) {
					FormBox({
						title: ""
					}, {
						title: '添加申请加入组织所需资料',
						save: function(data) {
							var name = data.title;
							if (OrgInfo.requireElseInfos.indexOfAttr("title", name) > -1) {
								Helper.errorToast("所需资料不能重复！");
								return;
							}
							OrgInfo.requireElseInfos.push(data);
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
				var index = OrgInfo.requireElseInfos.indexOfAttr("title", value);
				var elseInfo = OrgInfo.requireElseInfos[index];

				require.async("FormBox", function(FormBox) {
					FormBox({
						title: elseInfo.title,
						type: elseInfo.type,
						required: elseInfo.required,
						options: elseInfo.options
					}, {
						title: '修改申请加入组织所需资料',
						save: function(data) {
							var name = data.title;
							var index2 = OrgInfo.requireElseInfos.indexOfAttr("title", name);
							if (index2 > -1 && index2 != index) {
								Helper.errorToast("所需资料不能重复！");
								return;
							}
							OrgInfo.requireElseInfos[index] = data;
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
				var index = OrgInfo.requireElseInfos.indexOfAttr("title", value);
				if (index == -1) return;

				OrgInfo.requireElseInfos.splice(index, 1);
				_btn.parents(".TagBox").slideUp(200, function() {
					this.remove();
				});
				_controller.editing = checkAdjusted();
			},
			switchBaseInfo: function() {
				var _btn = this;
				var value = _btn.attr("data-value");
				var index = OrgInfo.requireBaseInfos.indexOfAttr("value", value);
				if (index == -1) {
					Helper.alert('页面内部错误！');
					return;
				}
				OrgInfo.requireBaseInfos[index].selected = !OrgInfo.requireBaseInfos[index].selected;
				var selected = OrgInfo.requireBaseInfos[index].selected;
				_btn[selected ? "addClass" : "removeClass"]("xx-blue");
				_controller.editing = checkAdjusted();
			},

			// 是否为学校组织
			schoolState: function() {
				var isSchool = $("input[name=isSchool]:checked").val();
				if (isSchool == "true") {
					OrgInfo.isSchool = true;
					_controller.editing = checkAdjusted();
					$("#SchoolContainer").removeClass("hide");
				} else {
					OrgInfo.isSchool = false;
					_controller.editing = checkAdjusted();
					$("#SchoolContainer").addClass("hide");
				}
			},
			// 选择学校
			selectSchool: function() {
				require.async('SchoolSelector', function(SchoolSelector) {
					SchoolSelector({
						select: function(school) {
							var selector = this;
							$("#SchoolText").val(school.name);
							$("#SchoolText").attr("data-value", school.id);
							selector.destroy();
							OrgInfo.school = school;
							_controller.editing = checkAdjusted();
						}
					});
				});
			},
			// 是否允许申请加入组织
			permitModify: function() {
				var permit = $("input[name=permit]:checked").val();
				if (permit == "true") {
					OrgInfo.permit = true;
					_controller.editing = checkAdjusted();
					$("#PermitContainer").removeClass("hide");
				} else {
					OrgInfo.permit = false;
					_controller.editing = checkAdjusted();
					$("#PermitContainer").addClass("hide");
				}
			}
		};
	};

	bC.extend(Controller);
	Controller.prototype.init = function(templateUrl, callback) {
		var _controller = this;
		orgId = App.organization.info.id;

		// 获取申请加入组织条件
		var getApplyCondition = OrganizationService.condition.get(orgId).fail(function(error) {
			Helper.alert(error);
		});

		$.when(App.organization.reload(), getApplyCondition).done(function(data1, data2) {
			OrgInfo = dataToOrgInfo(data1.result, data2.result);
			OrgInfoClone = $.extend(true, {}, OrgInfo);
			Helper.globalRender(template(templateUrl, {
				org: OrgInfo
			}));
			addListener(_controller);
		}).always(function() {
			Helper.execute(callback);
		});

		// 页面初始化
		function addListener(controller) {
			$("select[name=orgType]").select2();

			editor = RichTextEditor.init("Context");
			editor.addListener("contentchange", function() {
				OrgInfo.description = editor.getContent();
				controller.editing = checkAdjusted();
			});
		}
	};


	function saveThen(btn, success, error) {
		var messages = validateOrgInfo(OrgInfo);
		if (messages.length > 0) {
			Helper.alert("<p>" + messages.join("</p><p>") + "</p>");
			return;
		}

		var formData = orgInfoToData(OrgInfo);
		var requiredData = orgInfoToRequiredData(OrgInfo);

		btn && Helper.begin(btn);
		// 更新组织基础信息
		var updateOrganizationInfo = OrganizationService.update(orgId, formData).done(function(data) {
			App.organization.info.name = formData.name;
			App.organization.info.logoUrl = formData.logoUrl;
			App.organization.info.director = OrgInfo.director;
			$(".org-name-" + orgId).text(formData.name);
			$(".org-avatar-" + orgId).attr("src", formData.logoUrl);
		}).fail(function(error) {
			Helper.alert(error);
		});
		// 保存申请加入组织所需资料
		var action = OrgInfo.hasJoinedCondition ? "update" : "add";
		var updateApplyCondition = OrganizationService.condition[action](orgId, requiredData).fail(function(error) {
			Helper.alert(error);
		})

		$.when(updateOrganizationInfo, updateApplyCondition).done(function() {
			Helper.execute(success);
		}).fail(function() {
			btn && Helper.execute(error);
		}).always(function() {
			btn && Helper.end(btn);
		});;
	};



	// 数据转化为模型
	function dataToOrgInfo(orgVo, requiredVo) {
		var info = {
			// 是否已设置过申请加入组织的条件
			// 保存时根据该值判断添加修改
			hasJoinedCondition: requiredVo ? true : false
		};
		orgVo = orgVo || {};
		requiredVo = requiredVo || {};
		$(["id", "name", "logoUrl", "description", "email", "orgType", "isSchool", "permit"]).each(function(idx, item) {
			(orgVo.hasOwnProperty(item)) && (info[item] = orgVo[item]);
		});

		info.orgType = info.orgType ? info.orgType : "管理";
		info.director = orgVo.director ? orgVo.director : {};
		info.school = orgVo.school ? orgVo.school : {};

		var texts = requiredVo.texts ? requiredVo.texts : [];
		var dates = requiredVo.dates ? requiredVo.dates : [];
		var images = requiredVo.images ? requiredVo.images : [];
		var choices = requiredVo.choices ? requiredVo.choices : [];
		info.requireId = requiredVo.id || "";
		info.requireBaseInfos = REQUIREINFO.makeBaseInfo(texts, dates, choices);
		info.requireElseInfos = REQUIREINFO.makeElseInfo(texts, dates, choices, images);
		return info;
	};
	// 数据模型转换为提交数据
	function orgInfoToData(orgInfo) {
		var data = {};
		// 活动信息
		$(["name", "logoUrl", "description", "email", "orgType", "isSchool", "permit"]).each(function(idx, item) {
			orgInfo.hasOwnProperty(item) && (data[item] = orgInfo[item]);
		});
		if (orgInfo.director.user) {
			data["director.user.id"] = orgInfo.director.user.id;
		}
		if (orgInfo.school.id) {
			data["school.id"] = orgInfo.school.id;
		}
		return data;
	};
	// 从数据模型提取申请加入组织所需资料信息
	function orgInfoToRequiredData(orgInfo) {
		var data = REQUIREINFO.getRequireInfo(orgInfo.requireBaseInfos, orgInfo.requireElseInfos, orgInfo.requireId);
		return JSON.stringify(data);
	};

	// 保存时验证信息模型
	function validateOrgInfo(orgInfo) {
		var fields = [{
			field: "name",
			message: "组织名称不能为空"
		}, {
			field: "logoUrl",
			message: "组织logo不能为空"
		}, {
			field: "email",
			message: "联系邮箱不能为空"
		}, {
			field: "description",
			message: "组织简介不能为空"
		}];
		var messages = [];
		for (var i = 0; i < fields.length; i++) {
			var item = fields[i];
			if (Helper.validation.isEmptyNull(orgInfo[item.field])) {
				messages.push(item.message);
			}
		}
		if (!orgInfo.director.id) {
			messages.push("组织联系人不能为空！");
		}
		if (!Helper.validation.isEmail(orgInfo.email)) {
			messages.push("联系邮箱格式不正确！");
		}
		if (orgInfo.isSchool && !orgInfo.school) {
			messages.push("所属学校不能为空！");
		}
		return messages;
	};

	// 判断活动信息是否修改
	function checkAdjusted() {
		var adjusted = getAdjustedFields().length > 0;
		if (adjusted) {
			$(".btn-save").removeAttr("disabled");
		} else {
			$(".btn-save").attr("disabled", "disabled");
		}
		return adjusted;
	};

	// 获取活动信息修改了的字段
	function getAdjustedFields() {
		var adjustedFields = [];
		var fields = [{
			field: "name",
			name: "组织名称"
		}, {
			field: "logoUrl",
			name: "组织logo"
		}, {
			field: "email",
			name: "联系邮箱"
		}, {
			field: "orgType",
			name: "组织类型"
		}, {
			field: "isSchool",
			name: "是否为学校组织"
		}, {
			field: "description",
			name: "组织简介"
		}, {
			field: "permit",
			name: "是否允许申请加入"
		}];
		$(fields).each(function(idx, item) {
			if (OrgInfo[item.field] != OrgInfoClone[item.field]) {
				adjustedFields.push(item.name);
			}
		});

		if (OrgInfo.school.id != OrgInfoClone.school.id) {
			adjustedFields.push("所属学校");
		}
		if (OrgInfo.director.id != OrgInfoClone.director.id) {
			adjustedFields.push("组织联系人");
		}


		if (JSON.stringify(REQUIREINFO.getRequireInfo(OrgInfo.requireBaseInfos, OrgInfo.requireElseInfos, OrgInfo.requireId)) != JSON.stringify(REQUIREINFO.getRequireInfo(OrgInfoClone.requireBaseInfos, OrgInfoClone.requireElseInfos, OrgInfo.requireId)))
			adjustedFields.push("申请加入组织所需资料");

		return adjustedFields;
	};

	// 添加自定义信息后重新渲染其他信息
	function renderRequireElseInfo() {
		$("#RequireElseInfoContainer").html(template("app/templates/public/require-info/else-infos", {
			requireElseInfos: OrgInfo.requireElseInfos
		}));
	};

	function updatePic(controller, selector, url) {
		if (!OrgInfo.logoUrl) {
			$(".xx-inner-content .btn-cut").removeClass('hide');
		};
		OrgInfo.logoUrl = url;
		$("#OrgLogo").attr("src", url + "@100w_100h_1e_1c");
		selector.destroy();
		controller.editing = checkAdjusted();
	}

	module.exports = Controller;
});