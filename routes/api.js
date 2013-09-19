module.exports = {

	"error": "error/not_found",

	/*
	 * GET methods
	 */
	"get": {

		// views
		"/": "home",
		"/login": "home/login",
		"/signup": "home/signup",
		"/dashboard": "home/dashboard",

		// api
		"/api/user": "user",
		"/api/user/signup": "user/signup",
		"/api/user/login": "user/login",
		"/api/user/logout": "user/logout",

		"/test/get": "test/get"
	},

	/*
	 * POST methods
	 */
	"post": {
		"/test/post": "test/post"
	},

	/*
	 * PUT methods
	 */
	"put": {
		"/test/put": "test/put"
	}
};