
exports.newGame = function (data, callback) {
    if (!data || typeof data !== typeof {}) { callback("Invalid data"); return; }
    if (!data.name) { callback("Invalid data"); return; }
    if (!data.password) { callback("Invalid data"); return; }
    if (!data.playerCount) { callback("Invalid data"); return; }

    // Using GameListingProvider create and persist a new game listing

    // Send a notification indicating that this game has been created to
    // all clients subscribing to game list events

    callback();
};
