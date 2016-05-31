define(function(require, exports, module) {
	var globalResponseHandler = require("ajaxHandler");


	exports.menu = {
		get: function(publicId) {
			return globalResponseHandler({
				url: "wechat/menu/get",
				data: {
					publicId: publicId
				}
			}, {
				description: "获取微信菜单"
			});
		},
		set: function(publicId, menus) {
			return globalResponseHandler({
				url: "wechat/menu/set",
				type: "post",
				data: {
					publicId: publicId,
					menus: menus
				}
			}, {
				description: "设置微信菜单"
			});
		}
	};


	/**
	 * 同步微信公众号关注数量
	 */
	exports.attentionSync = function(publicId) {
		return globalResponseHandler({
			url: 'wechat/public/' + publicId + '/attention/synchronize',
			type: 'post'
		});
	};

	
});