var EventSource = require('./EventSource.Interface.js').EventSource;

exports.TurnCounter = function TurnCounter (playerCount) {
    var wirings = this.createEventWiring();
    this.wiredEvents = function () { return wirings; };

    this.turn = 0;
    this.endgame = false;
    this.remaining = playerCount;
};

exports.TurnCounter.prototype = new EventSource();
exports.TurnCounter.prototype.constructor = exports.TurnCounter;
exports.TurnCounter.prototype.events = ['endgameOver'];

exports.TurnCounter.prototype.takeTurn = function (callback) {
    this.turn += 1;
    if (this.endgame) {
        this.remaining -= 1;
        if (this.remaining === 0) {
            this.sendEvent('endgameOver', [this.turn]);
        }
    }
};

exports.TurnCounter.prototype.enterEndgame = function () {
    if (this.endgame) throw 'Error: enterEndgame called while already in endgame';
    this.endgame = true;
};
