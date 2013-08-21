var express = require('express')
  , app = express()
  , server = require('http').createServer(app)
  , io = require('socket.io').listen(server);

server.listen(3000);

app.set('trust proxy', true);
app.use('/static', express.static(__dirname + '/public'));

app.get('/', function (req, res) {
    res.sendfile(__dirname + '/index.html');
});

io.sockets.on('connection', function (socket) {

    socket.on('routeMe', function (data) {
        if (data !== null) {
            console.log('session cookie set to: ' + data);
            socket.emit('clearGameSessionCookie');
        } else {
            console.log('session cookie not set, setting');
            socket.emit('setGameSessionCookie', 'testing1234');
        }
    });
});
