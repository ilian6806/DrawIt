var express = require('express');
var http = require('http');
var env = process.env.NODE_ENV || 'development';

var app = express();
var config = require('./server/config/config')[env];
var server = http.createServer(app);
var io = require('socket.io').listen(process.env.PORT || 5000);

require('./server/config/express')(app, config);
require('./server/config/routes')(app);
require('./server/config/sockets')(io, config);

app.listen(config.port);

console.log("Server running on port " + config.port + "...");