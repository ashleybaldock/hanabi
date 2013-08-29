// GameListingProvider which does not persist changes
exports.GameListingProvider = function () {
};

exports.GameListingProvider.prototype.data = {};

exports.GameListingProvider.prototype.findAll = function(callback) {
    if (typeof callback === 'function') { callback(this.data); }
};

exports.GameListingProvider.prototype.findActive = function (callback) {
};

exports.GameListingProvider.prototype.findById = function(id, callback) {
    var result = null;
    if (this.data.hasOwnProperty(id)) {
        result = this.data[id];
    }
    if (typeof callback === 'function') { callback(result); }
};

exports.GameListingProvider.prototype.save = function(listing, callback) {
    this.data[listing.id] = listing;
    if (typeof callback === 'function') { callback(listing); }
};

exports.GameListingProvider.prototype.removeById = function(id, callback) {
    var removed = null;
    if (this.data.hasOwnProperty(id)) {
        removed = this.data[id];
        delete this.data[id];
    }
    if (typeof callback === 'function') { callback(removed); }
};
