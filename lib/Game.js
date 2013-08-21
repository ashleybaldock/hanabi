exports.Game = function Game () {
    this.password = "";
    this.name = "";
    this.players = [
    ];
    this.fireworks = null;
    this.lifetokens = null;
    this.cluetokens = null;
    this.drawpile = null;
    this.discardpile = null;

    this.state = "waiting_for_players";
}

exports.Game.prototype.addPlayer = function() {};

exports.Game.prototype.removePlayer = function() {};

exports.Game.prototype.
