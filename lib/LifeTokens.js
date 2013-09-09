var EventSource = require('./EventSource.Interface.js').EventSource;

exports.LifeTokens = function LifeTokens (max) {
    var wirings = this.createEventWiring();
    this.wiredEvents = function () { return wirings; };

    this.max = max;
    this.lives = max;
};

exports.LifeTokens.prototype = new EventSource();
exports.LifeTokens.prototype.constructor = exports.LifeTokens;
exports.LifeTokens.prototype.events = ['lifeLost', 'allLivesLost'];

exports.LifeTokens.prototype.livesRemaining = function (callback) {
    if (typeof callback !== 'function') throw 'Error: missing callback';
    callback(this.lives);
};

exports.LifeTokens.prototype.loseLife = function (callback) {
    if (typeof callback !== 'function') throw 'Error: missing callback';
    if (this.lives === 0) { callback('Error: All lives have been lost'); return; }
    this.lives -= 1;
    this.sendEvent('lifeLost', [this.lives]);
    if (this.lives === 0) this.sendEvent('allLivesLost');
    callback();
};
