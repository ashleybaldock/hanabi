// GameListingProvider which does not persist changes

GameListingProvider = function () {};
GameListingProvider.prototype.data = {};

GameListingProvider.prototype.findAll = function(callback) {
    if (typeof callback === 'function') { callback(this.data); }
};

GameListingProvider.prototype.findById = function(id, callback) {
    var result = null;
    if (this.data.hasOwnProperty(id)) {
        result = this.data[id];
    }
    if (typeof callback === 'function') { callback(result); }
};

GameListingProvider.prototype.save = function(listing, callback) {
    this.data[listing.id] = listing;
    if (typeof callback === 'function') { callback(listing); }
};

GameListingProvider.prototype.removeById = function(id, callback) {
    var removed = null;
    if (this.data.hasOwnProperty(id)) {
        removed = this.data[id];
        delete this.data[id];
    }
    if (typeof callback === 'function') { callback(removed); }
};

exports.GameListingProvider = GameListingProvider;
