var config = {

	model: "response"
};

var model = require("./model");

var Response = function(res) {
	
	var _res = res;

	var exports = {};

	function json(obj, code) {

		obj = obj || {};
		code = code || obj.code || 200;

		try {

			var r = model.create("response", obj);
			if(r._sanitize) r = r._sanitize(r)

			if(r._id)
				delete r._id;

			if(r._timestamp) {
				r.timestamp = r._timestamp;
				delete r._timestamp;
			}

			_res.json(r, code);
		}

		catch(e) {

			var err = model.create("response", {

				result: "error",
				code: 500,
				message: "Problem serving app response",
				data: {

					state: "trying to serve response",
					obj: obj,
					error: e
				}
			});

			_res.json(err._sanitize(), err.code);
		}

	}; exports.json = json;

	function view(name, data, code) {

		code = code || data.code || 200;

		_res.render(name, data, 
			function(err, html) {
				res.send(html);
		});
		
	}; exports.view = view;

	function redirect(url){
		res.redirect(url);
	}
	exports.redirect = redirect;

	function init() {
		return exports;
	}

	return init();
}

module.exports = Response;