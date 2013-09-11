var EventSource = require('./EventSource.Interface.js').EventSource;
var Card = require('./Card.js').Card;

exports.Hand = function Hand (index, cardCount, deck, fireworks, cluetokens) {
    var wirings = this.createEventWiring();
    this.wiredEvents = function () { return wirings; };

    this.cards = [];
    this.index = index;
    this.size = cardCount;
    // Hide this inside a closure to prevent it being serialised
    this.deck = function () { return deck };
    this.fireworks = function () { return fireworks };
    this.cluetokens = function () { return cluetokens };
};

exports.Hand.prototype = new EventSource();
exports.Hand.prototype.constructor = exports.Hand;
exports.Hand.prototype.events = ['cardDrawn', 'discardCard', 'restoreClue', 'turnComplete', 'giveClue', 'clueReceived'];
exports.Hand.prototype.objectName = 'Hand';

exports.Hand.prototype.drawCard = function (callback) {
    if (typeof callback !== 'function') throw 'Error: missing callback';
    if (this.cards.length === this.size) {
        callback('Error: hand full');
        return;
    }
    var that = this;
    this.deck().drawCard(function (card) {
        if (typeof card === 'string') {
            callback(card); // Error
        } else {
            that.cards.push(card);
            that.sendEvent('cardDrawn', [card]);
            callback();
        }
    });
};

exports.Hand.prototype.playIndex = function (cardIndex, callback) {
    if (this.cards.length < cardIndex + 1) {
        callback('Error: invalid index');
        return;
    }
    var cardToPlay = this.cards.splice(cardIndex, 1)[0];
    var that = this;
    this.fireworks().play(cardToPlay, function (err) {
        that.drawCard(function () {
            that.sendEvent('turnComplete', []);
            callback();
        });
    });
};

exports.Hand.prototype.discardIndex = function (cardIndex, callback) {
    if (this.cards.length < cardIndex + 1) {
        callback('Error: invalid index');
        return;
    }
    var cardToDiscard = this.cards.splice(cardIndex, 1)[0];
    var that = this;
    this.sendEvent('discardCard', [cardToDiscard]);
    this.sendEvent('restoreClue', []);
    this.drawCard(function () {
        that.sendEvent('turnComplete', []);
        callback();
    });
};

// This is just a wrapper/redirect so that we get the index associated with the calling player
exports.Hand.prototype.giveClue = function (clientPlayerIndex, clue, callback) {
    this.sendEvent('giveClue', [this.index, clientPlayerIndex, clue, callback]);
};

exports.Hand.prototype.checkClueValidity = function (clue) {
    for (var i = 0; i < this.cards.length; i++) {
        if (this.cards[i].colour === clue || this.cards[i].value === clue) return true;
    }
    return false;
};

exports.Hand.prototype.getClueMask = function (clue) {
    var result = [];
    for (var i = 0; i < this.cards.length; i++) {
        var obj = new Card(null, null);
        if (this.cards[i].colour === clue) obj.colour = clue;
        if (this.cards[i].value === clue) obj.value = clue;
        result.push(obj);
    }
    return result;
};

exports.Hand.prototype.receiveClue = function (toIndex, fromIndex, clue, callback) {
    if (!this.checkClueValidity(clue)) {
        callback('Error: clue invalid');
        return;
    }
    var that = this;
    this.cluetokens().useClue(function (err) {
        if (err === undefined) {
            that.sendEvent('clueReceived', [toIndex, fromIndex, that.getClueMask(clue)]);
        }
        callback(err);
    });
};
