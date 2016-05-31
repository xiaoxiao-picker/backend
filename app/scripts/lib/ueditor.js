define(function(require, exports, module) {
	require("ueditor.config");
	require("ueditor.all");

	// 注册秀米编辑器
	// 样式文件在 global/xiumi.scss 文件

	UE.registerUI("button", function(editor, uiName) {
		var btn = new UE.ui.Button({
			name: "image-selector",
			title: "选择图片",
			onclick: function() {
				require.async("ImageSelector", function(ImageSelector) {
					ImageSelector({
						title: '选择图片',
						optionLimit: 5,
						cut: function(imageUrl) {
							this.destroy();
							editor.execCommand("inserthtml", "<img src='" + imageUrl + "' style='max-width:100%;' />");
						},
						choose: function(imageUrls) {
							this.destroy();
							$(imageUrls).each(function(idx, imageUrl) {
								editor.execCommand("inserthtml", "<img src='" + imageUrl + "' style='max-width:100%;' />");
							});
						}
					});
				});
			}
		});
		return btn;
	});

	UE.registerUI('dialog', function(editor, uiName) {
		var btn = new UE.ui.Button({
			name: 'xiumi-connect',
			title: '秀米',
			onclick: function() {
				if (!document.addEventListener) {
					alert('您的浏览器版本太低，暂不支持秀米编辑器！');
					return;
				}
				var dialog = new UE.ui.Dialog({
					iframeUrl: './plugins/ueditor/xiumi-ue-dialog-v1.html',
					editor: editor,
					name: 'xiumi-connect',
					title: "秀米图文消息助手",
					cssRules: "width: " + (window.innerWidth - 60) + "px;" + "height: " + (window.innerHeight - 60) + "px;"
				});
				dialog.render();
				dialog.open();
			}
		});

		return btn;
	});


	


	// 初始化插件
	function init(container) {
		// 请确保每个实例化ueditor的controller都有destroy属性
		var ue = UE.getEditor(container);
		ue.ready(function() {
			$("#" + container).parent().children("textarea").hide();
		});
		return ue;
	};

	exports.init = init;
});