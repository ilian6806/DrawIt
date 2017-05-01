
module.exports = function(io, config) {

    var
        SERVER_NAME = 'SERVER',
        SERVER_COLOR = 'rgb(150,150,150)',
        LOBBY_NAME = 'Lobby',
        rooms = [LOBBY_NAME],
        lockedRooms = [];
    
    users = {}, // users online
    roomsPass = {};

    io.sockets.on('connection', function (socket) {

        socket.usersInRoom = function(room) {
            return Object.keys(this.adapter.rooms[room]).length;
        };

        socket.getRoomsInfo = function() {
            var roomsObj = {};
            for (var i = 0; i < rooms.length; i++) {
                roomsObj[rooms[i]] = {
                    isLocked: (lockedRooms.indexOf(rooms[i]) > -1),
                    usersCount: this.usersInRoom(rooms[i])
                };
            }
            return roomsObj;
        };

        console.log('Server connection');

        // when the client emits 'adduser', this listens and executes
        socket.on('adduser', function(username, color) {
            //username = 'User_' + socket.id.slice(0, 5); //temp
            socket.emit('updateusername', username);
            // store the username in the socket session for this client
            socket.username = username;
            // store the room name in the socket session for this client
            socket.room = LOBBY_NAME;
            // add the client's username to the global list
            users[username] = {
                color: color,
                isDrawer: false
            };
            // send client to Lobby
            socket.join(LOBBY_NAME);
            // echo to client they've connected
            socket.emit('updatechat', SERVER_NAME, 'You have connected to ' + LOBBY_NAME, SERVER_COLOR);
            // echo to Lobby that a person has connected
            socket.broadcast.to(LOBBY_NAME).emit('updatechat', SERVER_NAME, username + ' has connected to this room', SERVER_COLOR);

            console.log('All sockets: ' + io.sockets.sockets.length);
            console.log('Rooms info: ');
            console.dir(socket.getRoomsInfo());

            io.sockets.emit('updateusers', io.sockets.sockets.length);
            socket.emit('updaterooms', socket.getRoomsInfo(), LOBBY_NAME);
        });

        // when the client emits 'sendchat', this listens and executes
        socket.on('sendchat', function (data) {
            // we tell the client to execute 'updatechat' with 3 parameters
            io.sockets.in(socket.room).emit('updatechat', socket.username, data, users[socket.username].color);
        });
        
        function deleteRoom(room) {
            if (!room || room == LOBBY_NAME || rooms.indexOf(room) == -1) {
                console.log('Deleting Lobby?');
                return;
            }
            rooms.splice(rooms.indexOf(room), 1);
            if (lockedRooms.indexOf(room) > -1) {
                lockedRooms.splice(lockedRooms.indexOf(room), 1);
            }
            delete roomsPass[room];
            io.emit('updaterooms', socket.getRoomsInfo(), room);
        }

        socket.on('switchroom', function(newroom, pass) {

            var oldroom = socket.room;

            if (socket.room != LOBBY_NAME) {
                socket.broadcast.to(socket.room).emit('opponentleave', socket.room);
            }

            socket.leave(oldroom);
            socket.join(newroom);
            socket.emit('updatechat', SERVER_NAME, 'You have connected to '+ newroom, SERVER_COLOR);
            // sent message to OLD room
            socket.broadcast.to(oldroom).emit('updatechat', SERVER_NAME, socket.username+' has left this room', SERVER_COLOR);
            // update socket session room title
            socket.room = newroom;
            socket.broadcast.to(newroom).emit('updatechat', SERVER_NAME, socket.username+' has joined this room', SERVER_COLOR);
            socket.broadcast.to(newroom).emit('opponentconnect', newroom, socket.username);
            socket.emit('clearing');
            socket.broadcast.to(newroom).emit('clearing');
            socket.emit('joinroom', newroom, socket.usersInRoom(newroom));
            io.emit('updaterooms', socket.getRoomsInfo(), newroom);

            // if lonely player delete room
            if (socket.usersInRoom(oldroom) == 0 && oldroom != LOBBY_NAME) {
                console.log('Deleted room: ' + oldroom);
                deleteRoom(oldroom);
            }
        });

        socket.on('createroom', function (pass) {
            var newroom = socket.username;
            rooms.push(newroom);
            roomsPass[newroom] = pass;
            if (pass) lockedRooms.push(newroom);
            socket.leave(socket.room);
            socket.join(newroom);
            socket.room = newroom;
            socket.emit('clearing');
            socket.emit('joinroom', newroom, socket.usersInRoom(newroom));
            socket.emit('updaterooms', socket.getRoomsInfo(), newroom);
            socket.broadcast.emit('updaterooms', socket.getRoomsInfo(), LOBBY_NAME);
            socket.broadcast.to(LOBBY_NAME).emit('updatechat', SERVER_NAME, socket.username +' create a room', SERVER_COLOR);
        });

        socket.on('deleteroom', deleteRoom);

        // when the user disconnects.. perform this
        socket.on('disconnect', function() {
            // remove the username from global usernames list
            console.log('User leave: ' + socket.username)
            delete users[socket.username];
            // update list of users in chat, client-side
            io.sockets.emit('updateusers', Object.keys(users));
            // echo globally that this client has left
            socket.broadcast.emit('updatechat', SERVER_NAME, socket.username + ' has disconnected', SERVER_COLOR);
            io.sockets.emit('updateusers', io.sockets.sockets.length);
            socket.leave(socket.room);
            if (socket.room != LOBBY_NAME) {
                socket.broadcast.to(socket.room).emit('opponentleave', socket.room);
            }
            if (socket.usersInRoom(socket.room) == 0 && socket.room != LOBBY_NAME) {
                deleteRoom(socket.room);
            }
        });

        socket.on('sendword', function(wordArr, realLength) {
            socket.broadcast.to(socket.room).emit('recieveword', wordArr, realLength);
        });

        socket.on('tryword', function(word) {
            socket.broadcast.to(socket.room).emit('validateword', word);
        });

        socket.on('iswordcorrect', function(bool) {
            socket.broadcast.to(socket.room).emit('validated', bool);
            if (bool) {
                io.sockets.in(socket.room).emit('clearing');
            }
        });

        socket.on('drawing data', function(data) {
            socket.broadcast.to(socket.room).emit('drawing', data);
        });

        socket.on('clear', function() {
            socket.broadcast.to(socket.room).emit('clearing');
        });
    });
}