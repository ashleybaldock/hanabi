var EventSource = require('./EventSource.Interface.js').EventSource;

exports.Hand = function Hand (cardCount, deck) {
    this.cards = [];
    this.size = cardCount;
    // Hide this inside a closure to prevent it being serialised
    this.deck = function () { return deck };

    this.events = {'cardDrawn': []};
};

exports.Hand.prototype = new EventSource();
exports.Hand.prototype.constructor = exports.Hand;

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
            console.log('cardDrawn events count: ' + that.events['cardDrawn'].length);
            that.sendEvent('cardDrawn', [card]);
            callback();
        }
    });
};
