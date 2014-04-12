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
    function log() {
        var array = [">>> Message from server: "];
        for (var i = 0; i < arguments.length; i++) {
            array.push(arguments[i]);
        }
        socket.emit('log', array);
    }

    socket.on('message', function(message) {
        log('Got message: ', message);
        // For a real app, should be room only (not broadcast)
        socket.broadcast.emit('message', message);
    });

    socket.on('create or join', function(room) {
        var numClients = io.sockets.clients(room).length;

        log('Room ' + room + ' has ' + numClients + ' client(s)');
        log('Request to create or join room', room);

        if (numClients == 0) {
            socket.join(room);
            socket.emit('created', room);        
        } else { // max two clients
            io.sockets.in(room).emit('join', room);
            socket.join(room);
            socket.emit('joined', room);
        }
        socket.emit('emit(): client ' + socket.id + ' joined room ' + room);
        socket.broadcast.emit('broadcast(): client ' + socket.id + ' joined room ' + room);

    });

});

