var EventSource = require('./EventSource.Interface.js').EventSource;

exports.Hand = function Hand (cardCount, deck, fireworks) {
    var wirings = this.createEventWiring();
    this.wiredEvents = function () { return wirings; };

    this.cards = [];
    this.size = cardCount;
    // Hide this inside a closure to prevent it being serialised
    this.deck = function () { return deck };
    this.fireworks = function () { return fireworks };
};

exports.Hand.prototype = new EventSource();
exports.Hand.prototype.constructor = exports.Hand;
exports.Hand.prototype.events = ['cardDrawn', 'discardCard', 'restoreClue'];

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
        that.drawCard(callback);
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
    this.drawCard(callback);
};
