define(function(require, exports, module) {
	require("uploadify");

	function listenser(_input, url, session, options) {
		options = $.extend({
			fileObjName: "uploadfile",
			swf: 'plugins/uploadify/uploadify.swf',
			uploader: url
				//,overrideEvents: ["onSelectError", "onUploadError"]
		}, options);
		_input.uploadify(options);
	}

	exports.music = function($input, orgId, session, options) {
		options = $.extend({
			fileSizeLimit: '5MB',
			buttonText: '上传音乐',
			fileTypeExts: "*.mp3;*.pdf;",
			buttonClass: "btn btn-xx-green btn-xx-sm",
			multi: false,
			width: 80,
			height: 20,
			formData: {
				session: session,
				organizationId: orgId
			}
		}, options);
		listenser($input, '/api-oa/attach/MUSIC/upload', session, options);

		// 取消上传
		var cancelBtn = options.cancelBtn;
		if (cancelBtn) {
			cancelBtn.on("click", function() {
				$input.uploadify("cancel");
			});
		}
	};

	exports.file = function($input, orgId, session, options) {
		options = $.extend({
			fileSizeLimit: '5MB',
			buttonText: '上传文件',
			fileTypeExts: "*.*",
			multi: false,
			buttonClass: "btn btn-xx-green btn-xx-sm",
			width: 80,
			height: 20,
			formData: {
				session: session,
				organizationId: orgId
			}
		}, options);
		listenser($input, '/api-oa/attach/FILE/upload', session, options);

		// 取消上传
		var cancelBtn = options.cancelBtn;
		if (cancelBtn) {
			cancelBtn.on("click", function() {
				$input.uploadify("cancel");
			});
		}
	};

	exports.image = function($input, orgId, groupId, session, options) {
		options = $.extend({
			fileSizeLimit: '2MB',
			buttonText: '本地上传',
			fileTypeExts: "*.jpg;*.jpeg;*.gif;*.png",
			multi: false,
			width: 100,
			queueSizeLimit: 10,
			buttonClass: "btn btn-xx-green btn-image-uploader",
			formData: {
				session: session,
				organizationId: orgId,
				classId: groupId
			}
		}, options);
		listenser($input, "/api-oa/attach/IMAGE/upload", session, options);
	};

});