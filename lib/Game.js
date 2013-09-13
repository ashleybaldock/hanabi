var EventSource = require('./EventSource.Interface.js').EventSource;

var Hand = require('./Hand.js').Hand;
var Deck = require('./Deck.js').Deck;
var Discard = require('./Discard.js').Discard;
var LifeTokens = require('./LifeTokens.js').LifeTokens;
var ClueTokens = require('./ClueTokens.js').ClueTokens;
var Fireworks = require('./Fireworks.js').Fireworks;
var Firework = require('./Firework.js').Firework;
var Card = require('./Card.js').Card;

exports.GameStates = {
    'waiting': 'waiting',
    'ready': 'ready',
    'playing': 'playing',
    'abandoned': 'abandoned',
    'complete': 'complete'
};

exports.Game = function Game (name, playerCount,
        discardConstructor, cluetokensConstructor, turncounterConstructor) {
    var wirings = this.createEventWiring();
    this.wiredEvents = function () { return wirings; };

    this.name = name;
    this.playerCount = playerCount;
    this.state = exports.GameStates.waiting;
    this.hands = [];

    var players = [];
    this.players = function () { return players; };

    this.current = 0;

    this.turncounter = new turncounterConstructor();
    this.deck = new Deck();
    this.lifetokens = new LifeTokens(3);
    this.cluetokens = new cluetokensConstructor();
    this.discard = new discardConstructor();
    this.fireworks = new Fireworks(Firework, this.lifetokens, this.discard);

    var handsize;
    if (playerCount > 3) { handsize = 4; } else { handsize = 5; }
    for (var i = 0; i < playerCount; i++) {
        players.push(null);
        var hand = new Hand(i, handsize, this.deck, this.fireworks, this.cluetokens);
        hand.registerForEvent('discardCard', this.discard.discardCard, this.discard);
        hand.registerForEvent('restoreClue', this.cluetokens.restoreClue, this.cluetokens);
        hand.registerForEvent('turnComplete', this.turncounter.takeTurn, this.turncounter);

        hand.registerForEvent('cardPlayed', this.sendCardPlayedToAllPlayers, this);
        hand.registerForEvent('cardDiscarded', this.sendCardDiscardedToAllPlayers, this);
        hand.registerForEvent('cardDrawn', this.sendCardDrawnToAllPlayers, this);
        hand.registerForEvent('clueReceived', this.sendClueReceivedToAllPlayers, this);
        this.hands.push(hand);
    }
    this.deck.registerForEvent('deckExhausted', this.turncounter.enterEndgame, this.turncounter);

    this.turncounter.registerForEvent('endgameOver', this.onEndgameOver, this);
    this.turncounter.registerForEvent('nextTurn', this.onNextTurn, this);
    this.fireworks.registerForEvent('allFireworksComplete', this.onAllFireworksComplete, this);
    this.lifetokens.registerForEvent('allLivesLost', this.onAllLivesLost, this);
};

exports.Game.prototype = new EventSource();
exports.Game.prototype.constructor = exports.Game;
exports.Game.prototype.events = ['playerJoined', 'playerLeft', 'gameReady'];
exports.Game.prototype.objectName = 'Game';

exports.Game.prototype.onNextTurn = function (lastIndex) {
    this.current = (this.current + 1) % this.playerCount;
    this.players()[this.current].moveObserver();
};

exports.Game.prototype.giveClueHandler = function (fromIndex, clientToIndex, clue, callback) {
    var toIndex = this.decodeIndex(fromIndex, clientToIndex);
    this.hands[toIndex].receiveClue(fromIndex, toIndex, clue, callback);
};

exports.Game.prototype.decodeIndex = function (fromIndex, clientToIndex) {
    if (fromIndex >= this.playerCount || fromIndex < 0) throw 'Error: Invalid fromIndex';
    if (clientToIndex >= this.playerCount || clientToIndex < 0) throw 'Error: Invalid clientToIndex';
    return (fromIndex + clientToIndex) % this.playerCount;
};

exports.Game.prototype.encodeIndex = function (fromIndex, toIndex) {
    if (fromIndex >= this.playerCount || fromIndex < 0) throw 'Error: Invalid fromIndex';
    if (toIndex >= this.playerCount || toIndex < 0) throw 'Error: Invalid toIndex';
    // Encode toIndex from the perspective of fromIndex
    var diff = toIndex - fromIndex;
    if (diff < 0) {
        return this.playerCount + diff;
    } else {
        return diff;
    }
};

exports.Game.prototype.sendCardDrawnToAllPlayers = function (playerIndex, cardIndex, card) {
    console.log('sendCardDrawnToAllPlayers with: playerIndex: ' + playerIndex + ', cardIndex: ' + cardIndex + ', card: ' + JSON.stringify(card));
    for (var i = 0; i < this.playerCount; i++) {
        var encodedPlayerIndex = this.encodeIndex(i, playerIndex);
        if (encodedPlayerIndex === 0) {
            // Hide info about own cards from players
            this.players()[i].cardDrawnObserver({
                playerIndex: encodedPlayerIndex, cardIndex: cardIndex, card: new Card(null, null)});
        } else {
            this.players()[i].cardDrawnObserver({
                playerIndex: encodedPlayerIndex, cardIndex: cardIndex, card: card});
        }
    }
};
exports.Game.prototype.sendClueReceivedToAllPlayers = function (toIndex, fromIndex, clueMask) {
    for (var i = 0; i < this.playerCount; i++) {
        var encodedToIndex = this.encodeIndex(i, toIndex);
        var encodedFromIndex = this.encodeIndex(i, fromIndex);
        this.players()[i].clueObserver({fromPlayerIndex: encodedFromIndex, toPlayerIndex: encodedToIndex, clueMask: clueMask});
    }
};
exports.Game.prototype.sendCardPlayedToAllPlayers = function (playerIndex, cardIndex, card, result) {
    for (var i = 0; i < this.playerCount; i++) {
        var encodedPlayerIndex = this.encodeIndex(i, playerIndex);
        this.players()[i].playObserver({playerIndex: encodedPlayerIndex, cardIndex: cardIndex, card: card, result: result});
    }
};
exports.Game.prototype.sendCardDiscardedToAllPlayers = function (playerIndex, cardIndex, card) {
    for (var i = 0; i < this.playerCount; i++) {
        var encodedPlayerIndex = this.encodeIndex(i, playerIndex);
        this.players()[i].discardObserver({playerIndex: encodedPlayerIndex, cardIndex: cardIndex, card: card});
    }
};

// Methods
exports.Game.prototype.addPlayer = function (player, callback) {
    if (typeof callback !== 'function') throw 'Error: missing callback';
    var setPlayer = function (index, player) {
        var hand = this.hands[index];

        // Wire up events to player so we receive notifications of their actions
        player.registerForEvent('playCard', hand.playIndex, hand);
        player.registerForEvent('discardCard', hand.discardIndex, hand);
        player.registerForEvent('giveClue', hand.giveClue, hand);

        this.cluetokens.registerForEvent('clueUsed', player.clueUsedObserver, player);
        this.cluetokens.registerForEvent('clueRestored', player.clueRestoredObserver, player);
        this.lifetokens.registerForEvent('lifeLost', player.lifeLostObserver, player);
        this.deck.registerForEvent('deckExhausted', player.deckExhaustedObserver, player);
        this.turncounter.registerForEvent('endgameBegins', player.endgameBeginsObserver, player);
        this.registerForEvent('gameReady', player.readyObserver, player);

        this.players()[index] = player;

        this.sendEvent('playerJoined', [player]);
        console.log('player joined: ' + player.getPlayerId());
        var msg = '';
        for (var i = 0; i < this.playerCount; i++) {
            if (this.players()[i] !== null) {
                msg = msg + 'players[' + i + ']: ' + this.players()[i].getPlayerId() + ', ';
            } else {
                msg = msg + 'players[' + i + ']: null, ';
            }
        }
        console.log('players now: ' + msg);

        if (this.playersReady()) {
            console.log('game ' + this.id + ' ready, setting state and sending gameReady event');
            this.state = 'ready';
            this.sendEvent('gameReady', [this]);
            var that = this;
            process.nextTick(function () {
                this.start(function (err) {
                    console.log('game ' + this.id + ' started, err: ' + err);
                }.bind(this));
            }.bind(this));
        }
        callback();
    };

    // Check if ID of new player matches existing ones (in which case replace)
    for (var i = 0; i < this.playerCount; i++) {
        if (this.players()[i] !== null && this.players()[i].getPlayerId() === player.getPlayerId()) {
            setPlayer.apply(this, [i, player]);
            return;
        }
    }
    // Take up next available player slot
    for (var i = 0; i < this.playerCount; i++) {
        if (this.players()[i] === null) {
            setPlayer.apply(this, [i, player]);
            return;
        }
    }
    // Unable to join
    callback('Error: No free player slots');
};
exports.Game.prototype.removePlayer = function (playerId, callback) {
    // Remove the specified player
    // Look up based on the player's id
    // Mark game as not ready
    // Send notReady event
    // Send playerQuit event
};

exports.Game.prototype.playersReady = function () {
    for (var i = 0; i < this.playerCount; i++) {
        if (this.players()[i] === null) {
            return false;
        }
    }
    return true;
};

// Start the game (only if ready)
exports.Game.prototype.start = function (callback) {
    if (typeof callback !== 'function') throw 'Error: missing callback';
    if (this.state !== 'ready') {
        callback('Error: invalid state for game start');
        return;
    }
    this.state = 'playing';
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
    this.players()[this.current].moveObserver();
    callback();
};

// Event handlers
exports.Game.prototype.onFireworkComplete = function () {
};
exports.Game.prototype.onLifeLost = function () {
};

exports.Game.prototype.onAllFireworksComplete = function () {
    // TODO Game over - send event to all players to inform them of the game results
};
exports.Game.prototype.onAllLivesLost = function () {
    // TODO Game over - send event to all players to inform them of the game results
};
exports.Game.prototype.onEndgameOver = function () {
    // TODO Game over - send event to all players to inform them of the game results
};
