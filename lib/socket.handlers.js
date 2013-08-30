
// Dependency injection permits for easier testing of handler with mock socket
exports.SocketHandler = function (socket, gameListingProvider, gameListingConstructor) {
    this.socket = socket;
    this.gameListingProvider = gameListingProvider;
    this.GameListingConstructor = gameListingConstructor;
};

exports.SocketHandler.prototype.newGame = function (data, callback) {
    if (!data || typeof data !== typeof {}) { callback("Invalid data"); return; }
    if (!data.name) { callback("Invalid data - missing name"); return; }
    if (!data.playerCount) { callback("Invalid data - missing playerCount"); return; }

    var newListing = new this.GameListingConstructor(data.name, data.playerCount);

    var socket = this.socket;
    this.gameListingProvider.save(newListing, function (listing) {
        socket.broadcast.to('gamelist').emit('newGameCreated', listing);
        callback();
    });
};

exports.SocketHandler.prototype.listGames = function (data, callback) {
    this.gameListingProvider.findActive(callback);
};

exports.SocketHandler.prototype.subscribeGameList = function (data, callback) {
    this.socket.join('gamelist');
    callback();
};

exports.SocketHandler.prototype.unsubscribeGameList = function (data, callback) {
    this.socket.leave('gamelist');
    callback();
};

