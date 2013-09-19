var response = require("../adapters/response");

module.exports = {
	
	index: function(req, res) {
		response(res).json({
			test: "ok"
		})
	},

	get: function(req, res) {
		response(res).json({
			test: "ok"
		})
	},

	post: function(req, res) {
		response(res).json({
			test: "ok"
		})
	},

	put: function(req, res) {
		response(res).json({
			test: "ok"
		})
	},
}