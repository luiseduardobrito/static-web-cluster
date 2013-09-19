//////////////////////////////////////////////////////////
//														//
//	Custom Modules - App developer, edit here!			//
//														//
//////////////////////////////////////////////////////////

(function(window) {

	window.user_module = function(sandbox) {

		var exports = {};
		var broadcast = sandbox.broadcast;

		//////////////////////////////
		// 		user actions		//
		//////////////////////////////
		var me = function(data) {

			// call the api
			sandbox.api("user", {}, function(response) {
				broadcast.publish("user/me/" + response.result, 
					response.data.user || {});
			});

		}; exports.me = me;

		var login = function(data) {
	
			// call the api
			sandbox.api("user/login", {

				email: $("#email").val(),
				password: $("#password").val()

			}).error(function(response){

				// broadcast problem with login
				broadcast.publish("user/login/" + response.result, 
					response || {});
				
			}).success(function(response) {

				// broadcas to whole app
				broadcast.publish("user/login/" + response.result, 
					response.data.user || response || {});

				if($("#destination").val())

					// render destination controller
					core.client.render($("#destination").val());

				else

					// render dashboard controller
					core.client.render("dashboard");

			}).get()

		}; exports.login = login;

		var logout = function(data) {

			// call the api
			sandbox.api("user/logout", {}).error(function(response) {

				broadcast.publish("user/logout/" + response.result, response || {});

			}).success(function(){

				core.client.render("/");

			}).error(function(){

				core.client.render("/");

			}).get();

		}; exports.logout = logout;

		var signup = function(data) {

			// call the api
			sandbox.api("user/signup", {

				name: $("#name").val(),
				email: $("#email").val(),
				password: $("#password").val()

			}).success(function(response) {

				broadcast.publish("user/signup/" + response.result, response || {});
				core.client.render("/");

			}).error(function(response){

				broadcast.publish("user/signup/" + response.result, response || {});

			}).get();

		}; exports.signup = signup;

		function init() {

			core.log.info("starting user module...")
			return exports;

		}; exports.init = init;

		function destroy() {

			core.log.info("destroying user module...")
			
		}; exports.destroy = destroy;

		return exports;
	}

	//////////////////////////////////////////////////////////
	//														//
	//	Standard Modules - Framework default (don't edit!)	//
	//														//
	//////////////////////////////////////////////////////////
	window.error_module = function(sandbox) {

		var exports = {};
		var broadcast = sandbox.broadcast;
		
		//////////////////////////////
		// 		error actions		//
		//////////////////////////////
		broadcast.subscribe("app/ready", function(data) {

			window.onerror = function myErrorHandler(errorMsg, url, lineNumber) {
				sandbox.broadcast.publish("error", {
					description: errorMsg || "unknown",
					url: url || "unknown",
					line: lineNumber || "unknown"
				})
			}
		});

		broadcast.subscribe("error", function(data) {
			core.log.error("Error Module: Unhandled error thrown by application.");
			core.log.error(data || {description: "unknown"});

			alert("Oops, The app has crashed!");
		});

		var init = function() {

			core.log.info("starting error module...")

			var broadcast = sandbox.broadcast;

			return exports;

		}; exports.init = init;

		var destroy = function() {

			core.log.info("destroying error module...")
			
		}; exports.destroy = destroy;

		return exports;		
	}

})(window)