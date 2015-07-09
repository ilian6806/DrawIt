var express = require('express');
var stylus = require('stylus');
var bodyParser = require('body-parser');
var cookieParser = require('cookie-parser');
var session = require('express-session');

module.exports = function(app, config) {

	app.set('view engine', 'jade');
	app.set('views', config.rootPath + '/server/views');

	app.use(cookieParser());
	app.use(bodyParser());
	app.use(session({ secret: 'js magic is magic'}));
	app.use(stylus.middleware(
		{
			src: config.rootPath + '/public',
			compile : function(str, path){
				return stylus(str).set('filename', path).set('compress', true);
			}
		}
	));
	app.use(express.static(config.rootPath + '/public'));
};