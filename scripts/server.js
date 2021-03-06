
/**
 * Module dependencies.
 */

var log = require("winston");
console.log = log.info;

var express = require('express');
var http = require('http');
var path = require('path');

var Server = function(cb) {

	cb = cb || function(){};
	var app = express();

	// all environments
	app.set('port', process.env.PORT || 3000);

	app.use("/js", express.static(path.resolve(__dirname, "../client")));
	app.use("/", express.static(path.resolve(__dirname, "../static")));

	app.use(express.favicon());
	
	// express own logger
	// app.use(express.logger('dev'));

	// enable web server logging; pipe those log messages through winston
	var winstonStream = {
    	write: function(message, encoding){
        	log.info(message);
    	}
	};
	app.use(express.logger({stream:winstonStream}));

	app.use(express.bodyParser());
	app.use(express.methodOverride());
	app.use(express.cookieParser('your secret here'));
	app.use(express.session());
	app.use(app.router);

	// development only
	if ('development' == app.get('env')) {
		app.use(express.errorHandler());
	}

	cb(http.createServer(app), app);
}

module.exports = Server;