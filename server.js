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
            socket.join(room);
            socket.emit('created', room);        
        } else { 
            io.sockets.in(room).emit('join', room);
            socket.join(room);
            socket.emit('joined', room);
        }
    });
});

