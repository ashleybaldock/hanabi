exports.EventSource = function EventSource () {
};

exports.EventSource.prototype.registerForEvent = function (eventName, callback, context) {
    if (typeof eventName !== 'string' || !this.events.hasOwnProperty(eventName)) throw 'Error: event name invalid';
    if (typeof callback !== 'function') throw 'Error: callback not a function';
    if (typeof context !== 'object') throw 'Error: context not an object';
    this.events[eventName].push({callback: callback, context: context});
};

exports.EventSource.prototype.sendEvent = function (eventName, args) {
    if (typeof eventName !== 'string' || !this.events.hasOwnProperty(eventName)) throw 'Error: event name invalid';
    for (var i = 0; i < this.events[eventName].length; i++) {
        this.events[eventName][i].callback.apply(this.events[eventName][i].context, args);
    }
};
