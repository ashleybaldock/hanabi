var EventSource = require('./EventSource.Interface.js').EventSource;

exports.Fireworks = function Fireworks (Firework) {
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
        }
    }
}

exports.Fireworks.prototype = new EventSource();
exports.Fireworks.prototype.constructor = exports.Fireworks;

exports.Fireworks.prototype.events = {
    'fireworkComplete': [],
    'allFireworksComplete': []
};

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
    }
    if (this.isComplete()) {
        this.sendEvent('allFireworksComplete', []);
    }
};

exports.Fireworks.prototype.play = function (card) {
    if (typeof callback !== 'function') throw 'Error: missing callback';
    // Check card validity
    // Call play on appropriate firework and cope with result
};
