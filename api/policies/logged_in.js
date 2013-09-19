var response = require("../adapters/response");

module.exports = function(req, res, ok) {

	if(req.cookies.authenticated == "true") {

		ok();
	}

	else {

		response(res).redirect("/login?destination="+encodeURI(req.originalUrl));
	}

}