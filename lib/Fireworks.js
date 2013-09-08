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
    'fireworksComplete': []
};

exports.Fireworks.prototype.onFireworkComplete = function (card) {
};

exports.Fireworks.prototype.play = function (card) {
    // Check card validity
    // Call play on appropriate firework and cope with result
};
