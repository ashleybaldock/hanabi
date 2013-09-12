var EventSource = require('./EventSource.Interface.js').EventSource;

exports.PlayerInterface = function PlayerInterface () {
    var wirings = this.createEventWiring();
    this.wiredEvents = function () { return wirings; };

};

exports.PlayerInterface.prototype = new EventSource();
exports.PlayerInterface.prototype.constructor = exports.PlayerInterface;
exports.PlayerInterface.prototype.events = ['playCard', 'discardCard', 'giveClue'];

// Return a unique ID which identifies this Player
// Used when adding/removing
exports.PlayerInterface.prototype.getPlayerId = function () {
};
// data: null
// Indicates it is this player's turn
exports.PlayerInterface.prototype.moveObserver = function (data) {
};
// data: {playerIndex: Number, cardIndex: Number, card: Card}
//       Card with null fields is own drawn card (hidden)
exports.PlayerInterface.prototype.cardDrawnObserver = function (data) {
};
// data: {playerIndex: Number, cardIndex: Number, card: Card}
exports.PlayerInterface.prototype.playObserver = function (data) {
};
// data: {fromPlayerIndex: Number, toPlayerIndex: Number, clueMask: object}
exports.PlayerInterface.prototype.clueObserver = function (data) {
};
// data: {playerIndex: Number, cardIndex: Number, card: Card}
exports.PlayerInterface.prototype.discardObserver = function (data) {
};
// data: null
exports.PlayerInterface.prototype.clueUsedObserver = function (data) {
};
// data: null
exports.PlayerInterface.prototype.clueRestoredObserver = function (data) {
};
// data: null
exports.PlayerInterface.prototype.lifeLostObserver = function (data) {
};
// data: null
exports.PlayerInterface.prototype.endgameBeginsObserver = function (data) {
};
// data: null
exports.PlayerInterface.prototype.deckExhaustedObserver = function (data) {
};

// These are NOT part of the interface since it's the events which form this half
// Called by implementation of PlayerInterface (e.g. RPC call or AI)
// Callback indicates success or failure
// cardIndex is 0-4
exports.PlayerInterface.prototype.play = function (cardIndex, callback) {
    this.sendEvent('playCard', [cardIndex, callback]);
};
// clue is either colour or number
exports.PlayerInterface.prototype.giveClue = function (playerIndex, clue, callback) {
    this.sendEvent('giveClue', [playerIndex, clue, callback]);
};
// card is 0-4
exports.PlayerInterface.prototype.discard = function (cardIndex, callback) {
    this.sendEvent('discardCard', [cardIndex, callback]);
};
