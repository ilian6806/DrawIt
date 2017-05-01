
var env = process.env.NODE_ENV || 'development';

var app = require('express')();
var http = require('http').createServer( app );
var io = require('socket.io')( http );

var config = require('./server/config/config')[env];

require('./server/config/express')(app, config);
require('./server/config/routes')(app);
require('./server/config/sockets')(io, config);

// start the server
var server = http.listen(config.port);

// and prepare for the worst..
process.on('uncaughtException', function (err) {
    console.log(err);
    console.log('Node restarting...');
    server.close();
    server = app.listen(config.port);
    console.log('Server running on port ' + config.port + '...');
});

console.log('Server running on port ' + config.port + '...');
