var EventSource = require('./EventSource.Interface.js').EventSource;

var Hand = require('./Hand.js').Hand;
var Deck = require('./Deck.js').Deck;

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
    this.players = [];
    this.hands = [];

    this.deck = new Deck();

    var handsize;
    if (playerCount > 3) { handsize = 4; } else { handsize = 5; }
    for (var i = 0; i < playerCount; i++) {
        this.players.push(null);
        this.hands.push(new Hand(handsize, this.deck));
    }
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
    if (typeof callback !== 'function') throw 'Error: missing callback';
    // 1. Check game is in valid state to start
    if (this.state !== 'ready') {
        callback('Error: invalid state for game start');
        return;
    }
    // 2. Set state to started
    this.state = 'playing';
    // 3. Deal cards (emitting drawCard events as needed)
    var done = false;
    while (!done) {
        for (var i = 0; i < this.playerCount; i++) {
            this.hands[i].drawCard(function (err) {
                if (err === 'Error: hand full') {
                    done = true;
                }
            });
        }
    }
    // 4. Pick starting player and send them a request for a move
    callback();
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
