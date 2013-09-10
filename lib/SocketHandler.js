
// Dependency injection permits for easier testing of handler with mock socket
exports.SocketHandler = function (
    socket, gameProvider, gameFactory, clientProvider, clientConstructor) {
    this.socket = socket;
    this.gameProvider = gameProvider;
    this.GameFactory = gameFactory;
    this.clientProvider = clientProvider;
    this.ClientConstructor = clientConstructor;
};

// Executes callback with object on success, string on failure
exports.SocketHandler.prototype.newGame = function (data, callback) {
    var that = this;
    if (typeof callback !== 'function') throw 'Callback mandatory for newGame call';
    if (!data || typeof data !== typeof {}) { callback("Invalid data"); return; }
    if (!data.hasOwnProperty('name') || !data.name) { callback("Invalid data - missing name"); return; }
    if (!data.hasOwnProperty('playerCount')) { callback("Invalid data - missing playerCount"); return; }

    var newListing = this.GameFactory(data.name, data.playerCount);

    this.gameProvider.save(newListing, function (listing) {
        that.socket.broadcast.to('gamelist').emit('newGameCreated', listing);
        callback(listing);
    });
};

exports.SocketHandler.prototype.listGames = function (data, callback) {
    this.gameProvider.findActive(callback);
};

exports.SocketHandler.prototype.subscribeGameList = function (data, callback) {
    if (typeof callback !== 'function') callback = function () {};
    this.socket.join('gamelist');
    callback();
};

exports.SocketHandler.prototype.unsubscribeGameList = function (data, callback) {
    if (typeof callback !== 'function') callback = function () {};
    this.socket.leave('gamelist');
    callback();
};

// First call after connect, sets up client's ID for future purposes
exports.SocketHandler.prototype.routeClient = function (data, callback) {
    if (typeof callback !== 'function') callback = function () {};
    if (!data || typeof data !== 'object') { callback("Invalid data - not an object"); return; }
    if (!data.hasOwnProperty('id')) { callback("Invalid data - missing id"); return; }
    var that = this;
    this.clientProvider.findById(data.id, function (record) {
        if (record === undefined) {
            console.log('setting new clientId');
            var newClient = new that.ClientConstructor();
            that.clientProvider.save(newClient, function (saved) {
                that.socket.set('clientId', saved.id, function () {
                    that.socket.emit('setClientId', saved.id);
                    that.socket.emit('gotoSplash', null);
                    callback();
                });
            });
        } else {
            console.log('using existing clientId');
            that.socket.set('clientId', record.id, function () {
                that.gameProvider.findActiveByClientId(record.id, function (gameRecords) {
                    if (gameRecords.length === 0) {
                        that.socket.emit('gotoSplash', null);
                        callback();
                    } else if (gameRecords.length === 1) {
                        that.socket.emit('gotoGame', gameRecords[0].id);
                        callback();
                    } else {
                        callback('Error: Multiple active games associated with client id!');
                    }
                });
            });
        }
    });
};

// data of form {name: 'new name', id: clientId}
exports.SocketHandler.prototype.setClientName = function (data, callback) {
    if (typeof callback !== 'function') callback = function () {};
    var that = this;
    var id = null;
    if (data && data.hasOwnProperty('id')) { id = data.id };
    this.clientProvider.findById(id, function (record) {
        if (record === undefined) {
            callback('Failed: clientId not found');
        } else {
            record.name = data.name;
            that.clientProvider.save(record, function (saved) {
                callback();
            });
        }
    });
};

exports.SocketHandler.prototype.joinGame = function (data, callback) {
    if (!data || typeof data !== 'object') { callback("Invalid data - not an object"); return; }
    if (!data.hasOwnProperty('id')) { callback("Invalid data - missing id"); return; }
    var that = this;
    this.socket.get('clientId', function (err, val) {
        console.log('err: ' + err + ', val: ' + val);
        if (val === null) {
            callback('Error: clientId not set on socket, call routeClient first!');
        } else {
            callback();
        }
    });
};

