define(function(require, exports, module) {
	var baseController = require('baseController');
	var bC = new baseController();
	var template = require('template');
	var Helper = require("helper");

	var WechatResourceService = require('WechatResourceService');
	var ResourceService = require("ResourceService");

	var page, limit = 12;
	var organizationId = Application.organization.id;

	var panelBodySelector = ".resource-weixin-voice-content .panel-body .xx-table-body";

	// 文件上传插件
	var uploader = require("scripts/public/uploader");
	// 音乐播放插件
	require("plugins/audiojs/audiojs/audio.min");
	var Pagination = require('lib.Pagination');

	template.helper('encode', function(URI) {
		return encodeURIComponent(URI);
	});

	var audio;

	var Controller = function() {
		var controller = this;
		controller.namespace = "resource.weixin.voice";
		controller.actions = {
			// 同步微信素材
			update: function() {
				var $btn = this;
				Helper.begin($btn);
				WechatResourceService.voice.synchronize(organizationId).done(function(data) {
					skip = 0;
					Application.loader.begin();
					controller.render(Application.loader.end);
				}).fail(function(error) {
					Helper.alert(error);
				}).always(function() {
					Helper.end($btn);
				});
			},
			add: function() {
				var $btn = this;
				Helper.begin($btn);
				require.async("MusicBox", function(MusicBox) {
					Helper.end($btn);
					MusicBox("", {
						emptyMessage: "",
						success: function(musicURL, $btnSuccess) {
							var musicbox = this;
							var music = musicbox.resources.objOfAttr("url", musicURL) || {
								fileName: "Can't find this music from musicbox"
							};
							Helper.begin($btnSuccess);
							WechatResourceService.voice.add(organizationId, music.fileName, musicURL).done(function(data) {
								Helper.end($btnSuccess);
								musicbox.destroy();
							}).fail(function(error) {
								Helper.end($btnSuccess);
								Helper.alert(error);
							});
						}
					});
				});
			},
			// 播放
			play: function() {
				var _btn = this;
				var music_url = _btn.attr("data-value");
				_btn.parents("tr").addClass("playing").siblings().removeClass("playing");
				playMusic(music_url);
			},
			// 暂停
			pause: function() {
				var _btn = this;
				_btn.parents("tr").removeClass("playing");
				audio.pause();
			},
			// 继续播放
			playPause: function() {
				audio.playPause();
			},
			remove: function() {
				var $btn = this;
				var materialId = $btn.attr("data-value");
				Helper.confirm("确定删除？", function() {
					Helper.begin($btn);
					WechatResourceService.voice.remove(materialId).done(function(data) {
						$btn.parents("tr").animate({
							opacity: 0
						}, 200, function() {
							$(this).remove();
						});
					}).fail(function(error) {
						Helper.alert(error);
					}).always(function() {
						Helper.end($btn);
					});
				});
			}
		};
	};

	bC.extend(Controller);
	Controller.prototype.init = function() {
		page = +Helper.param.search('page') || 1;
		this.render();
	};
	Controller.prototype.render = function(callback) {
		var controller = this;
		skip = (page - 1) * limit;
		callback || (callback = this.callback);
		Helper.globalRender(template('app/templates/resource/weixin/voice/list', {}));
		WechatResourceService.voice.getList(organizationId, skip, limit).done(function(data) {
			var voices = data.result.data;
			var total = data.result.total;
			$('#TotalCount').text(total);
			$(panelBodySelector).html(template("app/templates/resource/weixin/voice/voices", {
				voices: voices,
				pagination: Helper.pagination(total, limit, page)
			}));

			uploadListenser(function() {
				Application.loader.begin();
				controller.render(Application.loader.end);
			});

			Pagination(total, limit, page, {
				switchPage: function(pageIndex) {
					page = pageIndex;
					Application.loader.begin();
					controller.render(Application.loader.end);
				}
			});
		}).fail(function(error) {
			Helper.alert(error);
		}).always(function() {
			Helper.execute(callback);
		});
	};

	// 上传音乐事件绑定
	function uploadListenser(callback) {
		var session = Application.getSession();
		var $input = $("#MusicUploadInput");
		var timer;
		uploader.music($input, organizationId, session, {
			cancelBtn: $("#BtnUploadCancel"),
			height: 23,
			fileTypeExts: "*.mp3;*.wma;*.wav;*.amr;",
			onUploadStart: function() {
				$input.uploadify("disable", true);
				$("#BtnUploadCancel").removeClass("hide");
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
			onUploadSuccess: function(file, data, response) {
				clearInterval(timer);
				Helper.successToast("上传成功！");
				$input.uploadify("settings", "buttonText", "正在解析...");
				var resourceId = JSON.parse(data).result;
				WechatResourceService.voice.add(organizationId, file.name, resourceId).done(function(data) {
					setTimeout(function() {
						callback();
					}, 200);
				}).fail(function(error) {
					Helper.alert(error);
				}).always(function() {
					$input.uploadify("settings", "buttonText", "再来一首");
				});
			},
			onUploadError: function(file, errorCode, errorMsg, errorString) {
				$input.uploadify("settings", "buttonText", "重新上传");
				Helper.alert(errorMsg);
			},
			onUploadComplete: function(file) {
				$("#BtnUploadCancel").addClass("hide");
				$input.uploadify("disable", false);
				clearInterval(timer);
			},
			onCancel: function() {
				$("#BtnUploadCancel").addClass("hide");
				$input.uploadify("settings", "buttonText", "已取消上传");
				setTimeout(function() {
					$input.uploadify("disable", false);
					$input.uploadify("settings", "buttonText", "重新上传");
				}, 500);
			}
		});
	}

	module.exports = Controller;

	// 播放音乐
	function playMusic(url) {
		if (audio) {
			audio.load(url);
			audio.play();
		} else {
			audiojs.events.ready(function() {
				var audios = audiojs.createAll();
				audio = audios[0];
				audio.load(url);
				audio.play();
			});
		}
	};
});