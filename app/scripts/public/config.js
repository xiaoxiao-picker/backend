/**
 * define the configuration of this system
 */

define(function(require, exports, module) {
	var url = '^((https|http|ftp|rtsp|mms)?://)' + '?(([0-9a-z_!~*\'().&=+$%-]+: )?[0-9a-z_!~*\'().&=+$%-]+@)?' //ftp的user@ 
		+ '(([0-9]{1,3}.){3}[0-9]{1,3}' // IP形式的URL- 199.194.52.184 
		+ '|' // 允许IP和DOMAIN（域名） 
		+ '([0-9a-z_!~*\'()-]+.)*' // 域名- www. 
		+ '([0-9a-z][0-9a-z-]{0,61})?[0-9a-z].' // 二级域名 
		+ '[a-z]{2,6})' // first level domain- .com or .museum 
		+ '(:[0-9]{1,4})?' // 端口- :80 
		+ '((/?)|' // a slash isn't required if there is no file name 
		+ '(/[0-9a-z_!~*\'().;?:@&=+$,%#-]+)+/?)$'; // 加入汉字匹配
	exports.regulars = {
		empty: /^\s*$/,
		phoneNumber: /(^0{0,1}1[3|4|5|6|7|8|9][0-9]{9}$)/,
		email: /^\w+([-+.]\w+)*@\w+([-.]\w+)*\.\w+([-.]\w+)*$/,
		password: /^[a-zA-Z0-9_]{6,23}$/,
		authCode: /^[0-9]{4,6}$/,
		money: /^([0-9]+|[0-9]{1,3}(,[0-9]{3})*)(.[0-9]{1,2})?$/, // money
		Int: /^[0-9]+$/, // int only
		intNull: /^[0-9]*$/, // int & null
		number: /^\d+(\.\d+)?$/, //数字
		rtrim: /^[\s\uFEFF\xA0]+|[\s\uFEFF\xA0]+$/g, // clean space of string
		longitude: /^(-?((180)|(((1[0-7]\d)|(\d{1,2}))(\.\d+)?)))$/, // 经度
		latitude: /^(-?((90)|((([0-8]\d)|(\d))(\.\d+)?)))$/, // 纬度
		percent: /^\d+(\.\d+)?\%$/, //百分比
		date: /^((((1[6-9]|[2-9]\d)\d{2})-(0?[13578]|1[02])-(0?[1-9]|[12]\d|3[01]))|(((1[6-9]|[2-9]\d)\d{2})-(0?[13456789]|1[012])-(0?[1-9]|[12]\d|30))|(((1[6-9]|[2-9]\d)\d{2})-0?2-(0?[1-9]|1\d|2[0-8]))|(((1[6-9]|[2-9]\d)(0[48]|[2468][048]|[13579][26])|((16|[2468][048]|[3579][26])00))-0?2-29-)) (20|21|22|23|[0-1]?\d):[0-5]?\d:[0-5]?\d$/,
		url: url,
		fileUrl: /^http\:\/\/file\.xiaoxiao\.la\/[\w\d-]+\.[\w\d]+$/,
		musicUrl: /^http\:\/\/img\.xiaoxiao\.la\/[\w\d-]+\.[\w\d]+$/,
		bankAccount: /^(\d{16}|\d{19})$/
	};
	exports.tips = {
		userName: '用户名格式不对',
		password: '密码长度必须为6-23位',
		authCode: '验证码格式为6位数字',
		loginLoading: '抢滩登录中...',
		signuping: '玩命注册中...',
		xiaoxiaoSupport: '—校校技术赞助'
	};
	exports.pages = {
		frontRoot: (window.location.host.indexOf("xiaoxiao") > -1) ? 'http://front.xiaoxiao.la' : 'http://front.signvelop.com',
		origin: window.location.origin ? window.location.origin : (window.location.protocol + "//" + window.location.hostname)
	};
});