var response = require("../adapters/response");

module.exports = function(req, res, ok) {

	if(req.cookies.user.role && req.cookies.user.role == "root")
		ok();

	else {
		response(res).json({

			result: "error",
			description: "forbidden access"
		});
	}

}