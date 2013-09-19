
/*
 * GET home page.
 */

var api = require("./api");

var Router = function(api) {

	var exports = {};

	function method(path) {

		var arr = path.split("/");

		if(arr[0] === "")
			arr.shift();

		if(arr[arr.length - 1] === "")
			arr.pop();

		var ctrl = require("../api/controllers/" + arr.shift());
		var method = ctrl[arr.shift()];

		return method;
	}

	function bind(app, cb) {

		cb = cb || function(){};

		for(var k in (api.get || {})) {

			var uri =  api.get[k];

			if(uri.split('/').length == 1)
				uri = uri + "/index"

			if(!method(uri))
				throw new Error("Method '" + uri + "' not found in the api controller.")

			app.get(k, method(uri));
		}

		for(var k in (api.post || {})){

			var uri =  api.post[k];

			if(uri.split('/').length == 1)
				uri = uri + "/index"

			app.post(k, method(uri));
		}

		for(var k in (api.put || {})) {

			var uri =  api.put[k];

			if(uri.split('/').length == 1)
				uri = uri + "/index"

			app.put(k, method(uri));
		}

		if(toString.call(api.error) === toString.call("")) {
			app.get("*", method(api.error))
		}

		cb(app);

	}; exports.bind = bind;

	function init() {
		return exports;
	}

	return init();
}

module.exports = new Router(api)