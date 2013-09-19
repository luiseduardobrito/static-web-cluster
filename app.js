var pjson = require("./package.json");

var config = require("./config/general");
var socket_config = require("./config/general");

var log = require("winston")
var cluster = require('cluster');
var http = require('http');

var numCPUs = require('os').cpus().length;

var Server = require("./scripts/server");
var Socket = require("./scripts/socket");

var Cluster = function(cluster) {

	var exports = {
		master: cluster.isMaster
	};

	function start(cb) {

		cb = cb || function(){};

		if (cluster.isMaster) {

			log.info((pjson.name || "web cluster") + " > starting infrastructure...");

			for (var i = 0; i < numCPUs; i++)
				cluster.fork()

			exports.cpus = numCPUs;

			cluster.on('exit', function(worker, code, signal) {
				console.log('worker ' + worker.process.pid + ' died');
			});

			cb();
		} 

		else if (cluster.isWorker) {

			var socket = null;

			var server = new Server(function(server, app){
				server.listen(app.get('port'), function(){
					socket = new Socket(server);
					log.info('worker listening on port ' + app.get('port'));
				});
			});
		}
			

	}; exports.start = start;

	function init() {

		var state = config[config.state];
		numCPUs = state.cluster? state.cluster.max || numCPUs : numCPUs;

		return exports;
	}

	return init();
}

var cluster = new Cluster(cluster);

cluster.start(function(){
	log.info("starting cluster with " + cluster.cpus + " forks.\n")
});