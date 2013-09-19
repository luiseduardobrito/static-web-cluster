var async = require("async")
var log = require("winston");

module.exports = function(req, res) {

	var _req = req;
	var _res = res;

	var exports = {};

	function check(arr, cb) {

		if(toString.call(arr) == toString.call("str")) {

			var str = arr;
			arr = []
			arr.push(str);
		}

		cb = cb || function(){};
		var s = [];

		var p = require("./" + arr[0]);

		s.push(function(callback) {

			p(_req, _res, function(){

				callback(null, true);

			});
		});

		for(var i = 1; i < arr.length; i++) {

			var _p = require("./" + arr[i]);

			s.push(function(result, callback) {

				if(!result) callback(true, null)

				_p(_req, _res, function(){

					callback(null, true);

				});
			});
		}

		async.waterfall(s, function (err, result) {
			
			if(!result) {

				log.error(err);
				throw new Error("Problem validating access policies");
			}

			else {
				cb(_req, _res);	
			}

		});

	}; exports.check = check;

	function init() {
		return exports;
	}

	return init();
}