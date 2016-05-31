/**
 *	选项编辑器（报名、抢票、申请组织）
 */
define(function(require, exports, module) {
	var Helper = require("helper");
	var template = require("template");

	var boxTemp = "app/templates/public/form/customForms";

	var FormInfo, _options;

	var FormBox = function(formInfo, options) {
		FormInfo = $.extend({
			id: "",
			title: "",
			type: "TEXT",
			types: ["TEXT", "TEXTAREA", "DATE", "RADIO", "CHECKBOX", "IMAGE"],
			required: true,
			options: []
		}, formInfo);

		_options = $.extend({
			title: '',
			actions: {
				'input[name=FormType]': {
					event: 'change',
					fnc: switchFormType
				},
				'input[name=FormOption]': {
					event: 'change',
					fnc: editOption
				},
				'input[name=FormOption]': {
					event: 'keyup',
					fnc: editOption
				},
				'.btn-option-add': {
					event: 'click',
					fnc: addOption
				},
				'.btn-option-remove': {
					event: 'click',
					fnc: removeOption
				},
				'.btn-save': {
					event: 'click',
					fnc: save
				}
			}
		}, options, true);

		var modal = Helper.modal(_options);
		init(modal);

		return modal;
	};

	function init(formbox) {

		formbox.html(template(boxTemp, {
			formInfo: FormInfo
		}));

		render(formbox);
	}

	function render(formbox) {
		var temp = getTemplate(FormInfo.type);
		formbox.box.find("#FormContainer").html(template(temp, {
			formInfo: FormInfo
		}));
	};

	//切换类型
	function switchFormType(formbox) {
		FormInfo.type = $(this).val();
		render(formbox);
	}

	//编辑选项
	function editOption() {
		var input = $(this);
		var index = +input.attr("data-value");
		FormInfo.options[index].name = $.trim(input.val());
	}

	//添加选项
	function addOption(formbox) {
		FormInfo.options.push({
			id: "",
			name: "",
			rank: FormInfo.options.length + 1
		});
		render(formbox);
	}

	//删除选项
	function removeOption() {
		var _btn = $(this);
		if (FormInfo.options.length < 2) {
			Helper.errorToast("选项不能少于两项！");
			return;
		}
		Helper.confirm("确定删除该选项？", function() {
			var index = +_btn.attr("data-value");
			FormInfo.options.splice(index, 1);
			_btn.parents(".input-item").slideUp(200, function() {
				$(this).remove();
			});
		});
	}

	//保存
	function save(formbox) {
		var $modal = $(this).parents(".modal");
		var title = $.trim($modal.find("#FormName").val());
		var type = $modal.find("input[name=FormType]:checked").val();
		var required = $modal.find("input[name=FormRequire]:checked").val() == "yes" ? true : false;

		if (Helper.validation.isEmpty(title)) {
			Helper.errorToast("标题不能为空！");
			return;
		}
		if (type == "RADIO" || type == "CHECKBOX") {
			if (FormInfo.options.length < 2) {
				Helper.errorToast("选项不能少于两项！");
				return;
			}
			if (!validateOptions(FormInfo.options)) {
				Helper.errorToast("选项不能为空！");
				return;
			}
		}

		FormInfo.title = title;
		FormInfo.type = type;
		FormInfo.required = required;

		_options.save && $.isFunction(_options.save) && _options.save.call(formbox, getValue(formbox));
	}

	function getValue(formbox) {
		var data = {};
		$(valuesOfType(FormInfo.type)).each(function(idx, item) {
			data[item] = FormInfo[item];
		});
		return data;
	};

	function getTemplate(type) {
		var baseTemplate = "app/templates/public/form/";
		switch (type) {
			case "TEXT":
				return baseTemplate + "TextBox";
			case "TEXTAREA":
				return baseTemplate + "TextArea";
			case "CHECKBOX":
				return baseTemplate + "CheckBox";
			case "RADIO":
				return baseTemplate + "CheckBox";
			case "IMAGE":
				return baseTemplate + "ImageBox";
			default:
				return baseTemplate + "TextBox";
		}
	};

	function valuesOfType(type) {
		switch (type) {
			case "TEXT":
				return ["id", "title", "required", "type"];
			case "TEXTAREA":
				return ["id", "title", "required", "type"];
			case "CHECKBOX":
				return ["id", "title", "required", "type", "options"];
			case "RADIO":
				return ["id", "title", "required", "type", "options"];
			default:
				return ["id", "title", "required", "type"];
		}
	};

	// 验证是否有选项为空
	function validateOptions(options) {
		for (var i = 0; i < options.length; i++) {
			if (Helper.validation.isEmpty(options[i])) {
				return false;
			}
		}
		return true;
	};

	module.exports = function(formInfo, options) {
		return new FormBox(formInfo, options);
	};
});
