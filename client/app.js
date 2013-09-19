(function(window){

	//////////////////////////////////////////////////////////
	//														//
	//				Application Configurations 				//
	//														//
	//////////////////////////////////////////////////////////

	var appConfig = {

		state: "development",

		development: {

			api: {

				host: "localhost",
				port: 3000
			},

			modules: ["user"],

			// show info logs
			log: true
		},

		testing: {

			api: {

				host: "localhost",
				port: 3000
			},

			modules: ["user"],

			// show info logs
			log: true
		},

		production: {

			api: {

				host: "localhost",
				port: 3000
			},

			modules: ["user", "error"]
		}
	}

	var clientConfig = {

		tags: {

			// tag that specify the element content
			container: "data-container",
		}
	}

	//////////////////////////////////////////////////////////
	//														//
	//			Framework Core - try not to edit...			//
	//														//
	//////////////////////////////////////////////////////////

	var Client = function($, _) {

		if(!clientConfig) {
			throw new Error("No client configuration available...");
		}

		var exports = {};

		var render = function(ctrl, data, cb) {

			if(!ctrl || !ctrl.length)
				throw new Error("No controller specified");

			else if(ctrl.indexOf("javascript:") == 0)
				return;

			else if(ctrl[0] == "#") {

				location.hash = ctrl
				return;
			}

			else if(ctrl == "/" || ctrl[0] == '/')
				var uri = ctrl;
			
			else 
				var uri = "/" + ctrl;

			data = data || null;
			cb = cb || function(){};

			var tag = "[" + clientConfig.tags.container + "='controllers']";
			var _ctrl = ctrl;

			$(tag).parent().load(uri +" "+ tag, data, function(data){

				bindings(tag);
				history.pushState('', uri || _ctrl, uri);

				sandbox.broadcast.publish("controller/ready");
			})

		}; exports.render = render;

		var publish = function(event, data) {

			$("[data-subscribe='"+event+"']").each(function(){

				var action = $(this).attr("data-action") || "(function(){})();";
				(new Function("data", "with(this) { try {" + action + "} catch(e){ throw e; } }")).call(this, data || {});
			});

		}; exports.publish = publish;

		var redirect = function(url) {

			document.location.replace(url);

		}; exports.redirect = redirect;

		var bindings = function(tag){

			$("a").each(function(){
				if(!$(this).attr("href") || !$(this).attr("href").length)
					$(this).attr("href", "javascript:;");
			});

			$(tag + " form[data-module][data-method]").on("submit", function(e){

				e.preventDefault();
				sandbox.broadcast.publish("module/call", {
					module: $(this).attr("data-module"),
					method: $(this).attr("data-method")
				});
			});

			$(tag + " a[data-module][data-method]").on("click", function(e){

				e.preventDefault();
				sandbox.broadcast.publish("module/call", {
					module: $(this).attr("data-module"),
					method: $(this).attr("data-method")
				});
			});

			$(tag + " a").on("click", function(e){

				e.preventDefault();

				if($(this).attr("data-module")
					&& $(this).attr("data-method")) {
					return false;
				}

				else
					core.client.render($(this).attr("href"));

				return false;
			})

			$("[data-event][data-on]").each(function(){

				$(this).on($(this).attr("data-on") || "", function(e){

					if(e && e.preventDefault) e.preventDefault();

					var evt = $(this).attr("data-event");
					var pub = $(this).attr("data-pub") || "return null";

					pub = JSON.parse.call(this, pub);

					window.sandbox.broadcast.publish(evt, pub);
					return false;

				});

			});
		}

		var init = function(){

			exports.util = _;

			var tag = "[" + clientConfig.tags.container + "='controllers']";
			bindings(tag);

			$(window).on("hashchange", function(){
				sandbox.broadcast.publish("hash/" + location.hash.replace("#", ""), { 
					hash: location.hash 
				});
			});

			exports = $.extend($, exports);

			return exports;
		}

		return init();	
	}

	var Core = function(config) {

		var exports = {

			log: {},
			config: config, 

			client: new Client($, _)
		};

		// wrap logger
		function info(msg) {

			if(!config.log) 
				return;

			if(toString.call(msg) == toString.call("str"))
				console.log("info: " + msg);
			else
				console.log(msg);
		};
		exports.log.info = info;

		// wrap logger
		function error(msg) {
			console.error(msg);
		};
		exports.log.error = error;

		String.prototype.replaceAll = function(str1, str2, ignore)
		{
			return this.replace(new RegExp(str1.replace(/([\,\!\\\^\$\{\}\[\]\(\)\.\*\+\?\|\<\>\-\&])/g, function(c){return "\\" + c;}), "g"+(ignore?"i":"")), str2);

		};

		function init() {

			// run unit test
			info("core initialized successfully...")

			return exports;
		}	

		return init();
	}

	var Sandbox = function(core) {

		var exports = {
			modules: core.config.modules,
			selector: $
		};

		var subscribers = {
			any: [] // event type: subscribers
		};

		var once = {
			any: [] // event type: subscribers
		};

		var broadcast = {

			subscribe: function (type, fn) {

				type = type || 'any';

				if (typeof subscribers[type] === "undefined") {
					subscribers[type] = [];
				}

				subscribers[type].push(fn);
			},

			once: function (type, fn) {

				type = type || 'any';

				if (typeof once[type] === "undefined") {
					once[type] = [];
				}

				once[type].push(fn);
			},

			unsubscribe: function (type, fn) {
				this.visitSubscribers('unsubscribe', fn, type);
			},

			publish: function (type, publication) {

				this.visitSubscribers('publish', publication, type);

				if(core && core.client)
					core.client.publish(type, publication);
			},

			visitSubscribers: function (action, arg, type) {

				var pubtype = type || 'any';
				s = subscribers[pubtype] || [];
				max = s.length;

				for (var i = 0; i < max; i += 1) {

					if (action === 'publish') {
						s[i](arg);

					} else {

						if (s[i] === arg) {
							s.splice(i, 1);
						}
					}
				}

				o = once[pubtype] || [];
				max = o.length;

				while(o.length) {
					
					var cb = o.pop();

					if (action === 'publish') {
						cb(arg);
						o.splice(i, 1);

					} 
				}
			}
		}; exports.broadcast = broadcast;

		var Api = function(config) {

			function _this (uri, data, methods) {

				this._uri = uri;
				this._data = data;
				this._methods = methods || {
					success: function(){},
					error: function(){
						throw new Error("Uncaught problem with API connection");
					}
				};
			};

			_this.prototype.success = function(fn) {
				this._methods["success"] = fn;
				return this;
			};

			_this.prototype.error = function(fn) {
				this._methods["error"] = fn;
				return this;
			};

			_this.prototype.get = function() {

				var connection_url = "http://" + config.api.host;
				connection_url += ":" + config.api.port + "/api/";

				data = this._data || {};
				var __this = this;

				$.get(connection_url + this._uri, data, function(data) {

					if(!data) {

						var cb = __this._methods["error"] || 

						cb();
					}

					var response = toString.call(data) == toString.call("str") ? 
						JSON.parse(data) : data;

					if(!response) {

						var cb = __this._methods["error"] || function(){};
						cb(response);
					}

					else if(response.result 
						&& response.result == "success") {

						var cb = __this._methods["success"] || function(){};
						cb(response);
					}

					else if(response.result 
						&& response.result == "error") {

						var cb = __this._methods["error"] || function(){};
						cb(response);
					}

					else {

						var cb = __this._methods["error"] || function(){};
						cb(response);
					}

				});

				return this;
			};

			return _this;

		}; exports.api = function(url, data){

			// TODO: improve API wrapper
			var obj = new Api(core.config);
			return new obj(url, data);
		};

		function init() {

			if(location.hash) {
				core.client.render(location.hash);
			}

			core.log.info("sandbox initialized successfully...")
			return exports;
		}	

		return init();	
	};


	window.Application = function(sandbox) {

		var exports = {};
		var modules = {};
		var queue = {};

		function start(name) {

			modules[name] = modules[name].init(sandbox);

		}; exports.start = start;

		function startAll() {

			for(var k in modules)
				start(k);

			core.log.info("app started successfully")

		}; exports.startAll = startAll;

		function stop(name) {

			modules[name] = modules[name] = {};
			modules[k].destroy = modules[k].destroy || function(){};
			modules[k].destroy();
			modules[k] = null;
			return true;

		}; exports.stop = stop;

		function stopAll() {

			for(var k in modules) 
				stop(k)

			core.log.info("app stopped successfully");
			return true;

		}; exports.stopAll = stopAll;

		function register(name) {

			if(window[name + "_module"]) {

				var m = window[name + "_module"];
				modules[name] = new m(sandbox);
				return true;
			}

			else
				return false;
		};

		function init() {

			for(var i = 0; i < sandbox.modules.length; i++)
				if(!register(sandbox.modules[i]))
					core.log.error("Module not found: " + sandbox.modules[i])

			sandbox.broadcast.subscribe("module/call", function(data) {

				if(!modules[data.module])
					throw new Error("Module not found: " + data.module)

				else if(!modules[data.module][data.method])
					throw new Error("Method '" + data.method+"' not found in '" + data.module + "' module")
				
				else {

					var m = modules[data.module][data.method];
					m({}); 
				}
			});

			core.log.info("app initializing...")
			sandbox.broadcast.publish("app/ready", {});


			return exports;
		}	

		return init();	
	}

	var config = appConfig[appConfig.state];
	window.core = new Core(config);

	window.sandbox = new Sandbox(core);

})(window)