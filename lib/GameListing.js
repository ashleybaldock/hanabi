var EventSource = require('./EventSource.Interface.js').EventSource;

exports.GameStates = {
    'waiting': 'waiting',
    'ready': 'ready',
    'playing': 'playing',
    'abandoned': 'abandoned',
    'complete': 'complete'
};

exports.GameListing = function GameListing (name, playerCount) {
    this.name = name;
    this.playerCount = playerCount;
    this.state = exports.GameStates.waiting;
    this.players = [null, null, null, null, null];
}

exports.GameListing.prototype = new EventSource();
exports.GameListing.prototype.constructor = exports.GameListing;

exports.GameListing.prototype.events = {
    'playerJoined': [],
    'playerLeft': [],
    'gameReady': []
};

// Methods
exports.GameListing.prototype.addPlayer = function (player, callback) {
    if (typeof callback !== 'function') throw 'Error: missing callback';
    var setPlayer = function (index, player) {
        this.players[index] = player;
        this.sendEvent('playerJoined', [player]);
        if (this.playersReady()) {
            this.state = 'ready';
            this.sendEvent('gameReady', [this]);
        }
        callback();
    };

    // Check if ID of new player matches existing ones (in which case replace)
    for (var i = 0; i < this.playerCount; i++) {
        if (this.players[i] !== null && this.players[i].getPlayerId() === player.getPlayerId()) {
            setPlayer.apply(this, [i, player]);
            return;
        }
    }
    // Take up next available player slot
    for (var i = 0; i < this.playerCount; i++) {
        if (this.players[i] === null) {
            setPlayer.apply(this, [i, player]);
            return;
        }
    }
    // Unable to join
    callback('Error: No free player slots');
};
exports.GameListing.prototype.removePlayer = function (playerId, callback) {
    // Remove the specified player
    // Look up based on the player's id
    // Mark game as not ready
    // Send notReady event
    // Send playerQuit event
};

exports.GameListing.prototype.playersReady = function () {
    for (var i = 0; i < this.playerCount; i++) {
        if (this.players[i] === null) {
            return false;
        }
    }
    return true;
};

// Start the game (only if ready)
exports.GameListing.prototype.start = function (callback) {
    // 1. Check if all players are joined
    // 2. Check game is in valid state to start
    // 3. Set state to started
    // 4. Deal cards (emitting drawCard events as needed)
    // 5. Pick starting player and send them a request for a move
};

exports.GameListing.prototype.playCard = function (player, card, callback) {
};

exports.GameListing.prototype.discard = function (player, card, callback) {
};

exports.GameListing.prototype.giveClue = function (fromPlayer, toPlayer, clue, callback) {
};

// Event handlers
exports.GameListing.prototype.onAllFireworksComplete = function () {
};
exports.GameListing.prototype.onFireworkComplete = function () {
};
exports.GameListing.prototype.onLifeLost = function () {
};
exports.GameListing.prototype.onAllLivesLost = function () {
};
exports.GameListing.prototype.onDeckExhausted = function () {
};
