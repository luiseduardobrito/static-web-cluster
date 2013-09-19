var log = require("winston");

var config = require("../config/socket");
var state = config[config.state];

var Socket = function(server) {

	var exports = {};
	var io = require('socket.io').listen(server);

	io.sockets.on('connection', function (socket) {
		socket.on('*', function (data) {
			socket.emit(data.e, data.d);
		});
	});
}

module.exports = Socket;