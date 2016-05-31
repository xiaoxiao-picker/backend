define(function(require, exports, module) {
	var Helper = require("helper");
	var baseController = require('baseController');
	var bC = new baseController();
	var QuestionnaireService = require('QuestionnaireService');
	var template = require('template');

	var DatetimeGroup = require("lib.DatetimeGroup");
	var RichTextEditor = require("ueditor");
	var FormModel = require("FormModel");

	// 所需信息处理函数库
	var REQUIREINFO = require("requireUserInfo");

	var orgId, questionnaireId;

	var Questionnaire;
	var QuestionnaireClone;
	var ActiveFormIndex;

	var editor;

	var Controller = function() {
		var _controller = this;
		_controller.namespace = "questionnaire.edit";
		// 页面销毁
		_controller.destroy = function() {
			editor.destroy();
		};
		_controller.editing = false;
		_controller.autoSaveTips = "问卷调查正在编辑状态，自动保存？";
		// _controller.autoSave = function() {};

		_controller.actions = {
			// 图片库选择器
			openImageSelector: function() {
				require.async("ImageSelector", function(ImageSelector) {
					ImageSelector({
						title: '选择问卷海报',
						crop: {
							aspectRatio: 300 / 200,
							previewWidth: 150,
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
					ImageCrop(Questionnaire.thumbnail, {
						title: "剪切问卷海报",
						jcrop: {
							aspectRatio: 300 / 200,
							previewWidth: 150,
							previewHeight: 100
						},
						cut: function(imageUrl) {
							updatePic(_controller, this, imageUrl);
						}
					});
				});
			},
			modifyQTitle: function() {
				var _input = this;
				var title = _input.val();
				Questionnaire.title = title;
			},
			modifyCheckBox: function() {
				var $input = this;
				var checked = $input.prop("checked");
				var attrName = $input.attr("name");
				Questionnaire[attrName] = checked;
			},
			// terseValidate: function() {
			// 	var _input = this;
			// 	var terse = _input.val();
			// 	if (terse.length > 100) {
			// 		terse = terse.substr(0, 100);
			// 		_input.val(terse);
			// 	}
			// 	$("#TerseRemain").text(100 - terse.length);
			// 	Questionnaire.terse = terse;
			// },
			// 添加问卷选项
			addForm: function() {
				Questionnaire.forms.push(new FormModel("", "", "TEXT", true));
				renderPreview();
				ActiveFormIndex = Questionnaire.forms.length - 1;
				renderEditor();
			},
			// 查看问卷选项
			checkForm: function() {
				var idx = +this.attr("data-value");
				if (ActiveFormIndex == idx) {
					return;
				}
				ActiveFormIndex = idx;
				renderEditor();
			},
			// 删除问卷选项
			removeForm: function() {
				var _btn = this;
				var index = +_btn.attr("data-value");
				Helper.confirm("确定删除该问卷选项？", function() {
					_btn.parents(".box-row").slideUp(200, function() {
						Questionnaire.forms.splice(index, 1);
						$(this).remove();
						if (ActiveFormIndex == index) {
							ActiveFormIndex = Questionnaire.forms.length > 0 ? 0 : null;
							renderPreview();
							renderEditor();
						}
					});
				});
			},
			// 修改问卷题目标题
			modifyFormTitle: function() {
				var _input = this;
				//var index = +_input.attr("data-value");
				Questionnaire.forms[ActiveFormIndex].set("title", _input.val());
				renderPreview();
			},
			// 修改问卷题目类型
			modifyFormType: function() {
				var _input = this;
				//var index = +_input.parents(".form-editor-box").attr("data-value");
				Questionnaire.forms[ActiveFormIndex].set("type", $("input[name=FormType]:checked").val());
				renderPreview();
				renderEditor();
			},
			// 修改问卷必填与否
			modifyFormRequired: function() {
				var _input = this;
				var required = $("input[name=FormRequire]:checked").val() == "yes" ? true : false;
				Questionnaire.forms[ActiveFormIndex].set("required", required);
				renderPreview();
				renderEditor();
			},
			// 添加表单选项
			addFormOption: function() {
				var _btn = this;
				var formIndex = ActiveFormIndex;
				var form = Questionnaire.forms[formIndex];
				form.options.push({
					id: "",
					name: "",
					rank: form.options.length + 1
				});
				form.box.height += 28;
				form.box.maskStyle = "line-height:" + (form.box.height - 20) + "px;";
				renderEditor();
				renderPreview();
			},
			// 修改表单选项
			modifyFormOption: function() {
				var _input = this;
				var optionIndex = +_input.attr("data-value");
				var formIndex = ActiveFormIndex;
				var value = _input.val();
				Questionnaire.forms[formIndex].options[optionIndex].name = value;
				renderPreview();
			},
			// 删除表单选项
			removeFormOption: function() {
				var _btn = this;
				var optionIndex = +_btn.attr("data-value");
				var formIndex = ActiveFormIndex;
				_btn.parents(".option-row").slideUp(200, function() {
					var form = Questionnaire.forms[formIndex];
					form.options.splice(optionIndex, 1);
					form.box.height -= 28;
					form.box.maskStyle = "line-height:" + (form.box.height - 20) + "px;";
					$(this).remove();
					renderPreview();
					renderEditor();
				});
			},
			// 保存
			save: function() {
				var _btn = this;

				// 此处手动取一次内容，防止ueditor的contentchange事件触发不及时。
				Questionnaire.text = editor.getContent();
				var startDate = $("#StartDate").val();
				var endDate = $("#EndDate").val();
				Questionnaire.startDate = startDate ? new Date(startDate).getTime() : "";
				Questionnaire.endDate = endDate ? new Date(endDate).getTime() : "";

				if (!questionnaireValidate()) return;

				Helper.begin(_btn);
				if (questionnaireId != 'add') {
					QuestionnaireService.update(orgId, questionnaireId, modelToData()).done(function() {
						if (Questionnaire.state == "CLOSED") {
							openQuestionnaire();
						} else {
							Helper.successToast("保存成功");
							Helper.go("questionnaires");
						}
					}).fail(function(error) {
						Helper.alert(error);
					}).always(function() {
						Helper.end(_btn);
					});
				} else {
					QuestionnaireService.add(orgId, modelToData()).done(function(data) {
						questionnaireId = data.result;
						openQuestionnaire();
					}).fail(function(error) {
						Helper.alert(error);
					}).always(function() {
						Helper.end(_btn);
					});
				}
			}
		};
	};

	bC.extend(Controller);
	Controller.prototype.init = function(templateUrl, callback) {
		this.callback = callback;
		this.templateUrl = templateUrl;
		orgId = App.organization.info.id;
		questionnaireId = Helper.param.hash("questionnaireId");
		this.render();
	};

	Controller.prototype.render = function() {
		var controller = this;
		var callback = this.callback;
		var templateUrl = this.templateUrl;

		var getQuestionnaireInfo = questionnaireId == "add" ? (function() {
			Questionnaire = {
				state: "CLOSED",
				required: true,
				compulsivelyBindPhoneNumber: true,
				forms: [new FormModel("", "", "TEXT", true)]
			};
		})() : QuestionnaireService.get(questionnaireId).done(function(data) {
			Questionnaire = dataToModel(data.result);
		});
		$.when(getQuestionnaireInfo).done(function() {
			QuestionnaireClone = $.extend(true, {}, Questionnaire);
			Helper.globalRender(template(templateUrl, {
				questionnaire: Questionnaire
			}));

			//富文本编辑器图片上传事件监听
			editor = RichTextEditor.init("Context");
			editor.addListener("contentchange", function() {
				Questionnaire.text = editor.getContent();
			});
			DatetimeGroup(controller.dom.find(".datetimepicker-group"), {
				minErrorMessage: "活动开始时间不能大于结束时间",
				maxErrorMessage: "活动结束时间不能小于开始时间"
			});
			if (Questionnaire.forms.length > 0)
				ActiveFormIndex = 0;
			renderPreview();
			renderEditor();
		}).fail(function(error) {
			Helper.alert(error);
		}).always(function() {
			Helper.execute(callback);
		});
	};

	/**
	 *	预览效果图渲染
	 */
	function renderPreview() {

		$("#PreviewContainer").html(template("app/templates/public/form-box/rows", {
			title: '问卷',
			forms: Questionnaire.forms
		}));
	}

	/**
	 *	编辑框渲染
	 */
	function renderEditor() {
		if (ActiveFormIndex == null || ActiveFormIndex == undefined)
			return;
		var marginTop = 0;

		for (var i = 0; i < ActiveFormIndex; i++) {
			var form = Questionnaire.forms[i];
			marginTop += form.box.height;
		};

		$("#EditorContainer").html(template("app/templates/public/form-box/editor", {
			title: '问卷',
			form: Questionnaire.forms[ActiveFormIndex],
			index: ActiveFormIndex
		})).stop().animate({
			"marginTop": marginTop
		}, 1000);
		//addListener();
	};

	// 保存是验证数据
	function questionnaireValidate() {
		var result = true;
		if (Helper.validation.isEmptyNull(Questionnaire.thumbnail)) {
			Helper.errorToast('请上传问卷调查海报！');
			return false;
		}
		if (Helper.validation.isEmptyNull(Questionnaire.title)) {
			Helper.errorToast('请填写问卷调查名称！');
			return false;
		}
		if (Helper.validation.isEmptyNull(Questionnaire.startDate)) {
			Helper.errorToast('请填写问卷调查开始时间！');
			return false;
		}
		if (Helper.validation.isEmptyNull(Questionnaire.endDate)) {
			Helper.errorToast('请填写问卷调查结束时间！');
			return false;
		}
		// if (Helper.validation.isEmptyNull(Questionnaire.terse)) {
		// 	Helper.errorToast('请填写问卷调查简介！');
		// 	return false;
		// }
		if (Helper.validation.isEmptyNull(Questionnaire.text)) {
			Helper.errorToast('请填写问卷调查详情！');
			return false;
		}
		$(Questionnaire.forms).each(function(idx, form) {
			if (!form.validate(idx, function() {
					ActiveFormIndex = idx;
					renderEditor();
				})) {
				result = false;
				return false;
			}
		});
		return result;
	};

	// 将问卷数据转化成数据模型
	function dataToModel(data) {
		return {
			title: data.title,
			startDate: data.startDate,
			endDate: data.endDate,
			thumbnail: data.thumbnail,
			// terse: data.terse,
			text: data.text,
			state: data.state,
			hasResult: data.hasResult,
			compulsivelyBindPhoneNumber: data.compulsivelyBindPhoneNumber,
			formId: data.register ? data.register.id : "",
			forms: makeForms(data.register)
		};

		function makeForms(forms) {
			var texts = forms.texts ? forms.texts : [];
			var dates = forms.dates ? forms.dates : [];
			var images = forms.images ? forms.images : [];
			var choices = forms.choices ? forms.choices : [];

			var forms = [];
			$.each(REQUIREINFO.makeElseInfo(texts, dates, choices, images), function(idx, form) {
				forms.push(new FormModel(form.id, form.title, form.type, form.required, form.options));
			});
			return forms;
		};
	};

	// 将数据模型转化成可提交数据模型
	function modelToData() {
		var data = {
			title: Questionnaire.title,
			thumbnail: Questionnaire.thumbnail,
			text: Questionnaire.text,
			// terse: Questionnaire.terse,
			state: Questionnaire.state,
			startDate: Questionnaire.startDate,
			endDate: Questionnaire.endDate,
			compulsivelyBindPhoneNumber: Questionnaire.compulsivelyBindPhoneNumber,
			registerJson: JSON.stringify(REQUIREINFO.getRequireInfo([], Questionnaire.forms, Questionnaire.formId))
		};

		return data;
	};


	function openQuestionnaire() {
		Helper.confirm("保存成功，是否开启问卷调查？", {
			yesText: "现在开启",
			noText: "暂不开启"
		}, function() {
			QuestionnaireService.open(questionnaireId).done(function(data) {
				Helper.successToast("开启成功");
				Helper.go("questionnaire/" + questionnaireId + "/edit");
			}).fail(function(error) {
				Helper.errorToast("开启失败：" + error);
			});
		}, function() {
			Helper.go("questionnaire/" + questionnaireId + "/edit");
		});
	};

	function updatePic(controller, selector, url) {
		if (!Questionnaire.thumbnail) {
			$(".xx-inner-content .btn-cut").removeClass('hide');
		}
		Questionnaire.thumbnail = url;
		$("#QuestionnaireAvatar").attr("src", url);
		selector.destroy();
	}

	module.exports = Controller;
});