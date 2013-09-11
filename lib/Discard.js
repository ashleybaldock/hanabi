var EventSource = require('./EventSource.Interface.js').EventSource;
var Card = require('./Card.js').Card;

exports.Discard = function Discard () {
    var wirings = this.createEventWiring();
    this.wiredEvents = function () { return wirings; };

    this.cards = [];
};

exports.Discard.prototype = new EventSource();
exports.Discard.prototype.constructor = exports.Discard;
exports.Discard.prototype.events = ['cardDiscarded'];
exports.Discard.prototype.objectName = 'Discard';

exports.Discard.prototype.getContents = function () {
    return this.cards;
};

exports.Discard.prototype.discardCard = function (card) {
    if (typeof card !== 'object' || card === null || card === undefined
        || !card.hasOwnProperty('colour') || !card.colour
        || !card.hasOwnProperty('value') || !card.value) {
        throw 'Error: card invalid';
    }
    this.cards.push(card);
    this.sendEvent('cardDiscarded', [card]);
};
