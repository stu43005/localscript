(function(global) {
	'use strict';

	var localScript = function(func, args) {
		if (typeof func != "function") throw new TypeError("func is not a function");

		var id = '__localScript__' + (new Date()).getTime();
		var jsonArgs = JSON.stringify(args);

		var innerFunction = function(id, func, args) {
			function trigger(name, data) {
				var event = new CustomEvent(name, {
					'detail': data
				});
				return document.dispatchEvent(event);
			}
			try {
				var result = func(args);
				trigger(id, {
					ok: true,
					data: JSON.stringify(result)
				});
			} catch (e) {
				trigger(id, {
					error: e.toString(),
					data: null
				});
			}
		};

		var scriptText = '(' + innerFunction + ')("' + id + '", ' + func + ', ' + jsonArgs + ');';

		return new Promise(function(resolve, reject) {
			function onReceive(e) {
				if (e.detail.error) {
					reject(e.detail.error);
				} else {
					try {
						resolve(JSON.parse(e.detail.data));
					} catch (e) {
						resolve();
					}
				}
				document.removeEventListener(id, onReceive);
			}
			document.addEventListener(id, onReceive);

			var script = document.createElement('script');
			script.type = 'text/javascript';
			script.appendChild(document.createTextNode(scriptText));
			document.body.appendChild(script);

			setTimeout(function() {
				script.parentNode.removeChild(script);
			}, 1000);
		});
	}

	localScript.getGlobalVariable = function(variable) {
		return localScript(function(variable) {
			function getValue(obj, vars) {
				var value = obj[vars[0]];
				if (vars.length > 1) return getValue(value, vars.slice(1));
				return value;
			}

			var value = getValue(window, variable.split('.'));
			return value;
		}, variable);
	}

	// AMD support
	if (typeof define === 'function' && define.amd) {
		define(function() {
			return localScript;
		});
		// CommonJS and Node.js module support.
	} else if (typeof exports !== 'undefined') {
		// Support Node.js specific `module.exports` (which can be a function)
		if (typeof module !== 'undefined' && module.exports) {
			exports = module.exports = localScript;
		}
		// But always support CommonJS module 1.1.1 spec (`exports` cannot be a function)
		exports.localScript = localScript;
		exports.getGlobalVariable = localScript.getGlobalVariable;
	} else {
		global.localScript = localScript;
		global.getGlobalVariable = localScript.getGlobalVariable;
	}
})(this);
