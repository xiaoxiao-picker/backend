define(function(require, exports, module) {
	var extend = function(subClass, superClass) {
		var F = function() {};
		F.prototype = superClass.prototype;
		subClass.prototype = new F();
		subClass.prototype.constructor = subClass;
		subClass.superclass = superClass.prototype; //加多了个属性指向父类本身以便调用父类函数
		if (superClass.prototype.constructor == Object.prototype.constructor) {
			superClass.prototype.constructor = superClass;
		}
	}
	/**
	 * @construct
	 */
	var baseController = function() {
		/**
		 * 可选的参数
		 * @param function(arg1,arg2) 顺序按照依赖数组Controller.$inject中定义的顺序
		 * 
		 * 必须存在的属性:
		 * 实例变量 namespace {String} 命名空间
		 * 
		 * 可选的属性:
		 * 类变量 $inject {Array} 依赖数组
		 *
		 * 可选的属性:
		 * 实例变量 actions {Object} 将data-xx-action的值act委托绑定click事件到actions.act定义的函数
		 */
	};
	/**
	 * 成员函数
	 * init 可选
	 * 用于初始化页面，绑定时间等
	 * @param {String} [templateName] [模板名，从Router里得到，如果有注射得到$scope变量，可以从$scope.router.paramName得到Url规则中定义的参数]
	 * @param {Function} [fnCallback] [回调函数，应该在init函数`最后一步`执行]
	 * @example
	 * this.prototype.init = function(templateName,fnCallback) {}
	 */
	
	/**
	 * 基类的函数，决定这是不是一个合法的控制器
	 * To judge if it was really a controller
	 * @return {Boolean}
	 */
	baseController.prototype.isController = function() {
		return true;
	};
	
	/**
	 * 将子类控制器从积累中继承
	 * @param  {Object} obj [子类控制器]
	 * @return {Object} [得到继承后的子类控制器]
	 */
	baseController.prototype.extend = function(obj) {
		extend(obj, baseController);
	};
	module.exports = baseController;
});