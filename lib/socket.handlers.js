
// Dependency injection permits for easier testing of handler with mock socket
exports.SocketHandler = function (socket, gameListingProvider, gameListingConstructor) {
    this.socket = socket;
    this.gameListingProvider = gameListingProvider;
    this.GameListingConstructor = gameListingConstructor;
};

exports.SocketHandler.prototype.newGame = function (data, callback) {
    if (!data || typeof data !== typeof {}) { callback("Invalid data"); return; }
    if (!data.name) { callback("Invalid data"); return; }
    if (!data.playerCount) { callback("Invalid data"); return; }

    var newListing = new this.GameListingConstructor(data.name, data.playerCount);

    this.gameListingProvider.save(newListing, function (listing, socket) {
        // TODO Send a notification indicating that this game has been created to
        // all clients subscribing to game list events

        callback();
    });
};

exports.SocketHandler.prototype.listGames = function (data, callback) {
    this.gameListingProvider.findActive(callback);
};

exports.SocketHandler.prototype.subscribeGameList = function (data, callback) {
    this.socket.join('gamelist');
};

exports.SocketHandler.prototype.unsubscribeGameList = function (data, callback) {
    this.socket.leave('gamelist');
};

