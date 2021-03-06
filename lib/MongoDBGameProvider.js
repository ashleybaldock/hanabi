// GameProvider which persists changes to MongoDB
var mongodb = require('mongodb');
var MongoClient = require('mongodb').MongoClient;

exports.GameProvider = function (connection_string) {
    this.data = {};
    this.connection_string = connection_string;
    var self = this;
    MongoClient.connect(this.connection_string, function(err, db) {
        db.collection('listing', function (err, collection) {
            if (err) {
                console.err("Collection enumeration failed - initial listing load");
                return;
            }
            console.log("Loading listings from DB...");
            collection.find().each(function (err, listing) {
                if (err) { throw err; }
                self.data[listing.id] = listing;
                console.log('Loaded listing from DB: ' + JSON.stringify(listing));
            });
        });
    });
};

exports.GameProvider.prototype.findAll = function(callback) {
    if (typeof callback === 'function') { callback(this.data); }
};

exports.GameProvider.prototype.findActive = function (callback) {
};

exports.GameProvider.prototype.findById = function(id, callback) {
    var result = null;
    if (this.data.hasOwnProperty(id)) {
        result = this.data[id];
    }
    if (typeof callback === 'function') { callback(result); }
};

exports.GameProvider.prototype.save = function(listing, callback) {
    this.data[listing.id] = listing;
    MongoClient.connect(this.connection_string, function(err, db) {
        db.collection('listing', function (err, collection) {
            if (err) {
                console.err("Collection enumeration failed - save listing with id: " + listing.id + " error: " + err);
                return;
            }
            collection.update({id: listing.id}, listing, {w: -1, upsert: true});
        });
    });
    if (typeof callback === 'function') { callback(listing); }
};

exports.GameProvider.prototype.removeById = function(id, callback) {
    var removed = null;
    if (this.data.hasOwnProperty(id)) {
        removed = this.data[id];
        delete this.data[id];
    }
    MongoClient.connect(this.connection_string, function(err, db) {
        db.collection('listing', function (err, collection) {
            if (err) {
                console.err("Collection enumeration failed - remove listing with id: " + id + " error: " + err);
                return;
            }
            collection.remove({id: id}, false, function (err) {
                if (err) {
                    console.err("Remove listing with id: " + id + " failed, error: " + err);
                    return;
                }
            });
        });
    });
    if (typeof callback === 'function') { callback(removed); }
};
