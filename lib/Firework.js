var EventSource = require('./EventSource.Interface.js').EventSource;

exports.Firework = function Firework (colour) {
    var wirings = this.createEventWiring();
    this.wiredEvents = function () { return wirings; };

    this.colour = colour;
    this.value = 0;
    this.max = 5;
}

exports.Firework.prototype = new EventSource();
exports.Firework.prototype.constructor = exports.Firework;
exports.Firework.prototype.events = ['fireworkComplete', 'invalidPlay'];
exports.Firework.prototype.objectName = 'Firework';

exports.Firework.prototype.getColour = function (callback) {
    if (typeof callback !== 'function') throw 'Error: missing callback';
    callback(this.colour);
};

exports.Firework.prototype.getValue = function () {
    return this.value;
};

exports.Firework.prototype.isComplete = function () {
    return this.value === 5;
};

exports.Firework.prototype.play = function (card, callback) {
    if (typeof callback !== 'function') throw 'Error: missing callback';
    if (card === null || typeof card !== 'object' ||
        !card.hasOwnProperty('value') || !card.hasOwnProperty('colour') ||
        card.value < 1 || card.value > this.max ||
        card.colour !== this.colour) {
        callback('Error: Invalid argument');
        return;
    }

    if (card.value === this.value + 1) {
        this.value = card.value;
        if (this.value === this.max) {
            this.sendEvent('fireworkComplete', [this.colour]);
        }
        callback();
    } else {
        this.sendEvent('invalidPlay', [card]);
        callback('Error: Invalid play');
    }
};
