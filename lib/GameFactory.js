var Game = require('./Game.js').Game;
var Discard = require('./Discard.js').Discard;
var ClueTokens = require('./ClueTokens.js').ClueTokens;
var TurnCounter = require('./TurnCounter.js').TurnCounter;

exports.GameFactory = function (name, playerCount) {
    return new Game(name, playerCount, Discard, ClueTokens, TurnCounter);
};
