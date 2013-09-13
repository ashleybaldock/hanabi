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
exports.Hand.prototype.events = ['cardDrawn', 'discardCard', 'restoreClue', 'turnComplete', 'giveClue', 'clueReceived', 'cardPlayed', 'cardDiscarded'];
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
            that.sendEvent('cardDrawn', [that.index, that.cards.length - 1, card]);
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
        var result = 'ok';
        if (err === 'Error: Invalid play') {
            result = 'failed';
        }
        that.sendEvent('cardPlayed', [that.index, cardIndex, cardToPlay, result]);
        that.drawCard(function () {
            that.sendEvent('turnComplete', []);
            callback(err);
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
    this.sendEvent('cardDiscarded', [this.index, cardIndex, cardToDiscard]);
    this.sendEvent('restoreClue', []);
    this.drawCard(function () {
        that.sendEvent('turnComplete', []);
        callback();
    });
};

// This is just a wrapper/redirect so that we get the index associated with the calling player
exports.Hand.prototype.giveClue = function (clientToIndex, clue, callback) {
    console.log('exports.Hand.prototype.giveClue - clientToIndex: ' + clientToIndex + ', clue: ' + clue);
    console.log('exports.Hand.prototype.giveClue - sending giveClue with - this.index: ' + this.index + ', clientToIndex: ' + clientToIndex + ', clue: ' + clue);
    this.sendEvent('giveClue', [this.index, clientToIndex, clue, callback]);
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

exports.Hand.prototype.receiveClue = function (fromIndex, toIndex, clue, callback) {
    console.log('exports.Hand.prototype.receiveClue - fromIndex: ' + fromIndex + ', toIndex: ' + toIndex + ', clue: ' + clue);
    if (!this.checkClueValidity(clue)) {
        callback('Error: clue invalid');
        return;
    }
    var that = this;
    this.cluetokens().useClue(function (err) {
        if (err === undefined) {
            that.sendEvent('clueReceived', [fromIndex, toIndex, that.getClueMask(clue)]);
            that.sendEvent('turnComplete', []);
        }
        callback(err);
    });
};
