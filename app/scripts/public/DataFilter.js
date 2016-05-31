// 数据过滤
define(function(require, exports, module) {

	// 字符串过滤器，字段不存在置为空
	exports.strings = function(fields, data) {
		var result = {};
		for (var i = 0, field; i < fields.length; i++) {
			field = fields[i];
			result[field] = data[field] ? data[field] : "";
		};
		return result;
	};

	exports.booleans = function(fields, data) {
		var result = {};
		for (var i = 0, field; i < fields.length; i++) {
			field = fields[i];
			result[field] = data[field] ? data[field] : false;
		};
		return result;
	};

	exports.number = function(fields, data) {
		var result = {};
		for (var i = 0, field; i < fields.length; i++) {
			field = fields[i];
			result[field] = data[field] ? data[field] : false;
		};
		return result;
	};

	exports.objects = function(fields, data) {
		var result = {};
		for (var i = 0, field; i < fields.length; i++) {
			field = fields[i];
			result[field] = data[field] ? data[field] : {};
		};
		return result;
	};

	exports.arrays = function(fields, data) {
		var result = {};
		for (var i = 0, field; i < fields.length; i++) {
			field = fields[i];
			result[field] = data[field] ? data[field] : [];
		};
		return result;
	};
});