define(function(require, exports, module) {
	var Toast = require('Toast');
	var sysConfig = require('config');
	var regulars = sysConfig.regulars;

	/**
	 * 单个表单验证方法
	 * @param  {String} value         表单的值
	 * @param  {String} rules          表单的验证规则
	 */
	var formValid = function(value, rules) {
		var result = true;
		value = $.trim(value);
		rules = rules.split('|');
		$.each(rules, function(k, v) {
			if (result) {
				switch (v) {
					// 验证规则
					case 'email':
						if (!regulars.email.test(value)) {
							result = false;
						}
						break;
					case 'phone':
						if (!regulars.phoneNumber.test(value)) {
							result = false;
						}
						break;
					case 'require':
						if (!value) {
							result = false;
						}
						break;
					case 'number':
						if (!$.isNumeric(value)) {
							result = false;
						}
						break;
					case 'money':
						if (!regulars.money.test(value)) {
							result = false;
						}
						break;
					case 'int':
						if (!regulars.Int.test(value)) {
							result = false;
						}
						break;
					case 'intNull':
						if (!regulars.intNull.test(value)) {
							result = false;
						}
						break;
					case 'notNum':
						if ($.isNumeric(value)) {
							result = false;
						}
						break;
					case 'longitude':
						if (!regulars.longitude.test(value)) {
							result = false;
						}
						break;
					case 'latitude':
						if (!regulars.latitude.test(value)) {
							result = false;
						}
						break;
					case 'percent':
						if (!regulars.percent.test(value)) {
							result = false;
						}
						break;
					case 'number':
						if (!regulars.number.test(value)) {
							result = false;
						}
						break;
				}
			}
		});
		return result;
	};



	/**
	 * validate all the input which has attr 'data-validate-rule',return 'true' when all through else return 'false'
	 * @param  {jquery obj} form 		the form need validation
	 * @return {boolean}
	 */
	var formValidate = function(form) {
		var validateResult = true,
			validateMsg;
		form.find("[data-validate-rule]").each(function(idx, item) {
			var tips = $(item).attr("data-tips") || $(item).attr("placeholder");
			if (!validate(item)) {
				validateResult = false;
				validateMsg = tips;
				errMsg(validateMsg, 2000);
				return false;
			}
		});
		return validateResult;
	};

	function validate(input) {
		var $this = $(input),
			rule = $this.attr("data-validate-rule"),
			tips = $this.attr("data-tips"),
			value = $this.val();
		return formValid(value, rule, function() {
			$this.parents(".form-group").removeClass("has-error");
		}, function() {
			$this.parents(".form-group").addClass("has-error");
			$this.attr("value", "").attr("placeholder", tips);
		});
	}

	/**
	 * 验证表单，并在所有表单验证正确的时候返回表单数据
	 * @param  {String} sel     [表单选择器]
	 * @param  {Object} options [配置参数]
	 * @return {Boolean|Object} [当错误时返回false，正确时返回所有的对象]
	 */
	var getFormData = function(sel, options) {
		options = options || {};
		var $form = $(sel),
			data = {},
			error = false,
			dataArray = $form.serializeArray();
		$form.find("[data-validate-rule]:not(.hide)").each(function(k, v) {
			var _val = $(v).val(),
				tips = $(v).attr("data-tips") || $(v).attr("placeholder"),
				_rule = $(v).attr("data-validate-rule");
			if (formValid(_val, _rule)) {
				return true;
			} else {
				errMsg(tips);
				error = true;
				return false;
			}
		});
		!error && $.map(dataArray, function(obj) {
			if (/\[\]$/.test(obj.name)) { // 处理checkbox,radio等name后面带[]的情况
				var tmpName = obj.name.match(/^(.*)\[\]$/, "")[1];
				if (!data.hasOwnProperty(tmpName))
					data[tmpName] = [];
				data[tmpName].push($.isNumeric(obj.value) ? +obj.value : obj.value);
			} else if (obj.name.indexOf("->") != -1) { // 强类型转换,处理
				var result = obj.name.match(/^(.*)(\-\>(.*))/),
					tmpName = result[1],
					type = result[3];
				switch (type) {
					case 'String':
						data[tmpName] = "" + obj.value;
						break;
					case 'Integer':
						data[tmpName] = +obj.value;
						break;
					default:
						data[tmpName] = "" + obj.value;
						break;
				}
			} else {
				// Name start with * will not be considered
				// 忽略以*开始的name的字段
				// 默认做自动类型转换，数字为数字，文本为String
				if (!(obj.name.charCodeAt(0) == 42))
				// data[obj.name] = $.isNumeric(obj.value) ? +obj.value : obj.value;
				// fixed:默认为string，若需要Integer则需要设定name="AAA->Integer"
					data[obj.name] = obj.value;
			}
		});
		return error ? false : $.extend(data, options);
	};

	exports.formValid = formValid;
	exports.formValidate = formValidate;
	exports.getFormData = getFormData;
	exports.isEmail = function(value) {
		return regulars.email.test(value);
	};
	exports.isPhoneNumber = function(value) {
		return regulars.phoneNumber.test(value);
	};
	exports.isPassword = function(value) {
		return regulars.password.test(value);
	};
	exports.isAuthCode = function(value) {
		return regulars.authCode.test(value);
	};
	exports.isInt = function(value) {
		return regulars.Int.test(value);
	};
	exports.isIntNull = function(value) {
		return regulars.intNull.test(value);
	};
	exports.isEmpty = function(value) {
		return regulars.empty.test(value);
	};
	exports.isEmptyNull = function(value) {
		return regulars.empty.test(value) || value == null || value == undefined;
	};
	exports.isUrl = function(value) {
		// 不区分字母大小写
		return value.indexOf("http://") > -1 || value.indexOf("https://") > -1;
	};
	exports.isMusicUrl = function(value) {
		return new RegExp(regulars.musicUrl).test(value);
	};
	exports.isImageUrl = function(value) {
		return new RegExp(regulars.imageUrl).test(value);
	};
	exports.isDateTime = function(value) {
		//return new RegExp(regulars.date).test(value);
		return (new Date(value)).getTime();
	};
	exports.isBankAccount=function(value){
		return new RegExp(regulars.bankAccount).test(value);
	};
	exports.isPercent = function(value) {
		return regulars.percent.test(value);
	};
	exports.isNumber = function(value) {
		return regulars.number.test(value);
	};

	function errMsg(message) {
		Toast.toast(message, {
			theme: 'danger',
			position: 'center'
		});
	};
});