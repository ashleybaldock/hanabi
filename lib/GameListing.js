exports.GameStates = {
    'waiting': 'waiting',
    'ready': 'ready',
    'playing': 'playing',
    'abandoned': 'abandoned',
    'complete': 'complete'
};

exports.GameListing = function GameListing (name, playerCount) {
    this.name = name;
    this.playerCount = playerCount;
    this.state = exports.GameStates.waiting;
    this.players = [null, null, null, null, null];
}

// Observers
exports.GameListing.prototype.somethingObservers = [];

// Methods
exports.GameListing.prototype.addPlayer = function (player, callback) {
    // Take up next available player slot
    // Send playerJoined event
    // Mark game as ready if all players joined
    // Send gameReady event if all players joined
};
exports.GameListing.prototype.removePlayer = function (playerId, callback) {
    // Remove the specified player
    // Look up based on the player's id
    // Mark game as not ready
    // Send notReady event
    // Send playerQuit event
};

// Start the game (only if ready)
exports.GameListing.prototype.start = function (callback) {
};
