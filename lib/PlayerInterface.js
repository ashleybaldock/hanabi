exports.PlayerInterface = function PlayerInterface () {
};

// Return a unique ID which identifies this Player
// Used when adding/removing
exports.PlayerInterface.prototype.getPlayerId = function (callback) {
};

// Called by Game
// Let this player know it's their turn
exports.PlayerInterface.prototype.moveObserver = function (data, callback) {
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
exports.PlayerInterface.prototype.play = function (card, callback) {
};
// clue is either colour or number
exports.PlayerInterface.prototype.clue = function (clue, callback) {
};
// card is 0-4
exports.PlayerInterface.prototype.discard = function (card, callback) {
};

// Called when player wishes to quit, ends the game
exports.PlayerInterface.prototype.quit = function (callback) {
};

// Re-order player's cards, order gives new relative ordering
exports.PlayerInterface.prototype.reorder = function (order, callback) {
};
