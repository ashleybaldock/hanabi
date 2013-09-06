var EventSource = require('./EventSource.Interface.js').EventSource;
var Card = require('./Card.js').Card;

exports.Discard = function Discard () {
    this.cards = [];
};

exports.Discard.prototype = new EventSource();
exports.Discard.prototype.constructor = exports.Discard;

exports.Discard.prototype.events = {'cardDiscarded': []};

exports.Discard.prototype.getContents = function (callback) {
    if (typeof callback !== 'function') throw 'Error: missing callback';
    callback(this.cards);
};

exports.Discard.prototype.discardCard = function (card, callback) {
    if (typeof callback !== 'function') throw 'Error: missing callback';
    if (typeof card !== 'object' || card === null || card === undefined
        || !card.hasOwnProperty('colour') || !card.colour
        || !card.hasOwnProperty('value') || !card.value) {
        callback('Error: card invalid');
        return;
    }
    this.cards.push(card);
    this.sendEvent('cardDiscarded', [card]);
    callback();
};
