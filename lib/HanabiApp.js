var express = require('express');
var SocketHandler = require('./socket.handlers.js').SocketHandler;
var GameListingProvider = require('./MemoryGameListingProvider.js').GameListingProvider;
var ClientProvider = require('./MemoryClientProvider.js').ClientProvider;
var GameListing = require('./GameListing.js').GameListing;
var Client = require('./Client.js').Client;

exports.HanabiApp = function (port) {
    var that = this;
    this.port = port;
    this.app = express();
    this.server = require('http').createServer(this.app);
    this.io = require('socket.io').listen(this.server);
    this.app.set('trust proxy', true);
    this.app.use('/static', express.static(__dirname + '/public'));

    this.app.get('/', function (req, res) {
        res.sendfile(__dirname + '/index.html');
    });

    // Per instance
    this.gameListingProvider = new GameListingProvider();
    this.clientProvider = new ClientProvider();

    this.io.sockets.on('connection', function (socket) {
        var handler = new SocketHandler(
            socket,
            that.gameListingProvider,
            GameListing,
            that.clientProvider,
            Client
        );

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

        socket.on('routeClient', function (data, callback) {
            handler.routeClient(data, callback);
        });

        socket.on('setClientName', function (data, callback) {
            handler.setClientName(data, callback);
        });

        socket.on('joinGame', function (data, callback) {
            handler.joinGame(data, callback);
        });
    });
};

exports.HanabiApp.prototype.close = function () {
    this.server.close();
};

exports.HanabiApp.prototype.listen = function () {
    this.server.listen(this.port);
};


