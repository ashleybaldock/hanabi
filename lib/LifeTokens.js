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

exports.LifeTokens.prototype.livesRemaining = function () {
    return this.lives;
};

exports.LifeTokens.prototype.loseLife = function () {
    if (this.lives === 0) throw 'Error: All lives have been lost';
    this.lives -= 1;
    this.sendEvent('lifeLost', [this.lives]);
    if (this.lives === 0) this.sendEvent('allLivesLost');
};
