var expect = require('expect.js');
var sinon = require('sinon');

var GameFactory = require('../lib/GameFactory.js').GameFactory;
var PlayerInterface = require('../lib/PlayerInterface.js').PlayerInterface;
var Card = require('../lib/Card.js').Card;

suite('Game.integration', function () {
    var player1, player2, player3, player4, player5,
        player1stub, player2stub, player3stub, player4stub, player5stub,
        sut;

    // Specially arranged to make certain sequences possible
    // Hand 1: white 1, yellow 2, green 1, blue 1, red 1
    // Hand 2: white 1, yellow 1, green 1, blue 1, red 1
    // Hand 3: white 1, yellow 1, green 1, blue 1, red 1
    var makeCards = function () { return [
        new Card('red', 2), new Card('red', 2),
        new Card('red', 3), new Card('red', 3),
        new Card('red', 4), new Card('red', 4),
        new Card('red', 5),
        new Card('blue', 2), new Card('blue', 2),
        new Card('blue', 3), new Card('blue', 3),
        new Card('blue', 4), new Card('blue', 4),
        new Card('blue', 5),
        new Card('green', 2), new Card('green', 2),
        new Card('green', 3), new Card('green', 3),
        new Card('green', 4), new Card('green', 4),
        new Card('green', 5),
        new Card('yellow', 2), new Card('yellow', 1),
        new Card('yellow', 3), new Card('yellow', 3),
        new Card('yellow', 4), new Card('yellow', 4),
        new Card('yellow', 5),
        new Card('white', 2), new Card('white', 2),
        new Card('white', 3), new Card('white', 3),
        new Card('white', 4), new Card('white', 4),
        new Card('white', 5),
        new Card('red', 1), new Card('red', 1), new Card('red', 1),
        new Card('blue', 1), new Card('blue', 1), new Card('blue', 1),
        new Card('green', 1), new Card('green', 1), new Card('green', 1),
        new Card('yellow', 1), new Card('yellow', 1), new Card('yellow', 2),
        new Card('white', 1), new Card('white', 1), new Card('white', 1)
    ]};

    setup(function () {
        player1 = new PlayerInterface();
        player2 = new PlayerInterface();
        player3 = new PlayerInterface();
        sinon.stub(player1, 'getPlayerId').returns(0);
        sinon.stub(player2, 'getPlayerId').returns(1);
        sinon.stub(player3, 'getPlayerId').returns(2);

        sut = GameFactory('testGame', 3);
        sut.deck.cards = makeCards();
    });

    suite('collaboration with PlayerInterface', function () {
        setup(function () {
            sinon.spy(player1, 'readyObserver');
            sinon.spy(player2, 'readyObserver');
            sinon.spy(player3, 'readyObserver');
            sinon.spy(player1, 'moveObserver');
            sinon.spy(player2, 'moveObserver');
            sinon.spy(player3, 'moveObserver');
            sinon.spy(player1, 'cardDrawnObserver');
            sinon.spy(player2, 'cardDrawnObserver');
            sinon.spy(player3, 'cardDrawnObserver');
            sinon.spy(player1, 'playObserver');
            sinon.spy(player2, 'playObserver');
            sinon.spy(player3, 'playObserver');
            sinon.spy(player1, 'discardObserver');
            sinon.spy(player2, 'discardObserver');
            sinon.spy(player3, 'discardObserver');
            sinon.spy(player1, 'lifeLostObserver');
            sinon.spy(player2, 'lifeLostObserver');
            sinon.spy(player3, 'lifeLostObserver');
            sut.addPlayer(player1, function (err) {});
            sut.addPlayer(player2, function (err) {});
            sut.addPlayer(player3, function (err) {});
        });

        test('all players should receive readyObserver call when all players joined', function () {
            expect(player1.readyObserver.callCount).to.be(1);
            expect(player2.readyObserver.callCount).to.be(1);
            expect(player3.readyObserver.callCount).to.be(1);
        });

        test('first player should receive moveObserver call when game starts', function () {
            sut.start(function (err) {});

            expect(player1.moveObserver.callCount).to.be(1);
            expect(player2.moveObserver.callCount).to.be(0);
            expect(player3.moveObserver.callCount).to.be(0);
        });

        test('all players should receive cardDrawn events on game start', function () {
            sut.start(function (err) {});

            expect(player1.cardDrawnObserver.callCount).to.be(15);
            expect(player2.cardDrawnObserver.callCount).to.be(15);
            expect(player3.cardDrawnObserver.callCount).to.be(15);
        });

        suite('after start', function () {
            setup(function () {
                sut.start(function (err) {});

                player1.cardDrawnObserver.reset();
                player2.cardDrawnObserver.reset();
                player3.cardDrawnObserver.reset();
                player1.moveObserver.reset();
                player2.moveObserver.reset();
                player3.moveObserver.reset();
            });

            test('when playable card played should receive notifications', function () {
                // Play a white 1
                player1.sendEvent('playCard', [0, function (err) {
                    expect(err).to.be(undefined);
                }]);

                expect(player1.cardDrawnObserver.callCount).to.be(1);
                expect(player2.cardDrawnObserver.callCount).to.be(1);
                expect(player3.cardDrawnObserver.callCount).to.be(1);
                expect(player1.playObserver.callCount).to.be(1);
                expect(player2.playObserver.callCount).to.be(1);
                expect(player3.playObserver.callCount).to.be(1);
                expect(player1.moveObserver.callCount).to.be(0);
                expect(player2.moveObserver.callCount).to.be(1);
                expect(player3.moveObserver.callCount).to.be(0);
            });

            test('when unplayable card played should receive notifications', function () {
                // Play a yellow 2
                player1.sendEvent('playCard', [1, function (err) {
                    expect(err).to.be('Error: Invalid play');
                }]);

                expect(player1.cardDrawnObserver.callCount).to.be(1);
                expect(player2.cardDrawnObserver.callCount).to.be(1);
                expect(player3.cardDrawnObserver.callCount).to.be(1);
                expect(player1.playObserver.callCount).to.be(1);
                expect(player2.playObserver.callCount).to.be(1);
                expect(player3.playObserver.callCount).to.be(1);
                expect(player1.lifeLostObserver.callCount).to.be(1);
                expect(player2.lifeLostObserver.callCount).to.be(1);
                expect(player3.lifeLostObserver.callCount).to.be(1);
                expect(player1.moveObserver.callCount).to.be(0);
                expect(player2.moveObserver.callCount).to.be(1);
                expect(player3.moveObserver.callCount).to.be(0);
            });

            test('when discard card all players should receive discard notification', function () {
                player1.sendEvent('discardCard', [0, function (err) {
                    expect(err).to.be(undefined);
                }]);

                expect(player1.cardDrawnObserver.callCount).to.be(1);
                expect(player2.cardDrawnObserver.callCount).to.be(1);
                expect(player3.cardDrawnObserver.callCount).to.be(1);
                expect(player1.discardObserver.callCount).to.be(1);
                expect(player2.discardObserver.callCount).to.be(1);
                expect(player3.discardObserver.callCount).to.be(1);
                expect(player1.moveObserver.callCount).to.be(0);
                expect(player2.moveObserver.callCount).to.be(1);
                expect(player3.moveObserver.callCount).to.be(0);
            });
        });
    });
});
