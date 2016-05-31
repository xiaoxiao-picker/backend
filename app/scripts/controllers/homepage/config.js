define(function(require, exports, module) {

	// 系统微首页模板
	var templates = [{
		title: "动感渐变",
		name: "SWIPERTILE",
		message: "",
		img: './images/homepage/swiper-tile.png',
		limit: null
	}, {
		title: "情感色块",
		name: "SWIPERGRID",
		message: "",
		img: './images/homepage/swiper-grid.png',
		limit: null
	}, {
		title: "回忆相册",
		name: "SWIPERNOTE",
		message: "",
		img: './images/homepage/swiper-note.png',
		limit: null
	}, {
		title: "彩色情绪",
		name: "SWIPERPHOTO",
		message: "",
		img: './images/homepage/swiper-photo.png',
		limit: null
	}, {
		title: "FLAT风格",
		name: "SWIPERSUDOKU",
		message: "",
		img: './images/homepage/swiper-sudoku.png',
		limit: null
	}, {
		title: '模糊心情',
		name: 'huali',
		message: '模糊风格，给你颜色看看！',
		img: './images/homepage/huali.png',
		limit: null
	}, {
		title: '拼贴心情',
		name: 'win8',
		message: '流行时尚Win8风格，给你颜色看看！',
		img: './images/homepage/win8.png',
		limit: null
	}, {
		title: '旋转花瓣',
		name: 'rotate',
		message: '个性旋转花瓣风格，给你颜色看看！',
		img: './images/homepage/rotate.png',
		music_url: "",
		limit: {
			max: 9
		}
	}];

	exports.menus = require("scripts/config/menus")();
	exports.templates = templates;
});