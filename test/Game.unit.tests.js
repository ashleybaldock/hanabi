var expect = require('expect.js');
var sinon = require('sinon');

var Game = require('../lib/Game.js').Game;
var PlayerInterface = require('../lib/PlayerInterface.js').PlayerInterface;
var LifeTokens = require('../lib/LifeTokens.js').LifeTokens;
var Fireworks = require('../lib/Fireworks.js').Fireworks;
var Firework = require('../lib/Firework.js').Firework;
var ClueTokens = require('../lib/ClueTokens.js').ClueTokens;
var Discard = require('../lib/Discard.js').Discard;
var Deck = require('../lib/Deck.js').Deck;
var Card = require('../lib/Card.js').Card;
var TurnCounter = require('../lib/TurnCounter.js').TurnCounter;

suite('Game', function () {
    var sut, sut2player, sut3player, sut4player, sut5player,
        turncounter, turncounterConstructor, enterEndgameSpy, takeTurnSpy,
        discard, discardConstructor, discardCardSpy,
        cluetokens, cluetokensConstructor, restoreClueSpy;
    var name = 'testGame', playerCount = 2;

    setup(function () {
        console.log('Game setup');
        discard = new Discard();
        discardCardSpy = sinon.spy(discard, 'discardCard');
        discardConstructor = function () { return discard; };

        cluetokens = new ClueTokens();
        restoreClueSpy = sinon.spy(cluetokens, 'restoreClue');
        cluetokensConstructor = function () { return cluetokens; };

        turncounter = new TurnCounter();
        enterEndgameSpy = sinon.spy(turncounter, 'enterEndgame');
        takeTurnSpy = sinon.spy(turncounter, 'takeTurn');
        turncounterConstructor = sinon.stub().returns(turncounter);

        sut = new Game(name, playerCount, discardConstructor, cluetokensConstructor, turncounterConstructor);
        sut2player = new Game(name, 2, discardConstructor, cluetokensConstructor, turncounterConstructor);
        sut3player = new Game(name, 3, discardConstructor, cluetokensConstructor, turncounterConstructor);
        sut4player = new Game(name, 4, discardConstructor, cluetokensConstructor, turncounterConstructor);
        sut5player = new Game(name, 5, discardConstructor, cluetokensConstructor, turncounterConstructor);
    });

    suite('contract', function () {
        test('should define addPlayer() method', function () {
            expect(sut.addPlayer).to.be.a('function');
        });

        test('should define removePlayer() method', function () {
            expect(sut.removePlayer).to.be.a('function');
        });

        test('should define start() method', function () {
            expect(sut.start).to.be.a('function');
        });
        test('should define playersReady() method', function () {
            expect(sut.playersReady).to.be.a('function');
        });

        test('should define giveClueHandler() method', function () {
            expect(sut.giveClueHandler).to.be.a('function');
        });

        test('should define encodeIndex method', function () {
            expect(sut.encodeIndex).to.be.a('function');
        });
        test('should define decodeIndex method', function () {
            expect(sut.decodeIndex).to.be.a('function');
        });

        test('should define sendCardDrawnToAllPlayers method', function () {
            expect(sut.sendCardDrawnToAllPlayers).to.be.a('function');
        });
        test('should define sendClueReceivedToAllPlayers method', function () {
            expect(sut.sendClueReceivedToAllPlayers).to.be.a('function');
        });
        test('should define sendCardPlayedToAllPlayers method', function () {
            expect(sut.sendCardPlayedToAllPlayers).to.be.a('function');
        });
        test('should define sendCardDiscardedToAllPlayers method', function () {
            expect(sut.sendCardDiscardedToAllPlayers).to.be.a('function');
        });

        test('should define onAllFireworksComplete event handler', function () {
            expect(sut.onAllFireworksComplete).to.be.a('function');
        });
        test('should define onFireworkComplete event handler', function () {
            expect(sut.onFireworkComplete).to.be.a('function');
        });
        test('should define onLifeLost event handler', function () {
            expect(sut.onLifeLost).to.be.a('function');
        });
        test('should define onAllLivesLost event handler', function () {
            expect(sut.onAllLivesLost).to.be.a('function');
        });
        test('should define onEndgameOver event handler', function () {
            expect(sut.onEndgameOver).to.be.a('function');
        });
        test('should define onNextTurn event handler', function () {
            expect(sut.onNextTurn).to.be.a('function');
        });

        test('should define events', function () {
            expect(sut.events).to.contain('playerJoined');
            expect(sut.events).to.contain('playerLeft');
            expect(sut.events).to.contain('gameReady');
        });
    });

    suite('constructor', function () {
        test('should set name and playerCount from params', function () {
            expect(sut.name).to.be(name);
            expect(sut.playerCount).to.be(playerCount);
            expect(sut.current).to.be(0);
        });

        test('should init players with correct number of slots', function () {
            expect(sut2player.players).to.have.length(2);
            expect(sut3player.players).to.have.length(3);
            expect(sut4player.players).to.have.length(4);
            expect(sut5player.players).to.have.length(5);
        });

        test('should init hands with correct number of slots', function () {
            expect(sut2player.hands).to.have.length(2);
            expect(sut3player.hands).to.have.length(3);
            expect(sut4player.hands).to.have.length(4);
            expect(sut5player.hands).to.have.length(5);
        });

        test('should init hands with correct number of slots', function () {
            expect(sut2player.hands[0].size).to.be(5);
            expect(sut2player.hands[1].size).to.be(5);
            expect(sut3player.hands[0].size).to.be(5);
            expect(sut3player.hands[1].size).to.be(5);
            expect(sut3player.hands[2].size).to.be(5);
            expect(sut4player.hands[0].size).to.be(4);
            expect(sut4player.hands[1].size).to.be(4);
            expect(sut4player.hands[2].size).to.be(4);
            expect(sut4player.hands[3].size).to.be(4);
            expect(sut5player.hands[0].size).to.be(4);
            expect(sut5player.hands[1].size).to.be(4);
            expect(sut5player.hands[2].size).to.be(4);
            expect(sut5player.hands[3].size).to.be(4);
            expect(sut5player.hands[4].size).to.be(4);
        });

        test('should wire discardCard event of hand up to Discard object', function () {
            var testCard = new Card('red', 1);
            for (var i = 0; i < sut2player.hands.length; i++) {
                sut2player.hands[i].sendEvent('discardCard', [testCard]);
                expect(discardCardSpy.calledWith(testCard)).to.be(true);
                discardCardSpy.reset();
            }
        });

        test('should wire restoreClue event of hand up to ClueTokens object', function () {
            for (var i = 0; i < sut2player.hands.length; i++) {
                sut2player.hands[i].sendEvent('restoreClue', []);
                expect(restoreClueSpy.calledWith()).to.be(true);
                restoreClueSpy.reset();
            }
        });

        test('should wire Deck.deckExhausted event to TurnCounter.enterEndgame', function () {
            sut2player.deck.sendEvent('deckExhausted', []);
            expect(enterEndgameSpy.calledWith()).to.be(true);
            enterEndgameSpy.reset();
        });

        test('should wire TurnCounter.endgameOver event to onEndgameOver', function () {
            expect(sut.turncounter.wiredEvents()['endgameOver'][0].callback).to.be(sut.onEndgameOver);
            expect(sut.turncounter.wiredEvents()['endgameOver'][0].context).to.be(sut);
        });

        test('should wire Fireworks.allFireworksComplete event to onAllFireworksComplete', function () {
            expect(sut.fireworks.wiredEvents()['allFireworksComplete'][0].callback).to.be(sut.onAllFireworksComplete);
            expect(sut.fireworks.wiredEvents()['allFireworksComplete'][0].context).to.be(sut);
        });

        test('should wire LifeTokens.allLivesLost event to onAllLivesLost', function () {
            expect(sut.lifetokens.wiredEvents()['allLivesLost'][0].callback).to.be(sut.onAllLivesLost);
            expect(sut.lifetokens.wiredEvents()['allLivesLost'][0].context).to.be(sut);
        });
    });

    suite('onNextTurn()', function () {
        test('should call moveObserver() on next index player', function () {
            var player1 = new PlayerInterface();
            var player2 = new PlayerInterface();
            sinon.stub(player1, 'getPlayerId').returns(0);
            sinon.stub(player2, 'getPlayerId').returns(1);
            sut2player.addPlayer(player1, function (err) {});
            sut2player.addPlayer(player2, function (err) {});
            var spy1 = sinon.spy(sut2player.players[0], 'moveObserver');
            var spy2 = sinon.spy(sut2player.players[1], 'moveObserver');
            sut2player.current = 0;
            sut2player.onNextTurn();
            expect(spy2.calledWith()).to.be(true);
        });

        test('should call moveObserver() on next index player (array wrap)', function () {
            var player1 = new PlayerInterface();
            var player2 = new PlayerInterface();
            sinon.stub(player1, 'getPlayerId').returns(0);
            sinon.stub(player2, 'getPlayerId').returns(1);
            sut2player.addPlayer(player1, function (err) {});
            sut2player.addPlayer(player2, function (err) {});
            var spy1 = sinon.spy(sut2player.players[0], 'moveObserver');
            var spy2 = sinon.spy(sut2player.players[1], 'moveObserver');
            sut2player.current = 1;
            sut2player.onNextTurn();
            expect(spy1.calledWith()).to.be(true);
        });
    });

    suite('giveClueHandler()', function () {
        test('should call decodeIndex() with first two arguments', function () {
            var spy = sinon.spy(sut, 'decodeIndex');
            sut.giveClueHandler(0, 1, 'red', function () {});
            expect(spy.calledWith(0, 1)).to.be(true);
        });

        test('should call receiveClue() on hand index returned by decodeIndex()', function () {
            var stub = sinon.stub(sut, 'decodeIndex').returns(0);
            var spy = sinon.spy(sut.hands[0], 'receiveClue');
            var func = function () {};
            sut.giveClueHandler(0, 1, 'red', func);
            expect(spy.calledWith(0, 0, 'red', func)).to.be(true);
        });
    });

    suite('addPlayer()', function () {
        test('should throw error if callback not a function', function () {
            expect(function () {
                sut.addPlayer();
            }).to.throwException('Error: missing callback');
        });

        test('should replace existing player if ID matches and send playerJoined event', function (done) {
            var callback = sinon.spy();
            var context = new Object();
            sut.registerForEvent('playerJoined', callback, context);
            var callback2 = sinon.spy();
            sut.registerForEvent('gameReady', callback2, context);
            var player1 = new PlayerInterface();
            var player2 = new PlayerInterface();
            sinon.stub(player1, 'getPlayerId').returns(0);
            sinon.stub(player2, 'getPlayerId').returns(0);
            sut.addPlayer(player1, function (err) {
                expect(err).to.be(undefined);
                expect(sut.players[0]).to.be(player1);
                expect(sut.players[1]).to.be(null);
                expect(callback.calledOn(context)).to.be(true);
                expect(callback.calledWithExactly(player1)).to.be(true);
                sut.addPlayer(player2, function (err) {
                    expect(err).to.be(undefined);
                    expect(sut.players[0]).to.be(player2);
                    expect(sut.players[1]).to.be(null);
                    expect(callback.calledOn(context)).to.be(true);
                    expect(callback.calledWithExactly(player2)).to.be(true);
                    expect(callback2.callCount).to.be(0);
                    done();
                });
            });
        });

        test('should replace existing player if ID matches and send gameReady event if all slots filled', function (done) {
            var callback = sinon.spy();
            var context = new Object();
            sut.registerForEvent('gameReady', callback, context);
            var player1 = new PlayerInterface();
            var player2 = new PlayerInterface();
            var player3 = new PlayerInterface();
            sinon.stub(player1, 'getPlayerId').returns(0);
            sinon.stub(player2, 'getPlayerId').returns(0);
            sinon.stub(player3, 'getPlayerId').returns(1);
            sut.addPlayer(player1, function (err) {
                expect(err).to.be(undefined);
                expect(sut.players[0]).to.be(player1);
                expect(sut.players[1]).to.be(null);
                sut.addPlayer(player3, function (err) {
                    expect(err).to.be(undefined);
                    expect(sut.players[0]).to.be(player1);
                    expect(sut.players[1]).to.be(player3);
                    expect(callback.calledOn(context)).to.be(true);
                    expect(callback.calledWithExactly(sut)).to.be(true);
                    sut.addPlayer(player2, function (err) {
                        expect(err).to.be(undefined);
                        expect(sut.players[0]).to.be(player2);
                        expect(sut.players[1]).to.be(player3);
                        expect(callback.callCount).to.be(2);
                        done();
                    });
                });
            });
        });

        test('should add player to first free slot and send playerJoined event', function (done) {
            var player = new PlayerInterface();
            var stub = sinon.stub(player, 'getPlayerId').returns(0);
            var callback = sinon.spy();
            var context = new Object();
            sut.registerForEvent('playerJoined', callback, context);
            sut.addPlayer(player, function (err) {
                expect(err).to.be(undefined);
                expect(sut.players[0]).to.be(player);
                expect(sut.players[1]).to.be(null);
                expect(callback.calledOn(context)).to.be(true);
                expect(callback.calledWithExactly(player)).to.be(true);
                done();
            });
        });

        test('should execute callback with error if no free slot', function (done) {
            var player1 = new PlayerInterface();
            sinon.stub(player1, 'getPlayerId').returns(0);
            var player2 = new PlayerInterface();
            sinon.stub(player2, 'getPlayerId').returns(1);
            var player3 = new PlayerInterface();
            sinon.stub(player3, 'getPlayerId').returns(2);
            sut.addPlayer(player1, function (err) {
                sut.addPlayer(player2, function (err) {
                    sut.addPlayer(player3, function (err) {
                        expect(err).to.be('Error: No free player slots');
                        done();
                    });
                });
            });
        });

        test('should set state to ready and emit ready event if last player added', function (done) {
            var callback = sinon.spy();
            var context = new Object();
            sut.registerForEvent('gameReady', callback, context);
            var player1 = new PlayerInterface();
            sinon.stub(player1, 'getPlayerId').returns(0);
            var player2 = new PlayerInterface();
            sinon.stub(player2, 'getPlayerId').returns(1);
            sut.addPlayer(player1, function (err) {
                sut.addPlayer(player2, function (err) {
                    expect(callback.calledOn(context)).to.be(true);
                    expect(callback.calledWithExactly(sut)).to.be(true);
                    expect(sut.state).to.be('ready');
                    done();
                });
            });
        });

        test('should wire player.playCard event to hand.playIndex', function (done) {
            var player = new PlayerInterface();
            var stub = sinon.stub(player, 'getPlayerId').returns(0);
            var regSpy = sinon.spy(player, 'registerForEvent');
            sut.addPlayer(player, function (err) {
                expect(regSpy.calledWith('playCard', sut.hands[0].playIndex, sut.hands[0])).to.be(true);
                done();
            });
        });

        test('should wire sut.gameReady event to player.readyObserver', function (done) {
            var player = new PlayerInterface();
            var stub = sinon.stub(player, 'getPlayerId').returns(0);
            var regSpy = sinon.spy(sut, 'registerForEvent');
            sut.addPlayer(player, function (err) {
                expect(regSpy.calledWith('gameReady', player.readyObserver, player)).to.be(true);
                done();
            });
        });

        test('should wire player.discardCard event to hand.discardIndex', function (done) {
            var player = new PlayerInterface();
            var stub = sinon.stub(player, 'getPlayerId').returns(0);
            var regSpy = sinon.spy(player, 'registerForEvent');
            sut.addPlayer(player, function (err) {
                expect(regSpy.calledWith('discardCard', sut.hands[0].discardIndex, sut.hands[0])).to.be(true);
                done();
            });
        });

        test('should wire player.giveClue event to hand.giveClue', function (done) {
            var player = new PlayerInterface();
            var stub = sinon.stub(player, 'getPlayerId').returns(0);
            var regSpy = sinon.spy(player, 'registerForEvent');
            sut.addPlayer(player, function (err) {
                expect(regSpy.calledWith('giveClue', sut.hands[0].giveClue, sut.hands[0])).to.be(true);
                done();
            });
        });

        test('should wire cluetokens.clueUsed event to player.clueUsedObserver', function (done) {
            var player = new PlayerInterface();
            var stub = sinon.stub(player, 'getPlayerId').returns(0);
            var regSpy = sinon.spy(sut.cluetokens, 'registerForEvent');
            sut.addPlayer(player, function (err) {
                expect(regSpy.calledWith('clueUsed', player.clueUsedObserver, player)).to.be(true);
                done();
            });
        });
        test('should wire cluetokens.clueRestored event to player.clueRestoredObserver', function (done) {
            var player = new PlayerInterface();
            var stub = sinon.stub(player, 'getPlayerId').returns(0);
            var regSpy = sinon.spy(sut.cluetokens, 'registerForEvent');
            sut.addPlayer(player, function (err) {
                expect(regSpy.calledWith('clueRestored', player.clueRestoredObserver, player)).to.be(true);
                done();
            });
        });
        test('should wire lifetokens.lifeLost event to player.lifeLostObserver', function (done) {
            var player = new PlayerInterface();
            var stub = sinon.stub(player, 'getPlayerId').returns(0);
            var regSpy = sinon.spy(sut.lifetokens, 'registerForEvent');
            sut.addPlayer(player, function (err) {
                expect(regSpy.calledWith('lifeLost', player.lifeLostObserver, player)).to.be(true);
                done();
            });
        });
        test('should wire deck.deckExhausted event to player.deckExhaustedObserver', function (done) {
            var player = new PlayerInterface();
            var stub = sinon.stub(player, 'getPlayerId').returns(0);
            var regSpy = sinon.spy(sut.deck, 'registerForEvent');
            sut.addPlayer(player, function (err) {
                expect(regSpy.calledWith('deckExhausted', player.deckExhaustedObserver, player)).to.be(true);
                done();
            });
        });
        test('should wire turncounter.endgameBegins event to player.endgameBeginsObserver', function (done) {
            var player = new PlayerInterface();
            var stub = sinon.stub(player, 'getPlayerId').returns(0);
            var regSpy = sinon.spy(sut.turncounter, 'registerForEvent');
            sut.addPlayer(player, function (err) {
                expect(regSpy.calledWith('endgameBegins', player.endgameBeginsObserver, player)).to.be(true);
                done();
            });
        });
    });

    suite('playersReady()', function () {
        test('should return true if all player slots filled', function (done) {
            var player1 = new PlayerInterface();
            sinon.stub(player1, 'getPlayerId').returns(0);
            var player2 = new PlayerInterface();
            sinon.stub(player2, 'getPlayerId').returns(1);
            sut.addPlayer(player1, function () {
                sut.addPlayer(player2, function () {
                    expect(sut.playersReady()).to.be(true);
                    done();
                });
            });
        });

        test('should return false if any player slot not filled', function (done) {
            var player1 = new PlayerInterface();
            sinon.stub(player1, 'getPlayerId').returns(0);
            sut.addPlayer(player1, function () {
                expect(sut.playersReady()).to.be(false);
                done();
            });
        });
    });

    suite('decodeIndex()', function () {
        test('should return correct result for various inputs', function () {
            expect(sut2player.decodeIndex(0, 1)).to.be(1);
            expect(sut2player.decodeIndex(0, 0)).to.be(0);
            expect(sut2player.decodeIndex(1, 1)).to.be(0);
            expect(function () { sut2player.decodeIndex(2, 0); }).to.throwError('Error: Invalid fromIndex');
            expect(function () { sut2player.decodeIndex(0, 2); }).to.throwError('Error: Invalid clientToIndex');
            expect(function () { sut2player.decodeIndex(-1, 0); }).to.throwError('Error: Invalid fromIndex');
            expect(function () { sut2player.decodeIndex(0, -1); }).to.throwError('Error: Invalid clientToIndex');
            expect(sut5player.decodeIndex(1, 4)).to.be(0);
            expect(sut5player.decodeIndex(4, 0)).to.be(4);
            expect(sut5player.decodeIndex(4, 1)).to.be(0);
            expect(sut5player.decodeIndex(4, 4)).to.be(3);
        });
    });

    suite('encodeIndex()', function () {
        test('should return correct result for various inputs', function () {
            expect(sut2player.encodeIndex(0, 0)).to.be(0);
            expect(sut2player.encodeIndex(0, 1)).to.be(1);
            expect(sut2player.encodeIndex(1, 0)).to.be(1);
            expect(function () { sut2player.encodeIndex(2, 0); }).to.throwError('Error: Invalid fromIndex');
            expect(function () { sut2player.encodeIndex(0, 2); }).to.throwError('Error: Invalid toIndex');
            expect(function () { sut2player.encodeIndex(-1, 0); }).to.throwError('Error: Invalid fromIndex');
            expect(function () { sut2player.encodeIndex(0, -1); }).to.throwError('Error: Invalid toIndex');

            expect(sut5player.encodeIndex(1, 0)).to.be(4);
            expect(sut5player.encodeIndex(1, 1)).to.be(0);
            expect(sut5player.encodeIndex(1, 2)).to.be(1);
            expect(sut5player.encodeIndex(1, 3)).to.be(2);
            expect(sut5player.encodeIndex(1, 4)).to.be(3);
            expect(sut5player.encodeIndex(4, 0)).to.be(1);
            expect(sut5player.encodeIndex(4, 1)).to.be(2);
            expect(sut5player.encodeIndex(4, 2)).to.be(3);
            expect(sut5player.encodeIndex(4, 3)).to.be(4);
            expect(sut5player.encodeIndex(4, 4)).to.be(0);
        });
    });

    suite('start()', function () {
        test('should throw error if callback not a function', function () {
            expect(function () {
                sut.start();
            }).to.throwException('Error: missing callback');
        });

        test('should execute callback with error if game is not in valid state to start', function () {
            sut.state = 'waiting';
            sut.start(function (err) {
                expect(err).to.be('Error: invalid state for game start');
            });
            sut.state = 'playing';
            sut.start(function (err) {
                expect(err).to.be('Error: invalid state for game start');
            });
            sut.state = 'abandoned';
            sut.start(function (err) {
                expect(err).to.be('Error: invalid state for game start');
            });
            sut.state = 'complete';
            sut.start(function (err) {
                expect(err).to.be('Error: invalid state for game start');
            });
        });

        test('should set state to playing', function (done) {
            var player1 = new PlayerInterface();
            sinon.stub(player1, 'getPlayerId').returns(0);
            var player2 = new PlayerInterface();
            sinon.stub(player2, 'getPlayerId').returns(1);
            sut.addPlayer(player1, function () {
                sut.addPlayer(player2, function () {
                    sut.start(function (err) {
                        expect(sut.state).to.be('playing');
                        done();
                    });
                });
            });
        });

        test('should call drawCard on all hands until they are full', function (done) {
            var player1 = new PlayerInterface();
            sinon.stub(player1, 'getPlayerId').returns(0);
            var player2 = new PlayerInterface();
            sinon.stub(player2, 'getPlayerId').returns(1);
            var spyHand1 = sinon.spy(sut.hands[0], 'drawCard');
            var spyHand2 = sinon.spy(sut.hands[1], 'drawCard');
            sut.addPlayer(player1, function () {
                sut.addPlayer(player2, function () {
                    sut.start(function (err) {
                        expect(spyHand1.callCount).to.be(6);
                        expect(spyHand2.callCount).to.be(6);
                        expect(sut.hands[0].cards).to.have.length(5);
                        expect(sut.hands[1].cards).to.have.length(5);
                        spyHand1.restore();
                        spyHand2.restore();
                        done();
                    });
                });
            });
        });

        test.skip('should call drawCard on all hands until they are full (4 player)', function (done) {
            var player1 = new PlayerInterface();
            sinon.stub(player1, 'getPlayerId').returns(0);
            var player2 = new PlayerInterface();
            sinon.stub(player2, 'getPlayerId').returns(1);
            var player3 = new PlayerInterface();
            sinon.stub(player3, 'getPlayerId').returns(2);
            var player4 = new PlayerInterface();
            sinon.stub(player4, 'getPlayerId').returns(3);
            var spyDrawObserver1 = sinon.spy(player1, 'cardDrawnObserver');
            var spyDrawObserver2 = sinon.spy(player2, 'cardDrawnObserver');
            var spyDrawObserver3 = sinon.spy(player3, 'cardDrawnObserver');
            var spyDrawObserver4 = sinon.spy(player4, 'cardDrawnObserver');
            var spyHand1 = sinon.spy(sut4player.hands[0], 'drawCard');
            var spyHand2 = sinon.spy(sut4player.hands[1], 'drawCard');
            var spyHand3 = sinon.spy(sut4player.hands[2], 'drawCard');
            var spyHand4 = sinon.spy(sut4player.hands[3], 'drawCard');
            sut4player.addPlayer(player1, function () {
                sut4player.addPlayer(player2, function () {
                    sut4player.addPlayer(player3, function () {
                        sut4player.addPlayer(player4, function () {
                            sut4player.start(function (err) {
                                expect(spyHand1.callCount).to.be(5);
                                expect(spyHand2.callCount).to.be(5);
                                expect(spyHand3.callCount).to.be(5);
                                expect(spyHand4.callCount).to.be(5);
                                expect(spyDrawObserver1.callCount).to.be(4);
                                expect(spyDrawObserver2.callCount).to.be(4);
                                expect(spyDrawObserver3.callCount).to.be(4);
                                expect(spyDrawObserver4.callCount).to.be(4);
                                expect(sut4player.hands[0].cards).to.have.length(4);
                                expect(sut4player.hands[1].cards).to.have.length(4);
                                expect(sut4player.hands[2].cards).to.have.length(4);
                                expect(sut4player.hands[3].cards).to.have.length(4);
                                spyDrawObserver1.restore();
                                spyDrawObserver2.restore();
                                spyDrawObserver3.restore();
                                spyDrawObserver4.restore();
                                spyHand1.restore();
                                spyHand2.restore();
                                spyHand3.restore();
                                spyHand4.restore();
                                done();
                            });
                        });
                    });
                });
            });
        });

        test('should send starting player a request for a move', function (done) {
            var player1 = new PlayerInterface();
            sinon.stub(player1, 'getPlayerId').returns(0);
            var player2 = new PlayerInterface();
            sinon.stub(player2, 'getPlayerId').returns(1);
            var spyPlayer1 = sinon.spy(player1, 'moveObserver');
            var spyPlayer2 = sinon.spy(player2, 'moveObserver');
            sut.addPlayer(player1, function () {
                sut.addPlayer(player2, function () {
                    sut.start(function (err) {
                        expect(spyPlayer1.callCount).to.be(1);
                        expect(spyPlayer2.callCount).to.be(0);
                        done();
                    });
                });
            });
        });
    });

    suite('sendCardDrawnToAllPlayers()', function () {
        test('should call cardDrawnObserver on all players masking Card from player that drew the card', function () {
            var playerIndex = 0, cardIndex = 3,
                card = new Card('red', 1), nullCard = new Card(null, null);
            var player1 = new PlayerInterface();
            sinon.stub(player1, 'getPlayerId').returns(0);
            var spy1 = sinon.spy(player1, 'cardDrawnObserver');
            var player2 = new PlayerInterface();
            sinon.stub(player2, 'getPlayerId').returns(1);
            var spy2 = sinon.spy(player2, 'cardDrawnObserver');

            sut2player.addPlayer(player1, function (err) {});
            sut2player.addPlayer(player2, function (err) {});

            sut2player.sendCardDrawnToAllPlayers(playerIndex, cardIndex, card);

            expect(spy1.calledWith({playerIndex: 0, cardIndex: cardIndex, card: nullCard})).to.be(true);
            expect(spy2.calledWith({playerIndex: 1, cardIndex: cardIndex, card: card})).to.be(true);
        });
    });

    suite('sendClueReceivedToAllPlayers()()', function () {
        test('should call clueObserver on all players', function () {
            var fromPlayerIndex = 0, toPlayerIndex = 1,
                clueMask = [
                {colour: 'red', value: null},
                {colour: null, value: null},
                {colour: null, value: null},
                {colour: null, value: null}];

            var player1 = new PlayerInterface();
            sinon.stub(player1, 'getPlayerId').returns(0);
            var spy1 = sinon.spy(player1, 'clueObserver');
            var player2 = new PlayerInterface();
            sinon.stub(player2, 'getPlayerId').returns(1);
            var spy2 = sinon.spy(player2, 'clueObserver');

            sut2player.addPlayer(player1, function (err) {});
            sut2player.addPlayer(player2, function (err) {});

            sut2player.sendClueReceivedToAllPlayers(toPlayerIndex, fromPlayerIndex, clueMask);

            expect(spy1.calledWith({fromPlayerIndex: 0, toPlayerIndex: 1, clueMask: clueMask})).to.be(true);
            expect(spy2.calledWith({fromPlayerIndex: 1, toPlayerIndex: 0, clueMask: clueMask})).to.be(true);
        });
    });

    suite('sendCardPlayedToAllPlayers()()', function () {
        test('should call cardPlayedObserver on all players', function () {
            var playerIndex = 0, cardIndex = 3, 
                card = new Card('red', 1);
            var player1 = new PlayerInterface();
            sinon.stub(player1, 'getPlayerId').returns(0);
            var spy1 = sinon.spy(player1, 'playObserver');
            var player2 = new PlayerInterface();
            sinon.stub(player2, 'getPlayerId').returns(1);
            var spy2 = sinon.spy(player2, 'playObserver');

            sut2player.addPlayer(player1, function (err) {});
            sut2player.addPlayer(player2, function (err) {});

            sut2player.sendCardPlayedToAllPlayers(playerIndex, cardIndex, card);

            expect(spy1.calledWith({playerIndex: 0, cardIndex: cardIndex, card: card})).to.be(true);
            expect(spy2.calledWith({playerIndex: 1, cardIndex: cardIndex, card: card})).to.be(true);
        });
    });

    suite('sendCardDiscardedToAllPlayers()()', function () {
        var playerIndex, cardIndex, card,
            player1, spy1,
            player2, spy2,
            player3, spy3,
            player4, spy4;

        setup(function () {
            playerIndex = 0, cardIndex = 3, card = new Card('red', 1);
            player1 = new PlayerInterface();
            player2 = new PlayerInterface();
            player3 = new PlayerInterface();
            player4 = new PlayerInterface();
            sinon.stub(player1, 'getPlayerId').returns(0);
            sinon.stub(player2, 'getPlayerId').returns(1);
            sinon.stub(player3, 'getPlayerId').returns(2);
            sinon.stub(player4, 'getPlayerId').returns(3);
            spy1 = sinon.spy(player1, 'discardObserver');
            spy2 = sinon.spy(player2, 'discardObserver');
            spy3 = sinon.spy(player3, 'discardObserver');
            spy4 = sinon.spy(player4, 'discardObserver');
        });

        test('2 player should call discardObserver on all players', function () {
            playerIndex = 0, cardIndex = 3, card = new Card('red', 1);

            sut2player.addPlayer(player1, function (err) {});
            sut2player.addPlayer(player2, function (err) {});

            sut2player.sendCardDiscardedToAllPlayers(playerIndex, cardIndex, card);

            expect(spy1.calledWith({playerIndex: 0, cardIndex: cardIndex, card: card})).to.be(true);
            expect(spy2.calledWith({playerIndex: 1, cardIndex: cardIndex, card: card})).to.be(true);
        });

        test('4 player should call discardObserver on all players', function () {
            playerIndex = 2, cardIndex = 3, card = new Card('red', 1);

            sut4player.addPlayer(player1, function (err) {});
            sut4player.addPlayer(player2, function (err) {});
            sut4player.addPlayer(player3, function (err) {});
            sut4player.addPlayer(player4, function (err) {});

            sut4player.sendCardDiscardedToAllPlayers(playerIndex, cardIndex, card);

            expect(spy1.calledWith({playerIndex: 2, cardIndex: cardIndex, card: card})).to.be(true);
            expect(spy2.calledWith({playerIndex: 1, cardIndex: cardIndex, card: card})).to.be(true);
            expect(spy3.calledWith({playerIndex: 0, cardIndex: cardIndex, card: card})).to.be(true);
            expect(spy4.calledWith({playerIndex: 3, cardIndex: cardIndex, card: card})).to.be(true);
        });
    });
});

