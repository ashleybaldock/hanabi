// GameProvider which does not persist changes
exports.GameProvider = function () {
    this.data = [];
    this.nextId = 0;
};

exports.GameProvider.prototype.findAll = function(callback) {
    if (typeof callback !== 'function') {
        throw 'callback is not a function!';
    }
    callback(this.data);
};

exports.GameProvider.prototype.findActive = function (callback) {
    if (typeof callback !== 'function') {
        throw 'callback is not a function!';
    }
    var results = this.data.filter(function (val) {
        return (val.state === 'waiting');
    });
    callback(results);
};

exports.GameProvider.prototype.findActiveByClientId = function (id, callback) {
    if (typeof callback !== 'function') throw 'callback is not a function!';
    callback(this.data.filter(function (val) {
        return (val.state === 'playing' && val.players().filter(function (v) {
            return v === val;
        }));
    }));
};

exports.GameProvider.prototype.findById = function (id, callback) {
    if (typeof callback !== 'function') throw 'callback is not a function!';
    callback(this.data.filter(function (val) {
        return (val.id === id);
    })[0]);
};

exports.GameProvider.prototype.save = function(listing, callback) {
    if (typeof callback !== 'function') {
        throw 'callback is not a function!';
    }
    listing.id = '' + this.nextId;
    this.data[listing.id] = listing;
    this.nextId += 1;
    callback(listing);
};

exports.GameProvider.prototype.removeById = function (id, callback) {
    if (typeof callback !== 'function') {
        throw 'callback is not a function!';
    }
    if (id < this.data.length && this.data[id] !== null) {
        var removed = this.data.splice(id, 1);
        callback(removed);
    } else {
        callback(null);
    }
};
