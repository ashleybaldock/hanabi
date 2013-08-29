
// Dependency injection permits for easier testing of handler with mock socket
exports.SocketHandler = function (socket, gameListingProvider) {
    this.socket = socket;
    this.gameListingProvider = gameListingProvider;
};

exports.SocketHandler.prototype.newGame = function (data, callback) {
    if (!data || typeof data !== typeof {}) { callback("Invalid data"); return; }
    if (!data.name) { callback("Invalid data"); return; }
    if (!data.password) { callback("Invalid data"); return; }
    if (!data.playerCount) { callback("Invalid data"); return; }

    // Using GameListingProvider create and persist a new game listing

    // Send a notification indicating that this game has been created to
    // all clients subscribing to game list events
    this.socket.emit('blah');

    callback();
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

