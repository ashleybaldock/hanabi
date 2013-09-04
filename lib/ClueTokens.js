exports.ClueTokens = function ClueTokens () {
    this.clues = 9;
};

exports.ClueTokens.prototype.events = ['clueUsed', 'clueRestored'];

exports.ClueTokens.prototype.cluesRemaining = function (callback) {
    callback(this.clues);
};

exports.ClueTokens.prototype.useClue = function (callback) {
    if (typeof callback !== 'function') throw 'Error: missing callback';
    if (this.clues === 0) { callback('Error: No clues remain'); return; }
    this.clues -= 1;
    callback();
};

exports.ClueTokens.prototype.restoreClue = function (callback) {
};

exports.ClueTokens.prototype.registerForEvent = function (callback) {
};
