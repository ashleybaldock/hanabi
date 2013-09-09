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
exports.Firework.prototype.events = ['fireworkComplete'];

exports.Firework.prototype.getColour = function (callback) {
    if (typeof callback !== 'function') throw 'Error: missing callback';
    callback(this.colour);
};

exports.Firework.prototype.getValue = function (callback) {
    if (typeof callback !== 'function') throw 'Error: missing callback';
    callback(this.value);
};

exports.Firework.prototype.isComplete = function () {
    return this.value === 5;
};

exports.Firework.prototype.play = function (newValue, callback) {
    if (typeof callback !== 'function') throw 'Error: missing callback';
    if (typeof newValue !== 'number' || 
        newValue < 1 || newValue > this.max) {
        callback('Error: Invalid argument');
        return;
    }

    if (newValue === this.value + 1) {
        this.value = newValue;
        if (this.value === this.max) {
            this.sendEvent('fireworkComplete', [this.colour]);
        }
        callback();
    } else {
        callback('Error: Invalid play');
    }
};

