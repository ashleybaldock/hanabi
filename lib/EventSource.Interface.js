exports.EventSource = function EventSource () {
};

exports.EventSource.prototype.createEventWiring = function () {
    var wirings = {};
    for (var i = 0; i < this.events.length; i++) {
        wirings[this.events[i]] = [];
    }
    return wirings;
};

exports.EventSource.prototype.registerForEvent = function (eventName, callback, context) {
    if (typeof eventName !== 'string' || this.events.indexOf(eventName) === -1) throw 'Error: event name invalid';
    if (typeof callback !== 'function') throw 'Error: callback not a function';
    if (typeof context !== 'object') throw 'Error: context not an object';
    (this.wiredEvents())[eventName].push({callback: callback, context: context});
};

exports.EventSource.prototype.sendEvent = function (eventName, args) {
    if (typeof eventName !== 'string' || this.events.indexOf(eventName) === -1) throw 'Error: event name invalid';
    for (var i = 0; i < (this.wiredEvents())[eventName].length; i++) {
        (this.wiredEvents())[eventName][i].callback.apply(
            (this.wiredEvents())[eventName][i].context, args);
    }
};
