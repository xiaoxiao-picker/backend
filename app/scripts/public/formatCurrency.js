define(function(require, exports, module) {

	/** 
	 * 将数值四舍五入(保留2位小数)后格式化成金额形式 
	 *
	 * @param num 数值(Number或者String) 
	 * @param limit 保留小数位
	 * @return 金额格式的字符串,如'1,234,567.45' 
	 * @type String 
	 */
	function formatCurrency(num, limit) {
		num = num.toString().replace(/\$|\,/g, '');
		num = isNaN(num) ? "0" : num;
		limit = isNaN(limit) ? 2 : limit;
		sign = (num == (num = Math.abs(num)));
		num = Math.floor(num * 100 + 0.50000000001);
		cents = num % Math.pow(10, limit - 1);
		num = Math.floor(num / 100).toString();
		if (cents < 10)
			cents = "0" + cents;
		for (var i = 0; i < Math.floor((num.length - (1 + i)) / 3); i++)
			num = num.substring(0, num.length - (4 * i + 3)) + ',' +
			num.substring(num.length - (4 * i + 3));
		return (((sign) ? '' : '-') + num + '.' + cents);
	}

	module.exports = formatCurrency;
});