
var words = ['airport', 'android', 'animals', 'balcony', 'balloon', 'battery', 'bazooka',
			 'bicycle', 'bigfoot', 'butcher', 'captain', 'caveman', 'chicken', 'chimney',
			 'coconut', 'college', 'compass', 'cowgirl', 'cupcake', 'curtain', 'dentist',
			 'diploma', 'dolphin', 'dracula', 'factory', 'feather', 'frisbee', 'funeral',
			 'giraffe', 'glasses', 'gorilla', 'grandma', 'grandpa', 'haircut', 'hamster',
			 'handbag', 'holiday', 'iceberg', 'icecube', 'javelin', 'ketchup', 'kitchen',
			 'library', 'lighter', 'magazine', 'meatball', 'monster', 'morning', 'mosquito',
			 'mountain', 'mustache', 'necklace', 'origami', 'painter', 'paperbag', 'parents',
			 'penguin', 'petshop', 'picture', 'pingpong', 'popcorn', 'portrait', 'postcard',
			 'pregnant', 'pumpkin', 'pyramid', 'rainbow', 'rockstar', 'sandals', 'sandwich',
			 'science', 'scooter', 'seahorse', 'shampoo', 'sheriff', 'shoulder', 'snowball',
			 'snowman', 'soldier', 'speaker', 'spinach', 'squirrel', 'stadium', 'stomach', 
			 'sunshine', 'swimsuit', 'teacher', 'thunder', 'tornado', 'torpedo', 'tortoise', 
			 'traffic', 'tricycle', 'trumpet', 'village', 'vitamin', 'volcano', 'warrior', 
			 'waterbed', 'wedding', 'werewolf', 'whiskey', 'windows'];

var alphabet = ['a', 'b', 'c', 'd', 'e', 'f', 'g', 'h', 'i', 'j', 'k', 'l', 'm',
 				'n', 'o', 'p', 'q', 'r', 's', 't', 'u', 'v', 'w', 'x', 'y', 'z'];

// Extend Array prototype 
Array.prototype.random = function() {
	return r = this[Math.floor(Math.random() * this.length)];
};

Array.prototype.shuffle = function() {
    for (var j, x, i = this.length; 
    i; j = parseInt(Math.random() * i), x = this[--i], this[i] = this[j], this[j] = x);
    return this;
};

function get() {
	return words.random();
}

function explode(strWord) {
	var word = strWord.split('');
	for (var i = 0 ; i < 6; i++) word.push(alphabet.random());
	return word.shuffle();
}

module.exports = {
	get: get,
	explode: explode
};