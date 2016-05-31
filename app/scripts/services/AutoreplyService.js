define(function(require, exports, module) {
	var globalResponseHandler = require("ajaxHandler");

	// 系统关键词回复列表
	exports.systemReplies = function() {
		return globalResponseHandler({
			url: 'wechat/reply/system/list'
		}, {
			description: '系统关键词回复列表'
		});
	};

	// 获取回复列表
	exports.getList = function(publicId, data) {
		data.publicId = publicId;
		return globalResponseHandler({
			url: 'wechat/reply/list-by-public',
			data: data
		}, {
			description: '获取回复列表'
		});
	};

	// 获取回复详情
	exports.get = function(replyId) {
		return globalResponseHandler({
			url: 'wechat/reply/' + replyId + '/detail/get'
		}, {
			description: '获取回复详情'
		});
	};

	// 获取回复对应的关键词列表
	exports.keywords = function(replyId) {
		return globalResponseHandler({
			url: 'wechat/reply/' + replyId + '/keyword/list'
		}, {
			description: '获取回复对应的关键词列表'
		});
	};

	// 删除回复
	exports.remove = function(replyId) {
		return globalResponseHandler({
			url: 'wechat/reply/' + replyId + '/remove',
			type: 'post'
		}, {
			description: '删除回复'
		});
	};

	// 添加回复
	exports.add = {
		// 添加文字回复
		text: function(data) {
			return globalResponseHandler({
				url: 'wechat/reply/text/add',
				type: 'post',
				data: data
			}, {
				description: '添加文字回复'
			});
		},
		// 添加图片回复
		image: function(data) {
			return globalResponseHandler({
				url: 'wechat/reply/image/add',
				type: 'post',
				data: data
			}, {
				description: '添加图片回复'
			});
		},
		// 添加图文回复
		graphic: function(data) {
			return globalResponseHandler({
				url: 'wechat/reply/article/add',
				type: 'post',
				data: data
			}, {
				description: '添加图文回复'
			});
		},
		// 添加绑定回复
		relation: function(data) {
			return globalResponseHandler({
				url: 'wechat/reply/relation/add',
				type: 'post',
				data: data
			}, {
				description: '添加高级回复'
			});
		}
	};

	// 更新回复
	exports.update = {
		// 更新文字回复
		text: function(data) {
			return globalResponseHandler({
				url: 'wechat/reply/' + data.replyId + '/text/update',
				type: 'post',
				data: data
			}, {
				description: '更新文字回复'
			});
		},
		// 更新图片回复
		image: function(data) {
			return globalResponseHandler({
				url: 'wechat/reply/' + data.replyId + '/image/update',
				type: 'post',
				data: data
			}, {
				description: '更新图片回复'
			});
		},
		// 更新图文回复
		graphic: function(data) {
			return globalResponseHandler({
				url: 'wechat/reply/' + data.replyId + '/article/update',
				type: 'post',
				data: data
			}, {
				description: '更新图文回复'
			});
		},
		// 更新绑定回复
		relation: function(data) {
			return globalResponseHandler({
				url: 'wechat/reply/' + data.replyId + '/relation/update',
				type: 'post',
				data: data
			}, {
				description: '更新高级回复'
			});
		}
	};

	// 启用并关闭其他同类型[消息/关注]回复
	exports.activate = function(replyId) {
		return globalResponseHandler({
			url: 'wechat/reply/' + replyId + '/activate-and-close-others',
			type: 'post'
		}, {
			description: '启用并关闭其他同类型[消息/关注]回复'
		});
	};

	// 单独启用回复
	exports.onlyActivate = function() {
		return globalResponseHandler({
			url: 'wechat/reply/' + replyId + '/activate',
			type: 'post'
		}, {
			description: '单独启用回复'
		});
	};

	// 单独关闭回复
	exports.onlyClose = function() {
		return globalResponseHandler({
			url: 'wechat/reply/' + replyId + '/close',
			type: 'post'
		}, {
			description: '单独关闭回复'
		});
	};
});