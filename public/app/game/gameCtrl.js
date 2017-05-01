
Drawer.createCanvas('drawing-pad');
toastr.options.timeOut = 1700;

var socket = io.connect('http://localhost:5000/', {
        reconnection: false,
        forceNew: true
    }),
    isPlaying = false,
    LOBBY_NAME = 'Lobby',
    currentRoom = LOBBY_NAME,
    currentWord = '';

var str = {
    waiting_for_other: 'Waiting for other player to connect...',
    drawing: 'Drawing...',
    guessing: 'Guessing...',
    great: 'Great !',
    nope: 'Nope...',
    guest_suggested: 'Guest suggested: ',
    connected_to_your_room: ' has connected to your room.'
};

function loginByModal() {

    Modal.open('Hi there !', 'Nickname: <input type="text" class="form-control" id="username-input"><br/>' +
        '<div class="checkbox"><label><input type="checkbox" id="dont-ask-again">Don\'t ask me again.</label></div>', [{
        string: 'Play',
        action: function() {
            var username = $('#username-input').val();
            var userColor = generateRandomColor();
            var usernameLength = username.trim().length;

            if (usernameLength < 3 || usernameLength > 10) {
                toastr.error('The password must be between 3 and 10 symbols.');
            } else {
                $.get('existingusername/' + username, function(usernameExist) {
                    if (usernameExist) {
                        toastr.error('This nickname already exist.');
                    } else {
                        if ($('#dont-ask-again').prop('checked')) {
                            localStorage.setItem('showWelcomeDialog', 'false');
                        }else {
                            localStorage.setItem('showWelcomeDialog', 'true');
                        }

                        localStorage.setItem('lastUsername', username);
                        socket.emit('adduser', username, userColor);
                        Modal.close();
                    }
                });
            }
        }
    }], true);

    var lastUsername = localStorage.getItem('lastUsername');
    if (lastUsername)  $('#username-input').val(lastUsername);
}

// on connection to server, ask for user's name with an anonymous callback
socket.on('connect', function(){
    console.log('connected')

    if (localStorage.getItem('showWelcomeDialog') == 'false' && localStorage.getItem('lastUsername')) {
        $.get('existingusername/' + localStorage.getItem('lastUsername'), function(usernameExist) {
            if (usernameExist) {
                toastr.error('This nickname already exist.');
                loginByModal();
            } else {
                socket.emit('adduser', localStorage.getItem('lastUsername'), generateRandomColor());
            }
        });
    } else {
        loginByModal();
    }
});

socket.on('disconnect', function (data) {
    Modal.open('Error', 'Something went wrong :( You was disconnected...', [{
        string: 'Reload',
        action: function() {
            window.location.reload();
            Modal.close();
        }
    }]);
});

socket.on('error', function (data) {
    console.log(data || 'error');
});

socket.on('connect_failed', function (data) {
    console.log(data || 'connect_failed');
});

socket.on('updateusername', function(data) {
    $('#username-container').text(data);
});

// listener, whenever the server emits 'updatechat', this updates the chat body
socket.on('updatechat', function (username, data, color) {

    var msg = '[' + getTime() + '] ';

    if (username == 'SERVER') {
        msg += '<i style="color: ' + color + '">' + data + '</i><br>'
    } else {
        msg += '<b style="color: ' + color + '">' + username + ':</b> ' + data + '<br>';
    }

    $('#conversation').append(msg);
});

socket.on('updateusers', function (count) {
    $('#users-count').text(count);
});

// listener, whenever the server emits 'updaterooms', this updates the room the client is in
socket.on('updaterooms', function(rooms, current_room) {

    $('#rooms-count').text(Object.keys(rooms).length - 1);

    $rooms = $('#rooms');
    $rooms.empty();

    var roomsHTML = '';

    for (var name in rooms) {

        var room = rooms[name];
        var isLocked = room.isLocked;
        var lock = (isLocked) ? '<img src="../img/lock.png" width="20" height="20" class="lock-icon"/>' : '';

        roomsHTML += '<a href="#" id="room-' + name + '" class="list-group-item';

        if (name == currentRoom) {
            roomsHTML += ' active">' + name + lock + '</a>';
        } else {
            if (room.usersCount == 2 && name != LOBBY_NAME) {
                roomsHTML += ' inactive" onclick="switchRoom(\''+name+'\', '+isLocked+')">' + name + lock + '</a>';
            } else {
                roomsHTML += '" onclick="switchRoom(\''+name+'\', '+isLocked+')">' + name + lock + '</a>';
            }
        }
    }

    $rooms.html(roomsHTML);
});

socket.on('joinroom', function(room, usersInRoom) {

    if (room == LOBBY_NAME) {
        isPlaying = false;
    } else {
        isPlaying = true;
    }

    currentRoom = room;

    if (room == LOBBY_NAME) {
        $('#chat-wrapper').fadeIn(200);
        $('#canvas-wrapper').hide();
    } else {
        $('#chat-wrapper').hide();
        $('#canvas-wrapper').fadeIn(200);

        Drawer.loadControls().enableDrawing();

        if (usersInRoom == 2) {
            Drawer.hideControls().disableDrawing();
            $('#room-info').text(str.guessing);
        } else {
            $('#room-info').text(str.waiting_for_other);
        }
    }
});

socket.on('opponentconnect', function(room, username) {
    
    toastr.info('<b>' + username + '</b>' + str.connected_to_your_room);

    if (room != LOBBY_NAME) {
        $.get('/randomword', function(word) {
            $('#word-to-draw').text(word[0]);
            $('#room-info').text(str.drawing);
            currentWord = word[0];
            socket.emit('sendword', word[1], word[0].length);
        });
    }
});

socket.on('opponentleave', function (room) {
    isPlaying = false;
    Modal.open('Negative', 'Your opponent leave the room. Go to the ' + LOBBY_NAME + '?', [{
        string: 'Go',
        action: function() {
            socket.emit('switchroom', LOBBY_NAME);
            Modal.close();
        }
    }], true);
});

// guest recieve only random letters and the real length of the word
socket.on('recieveword', function(wordArr, realLength) {
    renderLetters(wordArr, realLength);
});

// host get guest's suggestion and return to server true if it is correct
socket.on('validateword', function(word) {

    var isCorrect = (word === currentWord)
    socket.emit('iswordcorrect', isCorrect);

    if (isCorrect) {

        toastr.success(str.great);

        $.get('/randomword', function(word) {
            $('#word-to-draw').text(word[0]);
            $('#room-info').text(str.drawing);
            currentWord = word[0];
            socket.emit('sendword', word[1], word[0].length);
        });
    }

    toastr.info(str.guest_suggested + '<b>' + word + '</b>');
});

// guest recieve if his suggestion is correct
socket.on('validated', function(bool) {
    if (bool) {
        toastr.success(str.great);
    } else {
        toastr.error(str.nope);
    }
});

socket.on('drawing', function(data){
    Drawer.drawLine(data);
});

socket.on('clearing', function(){
    Drawer.clear();
});

function renderLetters(wordArr, realLength) {
    console.log('render')
    var wrapperHtml = '';
    var inputHtml = '';

    for (var i = 0; i < realLength; i++) {
        inputHtml += '<div class="letter">&nbsp;</div>';
    }
    for (var i = 0; i < wordArr.length; i++) {
        wrapperHtml += '<div class="letter">'+ wordArr[i] + '</div>';
    }

    inputHtml += '<a id="try-word" class="btn btn-primary btn-xs">Try</a>';
    inputHtml += '<a id="reset-letters" class="btn btn-primary btn-xs">Reset</a>';

    $('#letters-wrapper').html(wrapperHtml);
    $('#letters-input').html(inputHtml);

    $('#letters-wrapper').off('click', '.letter').on('click', '.letter', function() {

        if ($('#letters-input').find('.letter').last().html().length == 1) {
            return;
        }

        var value = $(this).html();
        $(this).remove();

        $('#letters-input')
            .find('.letter')
            .filter(function(){ return this.innerHTML == '&nbsp;'})
            .first().html(value);
    });

    $('#letters-input').off('click', '.letter').on('click', '.letter', function() {

        if ($(this).html() == '&nbsp;') return;

        var value = $(this).html();
        $(this).html('&nbsp;');

        if ($(this).next().hasClass('letter') && $(this).next().html() != '&nbsp;') {
            $(this).remove();
            $('#letters-input div').last('.letter').after('<div class="letter">&nbsp;</div>');
        }

        $('#letters-wrapper').append('<div class="letter">'+ value + '</div>');
    });

    $('#try-word').on('click', function() {

        var word = '';
        var $letters = $('#letters-input').find('.letter');
        var emptyDivs = $letters.filter(function(){ return this.innerHTML == '&nbsp;'}).length;

        if (emptyDivs == 0) {
            $letters.each(function(){
                word += this.innerHTML;
            });
            socket.emit('tryword', word);
        } else {
            toastr.error('Please enter ' + emptyDivs + ' more letters.');
        }
    });

    $('#reset-letters').on('click', function() {
        renderLetters(wordArr, realLength);
    });
}

function enterRoom(room, hasPass) {
    if (hasPass) {
        Modal.open(room, 'Enter password: <input type="password" id="pass-input" class="form-control input-sm"/>', [{
            string: 'Enter',
            action: function() {
                var inputVal = $('#pass-input').val().trim();

                $.get('/validatepass/' + room + '/' + inputVal , function(isValid) {
                    if (isValid) {
                        socket.emit('switchroom', room);
                        Modal.close();
                    } else {
                        toastr.error('Invalid password.');
                        $('#pass-input').val('').focus();
                    }
                });
            }
        }]);
    } else {
        socket.emit('switchroom', room);
    }
}

function switchRoom(room, hasPass) {
    if (currentRoom != LOBBY_NAME) {
        Modal.open('Confirmation', 'Are you sure you want to leave the room ?', [{
            string: 'Leave',
            action: function() {
                enterRoom(room, hasPass);
                Modal.close();
            }
        }]);
    } else {
        enterRoom(room, hasPass);
    }
}

// on load of page
$(function() {

    var $chatInput = $('#message-data'),
        $chatSendBtn = $('#send-message-button'),
        $createRoomBtn = $('#create-room-button'),
        $chatWrapper = $('#chat-wrapper');

    // when the client clicks SEND
    $chatSendBtn.click( function() {
        var message = $chatInput.val().trim();
        $chatInput.val('');
        $chatInput.focus();
        // tell server to execute 'sendchat' and send along one parameter
        if (message.length > 0) {
            socket.emit('sendchat', message);
        }
    });

    // when the client hits ENTER on their keyboard
    $chatInput.keypress(function(e) {
        if(e.which == 13) {
            $(this).blur();
            $chatSendBtn.focus().click();
        }
    });

    $chatInput.focus();

    $createRoomBtn.on('click', function() {

        if (isPlaying) {
            Modal.open('Negative', 'You already have a room. Go to ' + LOBBY_NAME + ' to create a new one.', []);
        } else {
            Modal.open('Create room', 'Password: <input id="new-room-pass" class="form-control input-sm" type="text">', [{
                string: 'Create',
                action: function() {
                    var pass = $('#new-room-pass').val().trim();

                    if (pass.length == 0) {
                        pass = false;
                    } else if (pass.length < 3 || pass.length > 10) {
                        toastr.error('The password must be between 3 and 10 symbols.');
                        return;
                    }

                    socket.emit('createroom', pass);
                    isPlaying = true;
                    Modal.close();
                }
            }]);
        }
    });
});
