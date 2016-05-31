// Form数据模型
define(function(require, exports, module) {
	var Helper = require("helper");
	var boxes = {
		TEXT: function() {
			return {
				height: 92,
				contentStyle: "line-height:35px;",
				maskStyle: "line-height:70px;"
			}
		},
		TEXTAREA: function() {
			return {
				height: 207,
				contentStyle: "line-height:150px;",
				maskStyle: "line-height:185px;"
			}
		},
		DATE: function() {
			return {
				height: 92,
				contentStyle: "line-height:35px;",
				maskStyle: "line-height:70px;"
			}
		},
		IMAGE: function() {
			return {
				height: 157,
				contentStyle: "line-height:35px;",
				maskStyle: "line-height:150px;"
			}
		},
		RADIO: function() {
			return {
				height: 57,
				contentStyle: "line-height:35px;",
				maskStyle: "line-height:35px;"
			}
		},
		CHECKBOX: function() {
			return {
				height: 57,
				contentStyle: "line-height:35px;",
				maskStyle: "line-height:35px;"
			}
		}
	};
	var FormModel = function(id, title, type, required, options) {
		this.id = id;
		this.title = title;
		this.type = type;
		this.required = required;
		this.options = options || [];
		this.box = boxes[type]();
		
		this.box.height += this.options.length ? 28*this.options.length : 0;
		this.box.maskStyle = "line-height:" + (this.box.height - 20) + "px;";
	};
	FormModel.prototype.set = function(key, value) {
		this[key] = value;
		if (key == "type") {
			this.box = boxes[this.type]();
		}
	};
	FormModel.prototype.optionAdd = function(option) {
		this.options.push(option);
	};
	FormModel.prototype.optionRemove = function(index) {
		this.options.splice(index, 1);
	};
	FormModel.prototype.validate = function(index, errorFnc) {
		var _formbox = this;
		// 标题不能为空
		if (Helper.validation.isEmpty(_formbox.title)) {
			Helper.errorToast("第" + (index + 1) + "个选项名称不能为空！");
			execute(errorFnc);
			return false;
		}
		// 若为单选或多选项，则选项条目不能为空且不能少于两条
		if (_formbox.type == "RADIO" || _formbox.type == "CHECKBOX") {
			var options = _formbox.options;
			var length = options.length;
			var result = true;
			if (!length || length < 2) {
				Helper.errorToast(_formbox.title + "选项不能少于两个！");
				execute(errorFnc);
				return false;
			}
			for (var i = 0; i < length; i++) {
				if (Helper.validation.isEmpty(options[i].title)) {
					Helper.errorToast(_formbox.title + "选项不能少于两个！");
					execute(errorFnc);
					result = false;
					break;
				}
			}
			if (!result) return result;
		}

		return true;
	};

	// FormModel.prototype.parseToData = function(data, index) {
	// 	var _formbox = this;
	// 	var d = {
	// 		title: _formbox.title,
	// 		required: _formbox.required,
	// 		rank: index
	// 	};
	// 	if (_formbox.type == "DATE") {
	// 		data.dates.push(d);
	// 	} else if (_formbox.type == "TEXT") {
	// 		d.textType = "TEXT";
	// 		data.texts.push(d);
	// 	} else if (_formbox.type == "TEXTAREA") {
	// 		d.textType = "TEXTAREA";
	// 		data.texts.push(d);
	// 	} else if (_formbox.type == "IMAGE") {
	// 		data.images.push(d);
	// 	} else if (_formbox.type == "RADIO") {
	// 		d.choiceType = "SINGLETON";
	// 		d.options = makeOptions(_formbox.options);
	// 		data.choices.push(d);
	// 	} else if (_formbox.type == "CHECKBOX") {
	// 		d.choiceType = "MULTIPLE";
	// 		d.options = makeOptions(_formbox.options);
	// 		data.choices.push(d);
	// 	}
	// 	return data;

	// 	function makeOptions(options) {
	// 		var result = [];
	// 		$(options).each(function(idx, option) {
	// 			result.push({
	// 				name: option,
	// 				rank: idx
	// 			});
	// 		});
	// 		return result;
	// 	}
	// };

	function execute(fnc, msg) {
		fnc && typeof fnc == "function" && fnc(msg);
	};
	module.exports = FormModel;
});
