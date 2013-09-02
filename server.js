var express = require('express')
  , app = express()
  , server = exports.server = require('http').createServer(app)
  , io = require('socket.io').listen(server);

var SocketHandler = require('./lib/socket.handlers.js').SocketHandler;
var gameListingProvider = new (require('./lib/MemoryGameListingProvider.js').GameListingProvider)();
var GameListing = require('./lib/GameListing.js').GameListing;

server.listen(process.env.PORT);

app.set('trust proxy', true);
app.use('/static', express.static(__dirname + '/public'));

app.get('/', function (req, res) {
    res.sendfile(__dirname + '/index.html');
});

io.sockets.on('connection', function (socket) {
    var handler = new SocketHandler(socket, gameListingProvider, GameListing);

    socket.on('subscribeGameList', function (data, callback) {
        handler.subscribeGameList(data, callback);
    });

    socket.on('unsubscribeGameList', function (data, callback) {
        handler.unsubscribeGameList(data, callback);
    });

    socket.on('newGame', function (data, callback) {
        handler.newGame(data, callback);
    });

    socket.on('listGames', function (data, callback) {
        handler.listGames(data, callback);
    });

    socket.on('routeMe', function (data) {
        handler.routeClient(data, callback);
    });
});

