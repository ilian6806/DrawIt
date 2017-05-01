var express = require('express');
var http = require('http');
var env = process.env.NODE_ENV || 'development';

var app = express();
var config = require('./server/config/config')[env];
var io = require('socket.io').listen(5000);

require('./server/config/express')(app, config);
require('./server/config/routes')(app);
require('./server/config/sockets')(io, config);

// start the server
var server = app.listen(config.port);

// and prepare for the worst..
process.on('uncaughtException', function (err) {
    console.log(err);
    console.log('Node restarting...');
    server.close();
    server = app.listen(config.port);
    console.log('Server running on port ' + config.port + '...');
});

console.log('Server running on port ' + config.port + '...');
