var EventSource = require('./EventSource.Interface.js').EventSource;
var Card = require('./Card.js').Card;

/** 
 * Randomly permutes an array.
 * In-place, modern version of the Fisher-Yates algorithm.
 * The default prng is usually (way) to weak for every permutation 
 * to be a possible outcome.
 * From: http://www.wrwrwr.org/2008/january/javascript-shuffle
 */
var shuffle = function (array) {
    var n = array.length, k, t;
    if (n === 0) return false;
    while (--n) {
        k = Math.floor(Math.random() * (n+1));
        t = array[n];
        array[n] = array[k];
        array[k] = t;
    }
};

// Source for game cards
// Override the same interface to provide different game types (e.g. to add wildcard cards)
exports.Deck = function Deck () {
    var wirings = this.createEventWiring();
    this.wiredEvents = function () { return wirings; };

    this.cards = [
        new Card('red', 1), new Card('red', 1), new Card('red', 1),
        new Card('red', 2), new Card('red', 2),
        new Card('red', 3), new Card('red', 3),
        new Card('red', 4), new Card('red', 4),
        new Card('red', 5),
        new Card('blue', 1), new Card('blue', 1), new Card('blue', 1),
        new Card('blue', 2), new Card('blue', 2),
        new Card('blue', 3), new Card('blue', 3),
        new Card('blue', 4), new Card('blue', 4),
        new Card('blue', 5),
        new Card('green', 1), new Card('green', 1), new Card('green', 1),
        new Card('green', 2), new Card('green', 2),
        new Card('green', 3), new Card('green', 3),
        new Card('green', 4), new Card('green', 4),
        new Card('green', 5),
        new Card('yellow', 1), new Card('yellow', 1), new Card('yellow', 1),
        new Card('yellow', 2), new Card('yellow', 2),
        new Card('yellow', 3), new Card('yellow', 3),
        new Card('yellow', 4), new Card('yellow', 4),
        new Card('yellow', 5),
        new Card('white', 1), new Card('white', 1), new Card('white', 1),
        new Card('white', 2), new Card('white', 2),
        new Card('white', 3), new Card('white', 3),
        new Card('white', 4), new Card('white', 4),
        new Card('white', 5)
    ];
    shuffle(this.cards);
};

exports.Deck.prototype = new EventSource();
exports.Deck.prototype.constructor = exports.Deck;
exports.Deck.prototype.events = ['deckExhausted'];

exports.Deck.prototype.cardsRemaining = function (callback) {
    if (typeof callback !== 'function') throw 'Error: missing callback';
    callback(this.cards.length);
};

exports.Deck.prototype.drawCard = function (callback) {
    if (typeof callback !== 'function') throw 'Error: missing callback';
    if (this.cards.length === 0) { callback('Error: Deck exhausted'); return; }
    var removed = this.cards.pop();
    if (this.cards.length === 0) this.sendEvent('deckExhausted', []);
    callback(removed);
};
