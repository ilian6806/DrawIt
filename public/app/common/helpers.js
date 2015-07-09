_get = {
	id: function(id) {
		return document.getElementById(id);
	}
}

_create = function(elementType, props) {
	var 
		el = document.createElement(elementType),
		propKeys = Object.keys(props),
		i = 0;

		for (; i < propKeys.length; i++) {
			el[propKeys[i]] = props[propKeys[i]];
		}

	return el;
}


function padToTwo(number) {
    return (number < 10) ? String('00' + number).slice(-2) : number;
}

function getTime() {
	var date = new Date();
	return padToTwo(date.getHours()) + ':' + padToTwo(date.getMinutes());
}

function generateRandomColor() {
    var red = (Math.random() * 256) | 0;
    var green = (Math.random() * 256) | 0;
    var blue = (Math.random() * 256) | 0;

    return "rgb(" + red + "," + green + "," + blue + ")";
}