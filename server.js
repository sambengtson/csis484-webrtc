var static = require('node-static');
var http = require('http');
var file = new (static.Server)();
var app = http.createServer(function(req, res) {
    file.serve(req, res);
}).listen(2013);

var io = require('socket.io').listen(app);
io.set('log level', 1);

io.sockets.on('connection', function(socket) {

    console.log('client connected');
    socket.on('message', function(message) {
        socket.broadcast.emit('message', message);
    });

    socket.on('create or join', function(room) {
        var numClients = io.sockets.clients(room).length;

        console.log('Room ' + room + ' has ' + numClients + ' client(s)');

        if (numClients === 0) {
            console.log('Creating room:' + room);
            socket.join(room);
            var clientInfo = new Object();
            clientInfo.RoomName = room;
            clientInfo.ClientId = Math.floor((Math.random() * 10000) + 1);
            socket.set('ClientInfo', clientInfo, function() {
                socket.emit('created', room);
            });
        } else {
            console.log('Joining room');
            socket.join(room);            
            var clientInfo = new Object();
            clientInfo.RoomName = room;
            clientInfo.ClientId = Math.floor((Math.random() * 10000) + 1);
            io.sockets.in(room).emit('join', clientInfo);
            socket.set('ClientInfo', clientInfo, function() {
                io.sockets.in(room).emit('joined', clientInfo);
            });
        }
    });

    socket.on('disconnect', function() {
        socket.get('ClientInfo', function(err, info) {
            io.sockets.in(info.RoomName).emit('ClientDisconnect', info.ClientId);
        });
    });
});

