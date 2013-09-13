var express = require('express');
var SocketHandler = require('./SocketHandler.js').SocketHandler;
var GameProvider = require('./MemoryGameProvider.js').GameProvider;
var ClientProvider = require('./MemoryClientProvider.js').ClientProvider;
var GameFactory = require('./GameFactory.js').GameFactory;
var Client = require('./Client.js').Client;

exports.HanabiApp = function (port) {
    var that = this;
    this.port = port;
    this.app = express();
    this.server = require('http').createServer(this.app);
    this.io = require('socket.io').listen(this.server);
    this.app.set('trust proxy', true);
    this.app.use('/static', express.static('./public'));

    this.app.get('/', function (req, res) {
        res.sendfile('./index.html');
    });

    // Per instance
    this.gameListingProvider = new GameProvider();
    this.clientProvider = new ClientProvider();

    this.io.sockets.on('connection', function (socket) {
        var handler = new SocketHandler(
            socket,
            that.gameListingProvider,
            GameFactory,
            that.clientProvider,
            Client
        );

        socket.on('routeClient', function (data, callback) {
            console.log('routeClient on socket: ' + socket.id + ' with data: ' + JSON.stringify(data));
            handler.routeClient(data, callback);
        });

        socket.on('subscribeGameList', function (data, callback) {
            console.log('subscribeGameList on socket: ' + socket.id + ' with data: ' + JSON.stringify(data));
            handler.subscribeGameList(data, callback);
        });

        socket.on('unsubscribeGameList', function (data, callback) {
            console.log('unsubscribeGameList on socket: ' + socket.id + ' with data: ' + JSON.stringify(data));
            handler.unsubscribeGameList(data, callback);
        });

        socket.on('newGame', function (data, callback) {
            console.log('newGame on socket: ' + socket.id + ' with data: ' + JSON.stringify(data));
            handler.newGame(data, callback);
        });

        socket.on('listGames', function (data, callback) {
            console.log('listGames on socket: ' + socket.id + ' with data: ' + JSON.stringify(data));
            handler.listGames(data, callback);
        });

        socket.on('setClientName', function (data, callback) {
            console.log('setClientName on socket: ' + socket.id + ' with data: ' + JSON.stringify(data));
            handler.setClientName(data, callback);
        });

        socket.on('joinGame', function (data, callback) {
            console.log('joinGame on socket: ' + socket.id + ' with data: ' + JSON.stringify(data));
            handler.joinGame(data, callback);
        });

        // data: {playerIndex: index, cardIndex: index}
        socket.on('playCard', function (data, callback) {
            console.log('playCard on socket: ' + socket.id + ' with data: ' + JSON.stringify(data));
            handler.playCard(data, callback);
        });

        // data: {playerIndex: index, cardIndex: index}
        socket.on('discardCard', function (data, callback) {
            console.log('discardCard on socket: ' + socket.id + ' with data: ' + JSON.stringify(data));
            handler.discardCard(data, callback);
        });

        // data: {fromPlayerIndex: index, toPlayerIndex: index, cardIndex: index}
        socket.on('giveClue', function (data, callback) {
            console.log('giveClue on socket: ' + socket.id + ' with data: ' + JSON.stringify(data));
            handler.giveClue(data, callback);
        });
    });
};

exports.HanabiApp.prototype.close = function () {
    this.server.close();
};

exports.HanabiApp.prototype.listen = function () {
    this.server.listen(this.port);
};


