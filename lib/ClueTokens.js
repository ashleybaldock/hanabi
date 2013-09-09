var EventSource = require('./EventSource.Interface.js').EventSource;

exports.ClueTokens = function ClueTokens (max) {
    var wirings = this.createEventWiring();
    this.wiredEvents = function () { return wirings; };

    this.max = max;
    this.clues = max;

};

exports.ClueTokens.prototype = new EventSource();
exports.ClueTokens.prototype.constructor = exports.ClueTokens;
exports.ClueTokens.prototype.events = ['clueUsed', 'clueRestored'];

exports.ClueTokens.prototype.cluesRemaining = function (callback) {
    callback(this.clues);
};

exports.ClueTokens.prototype.useClue = function (callback) {
    if (typeof callback !== 'function') throw 'Error: missing callback';
    if (this.clues === 0) { callback('Error: No clues remain'); return; }
    this.clues -= 1;
    this.sendEvent('clueUsed', [this.clues]);
    callback();
};

exports.ClueTokens.prototype.restoreClue = function (callback) {
    if (typeof callback !== 'function') throw 'Error: missing callback';
    if (this.clues === this.max) { callback(); return; }
    this.clues += 1;
    this.sendEvent('clueRestored', [this.clues]);
    callback();
};

