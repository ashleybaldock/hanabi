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
