exports.Game = function Game (playerCount) {
    this.password = "";
    this.name = "";
    this.players = [];
    this.fireworks = null;
    this.lifetokens = null;
    this.cluetokens = null;
    this.drawpile = null;
    this.discardpile = null;

    this.state = "waiting_for_players";
}

// Observers
exports.Game.prototype.somethingObservers = [];

// Methods
exports.Game.prototype.addPlayer = function (player, callback) {
    // Take up next available player slot
    // Send playerJoined event
    // Mark game as ready if all players joined
    // Send gameReady event if all players joined
};
exports.Game.prototype.removePlayer = function (playerId, callback) {
    // Remove the specified player
    // Look up based on the player's id
    // Mark game as not ready
    // Send notReady event
    // Send playerQuit event
};

// Start the game (only if ready)
exports.Game.prototype.start = function (callback) {
};
