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

// Called by Game
// Let this player know it's their turn
exports.PlayerInterface.prototype.moveObserver = function (data) {
};
// Advises of a card being drawn by one of the players
// Data consists of {player: PlayerId, card: Card}
// If the card is ours, this will be {player: PlayerId, card: Card(null, null)}
exports.PlayerInterface.prototype.cardDrawnObserver = function (data) {
};

exports.PlayerInterface.prototype.playObserver = function (data, callback) {
};
exports.PlayerInterface.prototype.clueObserver = function (data, callback) {
};
exports.PlayerInterface.prototype.discardObserver = function (data, callback) {
};
exports.PlayerInterface.prototype.endgameObserver = function (data, callback) {
};
exports.PlayerInterface.prototype.winObserver = function (data, callback) {
};
exports.PlayerInterface.prototype.lossObserver = function (data, callback) {
};

// Called by implementation of PlayerInterface (e.g. RPC call or AI)
// Callback indicates success or failure

// card is 0-4
exports.PlayerInterface.prototype.play = function (cardIndex, callback) {
    this.sendEvent('playCard', [cardIndex, callback]);
};
// clue is either colour or number
exports.PlayerInterface.prototype.clue = function (playerIndex, clue, callback) {
    this.sendEvent('giveClue', [playerIndex, clue, callback]);
};
// card is 0-4
exports.PlayerInterface.prototype.discard = function (cardIndex, callback) {
    this.sendEvent('discardCard', [cardIndex, callback]);
};

// Called when player wishes to quit, ends the game
exports.PlayerInterface.prototype.quit = function (callback) {
};

// Re-order player's cards, order gives new relative ordering
exports.PlayerInterface.prototype.reorder = function (order, callback) {
};
