var path = require('path');
var rootPath = path.normalize(__dirname + '/../../');

module.exports = {

	development: {
		rootPath: rootPath,
		db: 'mongodb://localhost/draw_it',
		port: process.env.PORT || 3000
	},

	production: {
		rootPath: rootPath,
		db: 'mongodb://admin:ilian6806totalscore@ds039088.mongolab.com:39088/total-score',
		port: process.env.PORT || 3000
	}
}