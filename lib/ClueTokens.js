exports.ClueTokens = function ClueTokens (max) {
    this.max = max;
    this.clues = max;
};

exports.ClueTokens.prototype.events = {'clueUsed': [], 'clueRestored': []};

exports.ClueTokens.prototype.cluesRemaining = function (callback) {
    callback(this.clues);
};

exports.ClueTokens.prototype.useClue = function (callback) {
    if (typeof callback !== 'function') throw 'Error: missing callback';
    if (this.clues === 0) { callback('Error: No clues remain'); return; }
    this.clues -= 1;
    this.sendEvent('clueUsed');
    callback();
};

exports.ClueTokens.prototype.restoreClue = function (callback) {
    if (typeof callback !== 'function') throw 'Error: missing callback';
    if (this.clues === this.max) { callback(); return; }
    this.clues += 1;
    this.sendEvent('clueRestored');
    callback();
};

exports.ClueTokens.prototype.registerForEvent = function (eventName, callback, context) {
    if (typeof eventName !== 'string' || !this.events.hasOwnProperty(eventName)) throw 'Error: event name invalid';
    if (typeof callback !== 'function') throw 'Error: callback not a function';
    if (typeof context !== 'object') throw 'Error: context not an object';
    this.events[eventName].push({callback: callback, context: context});
};

exports.ClueTokens.prototype.sendEvent = function (eventName) {
    if (typeof eventName !== 'string' || !this.events.hasOwnProperty(eventName)) throw 'Error: event name invalid';
    for (var i = 0; i < this.events[eventName].length; i++) {
        this.events[eventName][i].callback.apply(this.events[eventName][i].context, [this.clues]);
    }
};
