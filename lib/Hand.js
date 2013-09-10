var EventSource = require('./EventSource.Interface.js').EventSource;

exports.Hand = function Hand (cardCount, deck, discard, fireworks) {
    var wirings = this.createEventWiring();
    this.wiredEvents = function () { return wirings; };

    this.cards = [];
    this.size = cardCount;
    // Hide this inside a closure to prevent it being serialised
    this.deck = function () { return deck };
    this.discard = function () { return discard };
    this.fireworks = function () { return fireworks };
};

exports.Hand.prototype = new EventSource();
exports.Hand.prototype.constructor = exports.Hand;
exports.Hand.prototype.events = ['cardDrawn'];

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
    // Attempt to play card against Fireworks (need ref to this)
    var cardToPlay = this.cards.splice(cardIndex, 1)[0];
    console.log('after splice, this.cards is: ' + JSON.stringify(this.cards));
    var that = this;
    that.fireworks().play(cardToPlay, function (err) {
        if (err === 'Error: Invalid play') {
            // Discard the card and decrement lives
            that.discard().discardCard(cardToPlay, function (err) {
                that.drawCard(function (err) {
                    if (err === 'Error: Deck exhausted') {
                    }
                    callback('Error: Invalid play');
                });
            });
        } else {
            // All done, callback ok
            console.log('after splice, that.cards is: ' + JSON.stringify(that.cards));
            that.drawCard(callback);
        }
    });
};

exports.Hand.prototype.discardIndex = function (cardIndex, callback) {
    // Discard the selected card
    // Draw a new card
    // callback with any error resulting
    // Effects propagated from Discard via events
};
