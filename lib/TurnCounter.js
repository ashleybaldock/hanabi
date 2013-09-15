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
exports.TurnCounter.prototype.events = ['endgameOver', 'endgameBegins', 'nextTurn'];
exports.TurnCounter.prototype.objectName = 'TurnCounter';

exports.TurnCounter.prototype.takeTurn = function (playerIndex) {
    this.turn += 1;
    if (this.endgame) {
        if (this.remaining === 0) {
            console.log('takeTurn - endgameOver');
            this.sendEvent('endgameOver', [this.turn]);
        } else {
            this.remaining -= 1;
            this.sendEvent('nextTurn', [playerIndex]);
        }
    } else {
        this.sendEvent('nextTurn', [playerIndex]);
    }
};

exports.TurnCounter.prototype.enterEndgame = function () {
    if (this.endgame) throw 'Error: enterEndgame called while already in endgame';
    this.endgame = true;
    this.sendEvent('endgameBegins', []);
};
