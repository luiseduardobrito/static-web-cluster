var response = require("../adapters/response");
var model = require("../adapters/model");
var policy = require("../policies/");

module.exports = {

	index: function(req, res) {
	
		response(res).view("home/index", {
			title: "node-web-cluster",
			message: "Welcome to the index page!"
		});
	},

	login: function(req, res) {

		response(res).view("home/login", {
			title: "node-web-cluster",
			destination: req.param("destination") || "dashboard"
		});
	},

	signup: function(req, res) {

		response(res).view("home/signup", {
			title: "node-web-cluster",
			destination: req.param("destination") || "dashboard"
		});
	},	

	dashboard: function(req, res) {

		policy(req, res).check(["logged_in"], function() { 
		
			var _user = model.find("user",  {

				_id: req.cookies.user_id

			}, function(results) {

				if(!results[0])
					response(res).redirect("/login")

				var u = results[0];

				response(res).view("home/dashboard", {

					title: "node-web-cluster",
					user: u
				});

			});
		});		
	}
}