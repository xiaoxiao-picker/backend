define(function(require, exports, module) {
	module.exports = function(url, session) {
		return "/api-oa/barcode/generate?value=" + encodeURIComponent(url) + "&session=" + session;
	};
});