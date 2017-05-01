var Drawer = (function() {

	var 
		CONTROLS_HEIGHT = 50, 
		DEFAULT_THICKNESS = 10,
		DEFAULT_COLOR = '#000',
		drawingEnabled = true,
		isDrawing = false,// indicates if it is drawing now.
		startX = 0, // the starting point of next line drawing.
		startY = 0,
		resetButton,
		currentSizeNum,
		currentSize,
		currentColor,
		colorCanvas,
		colorCtx,
		settings,
		palette,
		sizeInput,
		$controls,
		controls,
		$canvas,
		canvas,
		colors,
		table,
		row,
		str,
		ids,
		ctx;

	settings = {
		thickness: DEFAULT_THICKNESS,
		color: DEFAULT_COLOR
	};

	ids = {
		sizeInput: 'drawer-size-input',
		currentColor: 'drawer-current-color',
		currentSizeNum: 'drawer-current-size',
		colorPickerCanvas: 'drawer-color-picker-canvas',
		sizeInput: 'drawer-size-input',
		resetButton: 'drawer-reset-button',
		controlBar: 'drawer-controls-bar'
	};

	str = {
		reset: 'Reset',
		color: 'Color: ',
		size: 'Size: '
	};

	/**************************************************
	** HELPERS
	**************************************************/
	function logError(msg) {
		console.error('Drawer: ' + msg);
	}

	function getCursorPosition(event, canvasElement) {
		return { 
			x: event.pageX - canvasElement.offsetLeft,
			y: event.pageY - canvasElement.offsetTop 
		};
	}

	function rgbToHex(r, g, b){
    	if (r > 255 || g > 255 || b > 255) logError('Invalid color component');
    	return ((r << 16) | (g << 8) | b).toString(16);
    }

    // check for jQuery loaded
	if (typeof $ == 'undefined') {
		logError('Drawer requires jQuery loaded.');
	}

	/**************************************************
	** SETTERS
	**************************************************/
	function setColor(newColor) {

		if (typeof newColor != 'string') {
			logError('Color must by set as string.');
			return;
		}

		settings.color = newColor;

		$(function() {
			currentColor = document.getElementById(ids.currentColor);
			if (currentColor) currentColor.style.backgroundColor = newColor;
		});

		return this;
	}

	function setSize(newSize) {

		if (typeof newSize != 'number') {
			logError('Size must by set as number.');
			return;
		}

		settings.thickness = newSize;

		$(function() {
			currentSize = document.getElementById(ids.sizeInput);
			currentSizeNum = document.getElementById(ids.currentSizeNum);

			if (currentSize && currentSizeNum) {
				currentSizeNum.innerHTML = newSize;
				currentSize.value = newSize;
				$(currentSize).trigger('input');
			}
		});

		return this;
	}

	/**************************************************
	** RENDERING METHODS
	**************************************************/
    function setControlsBarTemplate() {

    	row.childNodes[0].style.width = '40%';
		row.childNodes[1].style.width = '8%';
		row.childNodes[2].style.width = '8%';
		row.childNodes[3].style.width = '8%';
		row.childNodes[4].style.width = '3%';
		row.childNodes[5].style.width = '24%';
		row.childNodes[6].style.width = '9%';

		row.childNodes[1].innerHTML = str.color;
		row.childNodes[3].innerHTML = str.size;

		row.childNodes[2].style.backgroundColor = DEFAULT_COLOR;
		row.childNodes[2].style.borderRadius = '50%';
    }

    function loadColorPicker() {

    	colorCanvas = document.createElement('canvas');
		colorCtx = colorCanvas.getContext('2d');
		colorCanvas.id = ids.colorPickerCanvas;
		colorCanvas.width = 300;
		colorCanvas.height = CONTROLS_HEIGHT - 8;

		row.childNodes[2].id = ids.currentColor;
		row.childNodes[0].appendChild(colorCanvas);

		palette = new Image();

		palette.onload = function() {
			colorCtx.drawImage(palette, 0, 0, 300, CONTROLS_HEIGHT);
		};
		palette.crossOrigin = 'anonymous'; // security issues 
		palette.src = 'https://lh5.googleusercontent.com/-tLrMu9cdcpY/UVS2E1JjRpI/AAAAAAAABR8/PoVUb56Coxs/s420/spectrum.png';

		colorCanvas.onclick = function(e) {
			var imageData = colorCtx.getImageData(e.layerX, e.layerY, 1, 1).data;
			var rgbColor = '#' + ('000000' + rgbToHex(imageData[0], imageData[1], imageData[2])).slice(-6);
			row.childNodes[2].style.backgroundColor = settings.color = rgbColor;
		};
    }

    function loadSizeInput() {

    	sizeInput = document.createElement('input');
		sizeInput.type = 'range';
		sizeInput.id = ids.sizeInput;
		sizeInput.min = 1;
		sizeInput.max = 100;
		sizeInput.value = row.childNodes[4].innerHTML = settings.thickness = DEFAULT_THICKNESS;
		sizeInput.style.width = '90%';
		sizeInput.oninput = function() {
			row.childNodes[4].innerHTML = settings.thickness = this.value;
		};
		row.childNodes[4].id = ids.currentSize;
		row.childNodes[5].appendChild(sizeInput);
    }

    function loadResetButton() {
    	resetButton = document.createElement('button');
    	resetButton.id = ids.resetButton;
    	resetButton.className = 'btn btn-primary btn-xs';
    	resetButton.innerHTML = str.reset;
    	resetButton.onclick = function() {
    		clear();
    		socket.emit('clear');
    	};

    	row.childNodes[6].appendChild(resetButton);
    }

	function loadControls() {

		if (!canvas) {
			logError('Can\'t find canvas element.');
			return this;
		}

		if (controls) {
			$controls.show();
			logError('Controls bar already loaded.');
			return this;
		}

		controls = document.createElement('div');
		controls.id = ids.controlBar;
		$controls = $(controls);
		$canvas.before($controls);
		$controls.width($canvas.width());
		$controls.height(CONTROLS_HEIGHT);
		$canvas.attr('height', $canvas.height() - CONTROLS_HEIGHT);

		table = document.createElement('table');
		row = document.createElement('tr');

		table.style.width = '100%';
		table.style.height = '100%';

		for (var i = 0; i < 7; i++) {
			var td = document.createElement('td');
			td.style.textAlign = 'center';
			row.appendChild(td);
		}

		setControlsBarTemplate();
		loadResetButton();
		loadSizeInput();
		loadColorPicker();

		table.appendChild(row);
		controls.appendChild(table);

		return this;
	}

	function hideControls() {
		if ($controls) {
			$controls.hide();
		} else {
			logError('Controls bar not loaded yet.');
		}

		return this;
	}

	function createCanvas(id, hasControlsBar) {

		$(function() {
			canvas = document.getElementById(id);
			canvas.style.position = 'relative';
			ctx = canvas.getContext('2d');
			$canvas = $(canvas);
			bindCanvasEvents();

			if (hasControlsBar) {
				loadControls();
			}
		});

		return this;
	}

	function drawLine(params) {
		ctx.beginPath();
		ctx.moveTo(params.x1, params.y1);
		ctx.lineTo(params.x2, params.y2);
		ctx.lineWidth = params.size;
		ctx.strokeStyle = params.color;
		ctx.lineCap = 'round';
		ctx.stroke();
	}

	function sendServerData(params) {
		socket.emit('drawing data', params);
	}
	
	function clear() {
		ctx.clearRect(0, 0, canvas.width, canvas.height);
	}

	function enableDrawing() {
		drawingEnabled = true;
		return this;
	}

	function disableDrawing() {
		drawingEnabled = false;
		return this;
	}

	function bindCanvasEvents() {
		// the logic of drawing on canvas
		$canvas.mousedown(function(e) {

			if (!drawingEnabled) return;

			// get the mouse x and y relative to the canvas top-left point.
			var pos = getCursorPosition(e, canvas);
			var mouseX = pos.x || 0;
			var mouseY = pos.y || 0;
			var size = settings.thickness || DEFAULT_THICKNESS;

			startX = mouseX;
			startY = mouseY;

			if (pos.x < 24 + size / 2
			 || pos.x > 670 - size / 2
			 || pos.y < 30 + size / 2 
			 || pos.y > 370 - size / 2) {
				//isDrawing = false;
				return;
			}

			var params = {
				x1: startX + 1,
				y1: startY + 1,
				x2: mouseX,
				y2: mouseY,
				color: settings.color,
				size: settings.thickness
			};

			drawLine(params);
			sendServerData(params);
			isDrawing = true;
		});

		$canvas.mousemove(function(e) {
			// draw lines when is drawing
			if (isDrawing) {
				// get the mouse x and y relative to the canvas top-left point.
				var pos = getCursorPosition(e, canvas);
				var mouseX = pos.x || 0;
				var mouseY = pos.y || 0;
				var size = settings.thickness || DEFAULT_THICKNESS;

				// Limit drawing to the canvas
				if (pos.x < 24 + size / 2
				 || pos.x > 670 - size / 2
				 || pos.y < 30 + size / 2 
				 || pos.y > 370 - size / 2) {
					//isDrawing = false;
					return;
				}

				if (!(mouseX == startX && mouseY == startY)) {

					var params = {
						x1: startX + 1,
						y1: startY + 1,
						x2: mouseX,
						y2: mouseY,
						color: settings.color,
						size: settings.thickness
					};

					drawLine(params);
					sendServerData(params);

					startX = mouseX;
					startY = mouseY;
				}
			}
		});

		$canvas.mouseup(function(e) {
			isDrawing = false;
		});
	}

	return {
		createCanvas: createCanvas,
		loadControls: loadControls,
		hideControls: hideControls,
		enableDrawing: enableDrawing,
		disableDrawing: disableDrawing,
		drawLine: drawLine,
		setColor: setColor,
		setSize: setSize,
		clear: clear
	};
}());
