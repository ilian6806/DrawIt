var Modal = (function() {

	var 
		$dialog,
		$title,
		$content,
		$footer,
		closeButton,
		SPEED = 400;

	$(function() {
		$dialog = $('#modal-dialog');
		$title = $dialog.find('.modal-title');
		$content = $dialog.find('.modal-body p');
		$footer = $dialog.find('.modal-footer');
		closeButton = document.createElement('button');
		closeButton.className = 'btn btn-default';
		closeButton.innerText = 'Close';
		closeButton.onclick = close;
	});

	function open(title, content, buttonsObj, withoutClose) {
		if (title) $title.html(title);
		if (content) $content.html(content);
		if (buttonsObj && typeof buttonsObj == 'object' || typeof buttonsObj == 'Object') {
			$footer.html('');
			for (i in buttonsObj) {
				var button = document.createElement('button');
				button.className = 'btn btn-primary';
				button.innerText = buttonsObj[i].string;
				button.onclick = buttonsObj[i].action;
				$footer.append(button);
			}
			if (!withoutClose) $footer.append(closeButton);
		}
		$dialog.fadeIn(SPEED, function() {
			var $input = $content.find('input').first();
			if ($input) $input.focus();
		});
	}

	function close() {
		$dialog.fadeOut(SPEED);
	}

	return {
		open: open,
		close: close
	};
})();