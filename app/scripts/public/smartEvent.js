/**
 * 全局管理window快捷键事件
 */
define(function(require, exports, module) {

	function SmartEvent() {};

	SmartEvent.prototype.init = function() {
		var _se = this;
		$(document).on("keydown.window", function(evt) {
			evt = evt || window.event;
			
			var keyCode = evt.keyCode;
			//if(keyCode==13)preventDefault(evt);
			_se.execute(keyCode);
		});
	};

	SmartEvent.prototype.execute = function(key, index) {
		var _se = this;
		if (!_se[key] || !_se[key].length) {
			return;
		}
		var index = index !== undefined ? index : _se[key].length - 1;
		var fnc = _se[key][index]["fnc"];
		var times = _se[key][index]["times"];
		if (fnc && typeof fnc == "function") {
			fnc();
			if (--times == 0) {
				_se.remove(key, index);
			}
		}
	};

	SmartEvent.prototype.add = function(key, fnc, times) {
		var _se = this;
		var _obj = {
			fnc: fnc,
			times: times ? times : 1
		};
		_se[key] = _se[key] ? _se[key] : [];
		_se[key].push(_obj);
	};

	SmartEvent.prototype.remove = function(key, object) {
		var _se = this;
		var index;

		if (typeof object === "number") {
			index = object;
		} else if (typeof object === "function") {
			for (var i = 0, len = _se[key].length; i < len; i++) {
				if (_se[key][i].fnc == object) {
					index = i;
					break;
				}
			}
		}
		if (index != undefined)
			_se[key].splice(index, 1);
	};

	function preventDefault(event) {
		if (event.preventDefault)
			event.preventDefault();
		else
			event.returnValue = false;
	};

	module.exports = SmartEvent;
});
