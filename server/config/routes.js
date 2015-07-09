var words = require('./words');

module.exports = function(app) {

	app.get('/partials/:partialArea/:partialName', function(req, res) {
		res.render('../../public/app/' + req.params.partialArea + '/' + req.params.partialName);
	});

	app.get('/validatepass/:room/:pass', function(req, res) {
		res.send(roomsPass[req.params.room] && roomsPass[req.params.room] === req.params.pass);
	});

	app.get('/existingusername/:username', function(req, res) {
		console.log(111)
		console.log(Object.keys(users))
		res.send(Object.keys(users).indexOf(req.params.username) > -1);
	});

	app.get('/randomword', function(req, res) {
		var randomword = words.get();
		res.send([randomword, words.explode(randomword)]);
	});

	app.get('/', function(req, res){
		res.render('index');
	});
}