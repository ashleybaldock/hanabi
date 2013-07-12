
exports.Firework = function Firework (colour) {
    this.colour = colour;
    this.value = 0;
    this.max = 5;
    this.fireworkCompleteObservers = [];
    this.invalidPlayObservers = [];
}

exports.Firework.prototype.getColour = function() {
    return this.colour;
};

exports.Firework.prototype.getValue = function() {
    return this.value;
};

exports.Firework.prototype.play = function(value) {
    if (typeof value !== 'number') {
        throw 'InvalidArgument';
    }

    if (value < 1 || value > this.max) {
        throw "InvalidArgument";
    }

    if (value === this.value + 1) {
        this.value = value;
    } else {
        this.triggerInvalidPlayObservers();
        throw 'InvalidPlay';
    }

    if (this.value === this.max) {
        this.triggerFireworkCompleteObservers();
    }
};

exports.Firework.prototype.triggerFireworkCompleteObservers = function() {
    for (var i = 0; i < this.fireworkCompleteObservers.length; i++) {
        this.fireworkCompleteObservers[i].callback.apply(this.fireworkCompleteObservers[i].context, [this.colour]);
    }
};

exports.Firework.prototype.addFireworkCompleteObserver = function(callback, context) {
    if (typeof callback !== 'function') {
        throw 'InvalidArgument';
    }
    if (typeof context !== 'object') {
        throw 'InvalidArgument';
    }

    this.fireworkCompleteObservers.push({"callback": callback, "context": context});
};

exports.Firework.prototype.triggerInvalidPlayObservers = function() {
    for (var i = 0; i < this.invalidPlayObservers.length; i++) {
        this.invalidPlayObservers[i].callback.apply(this.invalidPlayObservers[i].context, [this.colour]);
    }
};

exports.Firework.prototype.addInvalidPlayObserver = function(callback, context) {
    if (typeof callback !== 'function') {
        throw 'InvalidArgument';
    }
    if (typeof context !== 'object') {
        throw 'InvalidArgument';
    }

    this.invalidPlayObservers.push({"callback": callback, "context": context});
};
