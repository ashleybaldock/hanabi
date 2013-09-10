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
var Hand = require('../lib/Hand.js').Hand;

suite('Game', function () {
    var sut, sut2player, sut3player, sut4player, sut5player;
    var name = 'testGame', playerCount = 2;

    setup(function () {
        console.log('Game setup');

        sut = new Game(name, playerCount);
        sut2player = new Game(name, 2);
        sut3player = new Game(name, 3);
        sut4player = new Game(name, 4);
        sut5player = new Game(name, 5);
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

        test('should define giveClue() method', function () {
            expect(sut.giveClue).to.be.a('function');
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
        test('should define onDeckExhausted event handler', function () {
            expect(sut.onDeckExhausted).to.be.a('function');
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
    });

    suite('wireEvents()', function () {
    });

    suite('addPlayer()', function () {
        test('should throw error if callback not a function', function () {
            expect(function () {
                sut.addPlayer();
            }).to.throwException('Error: missing callback');
        });

        test('should wire up cardDrawn event on Hand', function (done) {
            var player = new PlayerInterface();
            var stub = sinon.stub(player, 'getPlayerId').returns(0);
            var spy = sinon.spy(sut.hands[0], 'registerForEvent');
            sut.addPlayer(player, function (err) {
                expect(spy.calledWith('cardDrawn')).to.be.ok();
                done();
            });
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

        test('should call drawCard on all hands until they are full (4 player)', function (done) {
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
});

