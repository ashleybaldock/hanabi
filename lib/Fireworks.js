var EventSource = require('./EventSource.Interface.js').EventSource;

exports.Fireworks = function Fireworks (Firework, lifetokens) {
    var wirings = this.createEventWiring();
    this.wiredEvents = function () { return wirings; };

    this.fireworks = {
        red:    new Firework('red'),
        blue:   new Firework('blue'),
        green:  new Firework('green'),
        yellow: new Firework('yellow'),
        white:  new Firework('white')
    };

    for (var i in this.fireworks) {
        if (this.fireworks.hasOwnProperty(i)) {
            this.fireworks[i].registerForEvent('fireworkComplete', this.onFireworkComplete, this);
            this.fireworks[i].registerForEvent('invalidPlay', lifetokens.loseLife, lifetokens);
        }
    }
}

exports.Fireworks.prototype = new EventSource();
exports.Fireworks.prototype.constructor = exports.Fireworks;
exports.Fireworks.prototype.events = ['fireworkComplete', 'allFireworksComplete'];


exports.Fireworks.prototype.isComplete = function () {
    return (this.fireworks.red.isComplete() &&
            this.fireworks.blue.isComplete() &&
            this.fireworks.green.isComplete() &&
            this.fireworks.yellow.isComplete() &&
            this.fireworks.white.isComplete())
};

exports.Fireworks.prototype.onFireworkComplete = function (colour) {
    if (this.fireworks.hasOwnProperty(colour)) {
        this.sendEvent('fireworkComplete', [colour]);
        if (this.isComplete()) {
            this.sendEvent('allFireworksComplete', []);
        }
    }
};

exports.Fireworks.prototype.play = function (card, callback) {
    if (typeof callback !== 'function') throw 'Error: missing callback';
    if (card === null || typeof card !== 'object') { callback('Error: Invalid argument'); return; }
    if (!card.hasOwnProperty('colour') || !this.fireworks.hasOwnProperty(card.colour) ||
        !card.value) {
        callback('Error: Invalid argument');
        return;
    }
    this.fireworks[card.colour].play(card, callback);
};
