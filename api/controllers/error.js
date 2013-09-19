var response = require("../adapters/response");

module.exports = {
	
	index: function(req, res) {

		response(res).json({

			result: "error",
			code: 500,
			message: "unknown"

		}, 500);
	},

	not_found: function(req, res) {

		response(res).json({

			result: "error",
			code: 404,
			message: "not found"

		}, 404);
	}
}