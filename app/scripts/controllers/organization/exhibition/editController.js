define(function(require, exports, module) {
	require("plugins/select2/select2.js");

	var baseController = require('baseController');
	var template = require('template');
	var bC = new baseController();
	var OrganizationService = require('OrganizationService');
	var PublicService = require("PublicService");
	var Helper = require("helper");
	var requireUserInfo = require("scripts/public/requireUserInfo");
	var RichTextEditor = require("ueditor");

	var tmp, orgId, callback, session;
	var ExhibitionId, OrgInfo, OrgInfoClone;

	var editor;

	var Controller = function() {
		var _controller = this;
		_controller.namespace = "organization.exhibition.edit";
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
			if (!validate()) {
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
			// 修改组织类型
			orgTypeModify: function() {
				var _input = this;
				var value = _input.val();
				OrgInfo.orgType = value;
				_controller.editing = checkAdjusted();
			},
			// 图片截取插件
			openImageCrop: function() {
				require.async("ImageCrop", function(ImageCrop) {
					ImageCrop(OrgInfo.thumbnailUrl, {
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
			openLabelModal: function() {
				Helper.singleInputModal({
					title: '分类管理',
					id: "",
					name: "分类名称",
					value: "",
					action: addCategory
				});
			},
			categoryModify: function() {
				OrgInfo['orgClass.id'] = this.val();
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
							selector.close();
							OrgInfo.school = school;
							_controller.editing = checkAdjusted();
						}
					});
				});
			},
			save: function(evt) {
				var _btn = this;
				OrgInfo.description = editor.getContent();
				saveThen(_btn, function() {
					_controller.editing = false;
					Helper.successToast("保存成功");
					window.location.hash = "#list";
				});
			},
			remove: function() {
				var _btn = this;

				Helper.confirm("确认删除该组织？", {}, function() {
					Helper.begin(_btn);
					OrganizationService.exhibition.remove(orgId, relateOrgId).done(function(data) {
						Helper.successToast("删除成功");
						window.location.hash = "#list";
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
	Controller.prototype.init = function(templateName, fn) {
		var _controller = this;
		tmp = templateName;
		callback = fn;
		orgId = App.organization.info.id;
		ExhibitionId = Helper.param.hash("orgExhibitionId");
		session = App.getSession();
		render(this);
	};

	function render(controller) {
		if (ExhibitionId != '0') {
			OrganizationService.exhibition.get(orgId, ExhibitionId).done(function(data) {
				OrgInfo = dataToModel(data.result);
				OrgInfoClone = $.extend(true, {}, OrgInfo);
				renderInit();

			}).fail(function(error) {
				Helper.alert(error);
			}).always(function() {

			});
		} else {
			OrgInfo = {
				isSchool: true,
				school: {}
			};
			OrgInfoClone = $.extend(true, {}, OrgInfo);

			renderInit();
		}

		function renderInit() {
			Helper.globalRender(template(tmp, {
				orgInfo: OrgInfo
			}));
			editor = RichTextEditor.init("Context");
			editor.addListener("contentchange", function() {
				OrgInfo.description = editor.getContent();
				controller.editing = checkAdjusted();
			});
			$("select[name=orgType]").select2();
			renderCategories(OrgInfo['orgClass.id']);
			Helper.execute(callback);
		};
	};

	// 创建分类
	function addCategory(modal) {
		var _btn = $(this);
		var _input = modal.box.find('.input');
		var categoryName = _input.val();
		var categoryId = _btn.attr("data-value");

		if (Helper.validation.isEmpty(categoryName)) {
			Helper.errorToast("分类名称不能为空");
			return;
		}

		Helper.begin(_btn);
		OrganizationService.category.add(orgId, categoryName).done(function(data) {
			Helper.successToast("添加成功");

			//默认添加关键词回复
			// KeywordModel.custom.article(data.result, categoryName);

			modal.close();
			renderCategories();
		}).fail(function(error) {
			Helper.errorToast(error);
			Helper.end(_btn);
		});
	}

	/**
	 *  组织分类下拉框渲染
	 */
	function renderCategories(value) {
		OrganizationService.category.getList(orgId).done(function(data) {
			var options = data.result;
			$(options).each(function(idx, item) {
				item.value = item.id;
				item.selected = item.id == value;
			});
			$("#OrgCategories").html(template("app/templates/public/option", {
				options: options
			})).select2();

		}).fail(function(error) {
			Helper.alert(error);
		});
	};

	function saveThen(btn, success, error) {
		var messages = validate();
		if (messages.length > 0) {
			Helper.alert("<p>" + messages.join("</p><p>") + "</p>");
			return;
		}

		var formData = modelToData();
		formData.exhibitionId = ExhibitionId;

		btn && Helper.begin(btn);
		OrganizationService.exhibition[ExhibitionId == '0' ? 'add' : 'update'](orgId, formData).done(function(data) {
			if (ExhibitionId) {
				ExhibitionId = data.result;
			};
			Helper.execute(success);
		}).fail(function(error) {
			Helper.alert(error);
		}).always(function() {
			Helper.end(btn);
		});

	};

	// 保存时验证信息模型
	function validate() {
		var fields = [{
			field: "name",
			message: "组织名称不能为空"
		}, {
			field: "thumbnailUrl",
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
			if (Helper.validation.isEmptyNull(OrgInfo[item.field])) {
				messages.push(item.message);
			}
		}
		if (OrgInfo.isSchool && !OrgInfo.school) {
			messages.push("所属学校不能为空");
		}
		return messages;
	};

	function dataToModel(orgInfo) {
		var info = {};
		$(["id", "name", "thumbnailUrl", "description", "email", "orgType", "isSchool"]).each(function(idx, item) {
			(orgInfo.hasOwnProperty(item)) && (info[item] = orgInfo[item]);
		});
		info.school = orgInfo.school || {};
		info['orgClass.id'] = orgInfo.orgClass && orgInfo.orgClass.id;

		return info;
	};

	function modelToData() {
		var data = {};
		$(["name", "thumbnailUrl", "description", "email", "orgType", "isSchool", "orgClass.id"]).each(function(idx, item) {
			OrgInfo.hasOwnProperty(item) && (data[item] = OrgInfo[item]);
		});
		if (OrgInfo.school.id) {
			data['school.id'] = OrgInfo.school.id;
		}

		return data;
	}

	// 判断信息是否修改
	function checkAdjusted() {
		var adjusted = getAdjustedFields().length > 0;
		if (adjusted) {
			$(".btn-xx-group .btn").removeAttr("disabled");
		} else {
			$(".btn-xx-group .btn").attr("disabled", "disabled");
		}
		return adjusted;
	};

	// 获取信息修改了的字段
	function getAdjustedFields() {
		var adjustedFields = [];
		var fields = [{
			field: "name",
			name: "组织名称"
		}, {
			field: "thumbnailUrl",
			name: "组织logo"
		}, {
			field: "email",
			name: "联系邮箱"
		}, {
			field: "orgClass.id",
			name: "组织分类"
		}, {
			field: "orgType",
			name: "组织类型"
		}, {
			field: "isSchool",
			name: "是否为学校组织"
		}, {
			field: "description",
			name: "组织简介"
		}];
		$(fields).each(function(idx, item) {
			if (OrgInfo[item.field] != OrgInfoClone[item.field]) {
				adjustedFields.push(item.name);
			}
		});

		if (OrgInfo.school.id != OrgInfoClone.school.id) {
			adjustedFields.push("所属学校");
		}

		return adjustedFields;
	};

	function updatePic(controller, selector, url) {
		if (!OrgInfo.thumbnailUrl) {
			$(".xx-inner-content .btn-cut").removeClass('hide');
		};
		OrgInfo.thumbnailUrl = url;
		$("#OrgLogo").attr("src", url);
		selector.close();
	}

	module.exports = Controller;
});