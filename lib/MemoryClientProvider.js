// ClientProvider which does not persist changes
exports.ClientProvider = function () {
    this.data = [];
    this.nextId = 0;
};

exports.ClientProvider.prototype.findAll = function (callback) {
    if (typeof callback !== 'function') throw 'callback is not a function!';
    callback(this.data);
};

exports.ClientProvider.prototype.findById = function (id, callback) {
    if (typeof callback !== 'function') throw 'callback is not a function!';
    callback(this.data[id]);
};

exports.ClientProvider.prototype.save = function (client, callback) {
    if (typeof callback !== 'function') throw 'callback is not a function!';
    client.id = '' + this.nextId;
    this.data[client.id] = client;
    this.nextId += 1;
    callback(client);
};

exports.ClientProvider.prototype.removeById = function (id, callback) {
    if (typeof callback !== 'function') throw 'callback is not a function!';
    if (id < this.data.length && this.data[id] !== null) {
        var removed = this.data.splice(id, 1);
        callback(removed);
    } else {
        callback(null);
    }
};
