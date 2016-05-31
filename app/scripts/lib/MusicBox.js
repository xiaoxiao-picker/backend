/**
 *	音乐选择器
 */
define(function(require, exports, module) {
	require("plugins/audiojs/audiojs/audio.min");

	var Helper = require("helper");
	var template = require("template");
	var ResourceService = require("ResourceService");
	// 文件上传插件
	var uploader = require("scripts/public/uploader");

	var boxTemp = "app/templates/public/music-box/box";
	var musicsTemp = "app/templates/public/music-box/music-list";


	var orgId = App.organization.info.id;
	var session = App.getSession();

	var MusicBox = function(url, options) {
		options = $.extend({
			title: "音乐盒",
			emptyMessage: "不设置背景音乐"
		}, options);
		var modal = Helper.modal(options);
		modal.url = url;
		modal.resources = [];
		modal.audio = null;

		render(modal);
	};

	function render(musicbox) {
		musicbox.html(template(boxTemp, {}));

		addListener(musicbox);
		renderResources(musicbox, 0, 200);
	};

	function renderResources(musicbox, skip, limit) {
		ResourceService.music.list(orgId, skip, limit).done(function(data) {
			musicbox.resources = data.result.data;
			musicbox.box.find("#MusicContainer").html(template(musicsTemp, {
				url: musicbox.url,
				resources: musicbox.resources,
				emptyMessage: musicbox.options.emptyMessage
			}));

		}).fail(function(error) {
			Helper.alert(error);
		}).always(function() {
			musicbox.box.find("#Modal_Loading").hide();
		});
	};

	function play(musicbox, url) {
		if (musicbox.audio) {
			musicbox.audio.load(url);
			musicbox.audio.play();
		} else {
			audiojs.events.ready(function() {
				var audios = audiojs.createAll();
				musicbox.audio = audios[0];
				musicbox.audio.load(url);
				musicbox.audio.play();
			});
		}
	};

	function addListener(musicbox) {

		//关闭
		musicbox.addAction(".btn-cancel", 'click', function() {
			musicbox.destroy();
		});

		//播放
		musicbox.addAction(".btn-play", 'click', function() {
			var _btn = $(this);

			play(musicbox, _btn.attr("data-value"));
			_btn.parents("tr").addClass("playing").siblings().removeClass("playing");
		});

		//保存
		musicbox.addAction(".btn-save", 'click', function() {
			var _btn = $(this);

			var checkedRadio = _btn.parents(".modal").find("input[name=musicbox]:checked");
			if (checkedRadio.length == 0) {
				Helper.errorToast("请至少选择一个文件！");
				return;
			}
			var url = checkedRadio.val();
			musicbox.url = url;

			musicbox.options.success && $.isFunction(musicbox.options.success) && musicbox.options.success.call(musicbox, url, _btn);
		});

		(function uploadListener() {
			var timer;
			var $input = musicbox.box.find("#MusicUploadInput");
			uploader.music($input, orgId, session, {
				cancelBtn: musicbox.box.find("#BtnUploadCancel"),
				onUploadStart: function() {
					$input.uploadify("disable", true);
					musicbox.box.find("#BtnUploadCancel").removeClass("hide");
					$input.uploadify("settings", "buttonText", "正在上传...");

					var i = 0;

					// 由于插件本身问题，进度显示不流畅，故此在start事件中模拟进度
					timer = setInterval(run, 300);

					function run() {
						if (i < 98) {
							$input.uploadify("settings", "buttonText", "已上传" + (i++) + "%");
						}
					};
				},
				onUploadProgress: function(file, bytesUploaded, bytesTotal, totalBytesUploaded, totalBytesTotal) {
					// 由于插件本身问题，进度显示不流畅，故此在start事件中模拟进度
					// var progress = bytesUploaded / bytesTotal;
				},
				onUploadSuccess: function() {
					$input.uploadify("settings", "buttonText", "再来一首");
					Helper.successToast("上传成功！");
					setTimeout(function() {
						renderResources(musicbox, -1, -1);
					}, 100);
				},
				onUploadError: function(file, errorCode, errorMsg, errorString) {
					$input.uploadify("settings", "buttonText", "重新上传");
					Helper.alert(errorMsg);
				},
				onUploadComplete: function() {
					musicbox.box.find("#BtnUploadCancel").addClass("hide");
					$input.uploadify("disable", false);
					clearInterval(timer);
				},
				onCancel: function() {
					musicbox.box.find("#BtnUploadCancel").addClass("hide");
					$input.uploadify("settings", "buttonText", "已取消上传");
					setTimeout(function() {
						$input.uploadify("disable", false);
						$input.uploadify("settings", "buttonText", "重新上传");
					}, 500);
				}
			});
		})();
	};

	module.exports = MusicBox;
});