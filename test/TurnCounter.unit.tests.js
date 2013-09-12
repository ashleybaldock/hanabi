var expect = require('expect.js');
var sinon = require('sinon');

var TurnCounter = require('../lib/TurnCounter.js').TurnCounter;

suite('TurnCounter', function () {
    var sut;
    var playerCount = 2;

    setup(function () {
        sut = new TurnCounter(playerCount);
    });

    suite('contract', function () {
        test('should define takeTurn() method', function () {
            expect(sut.takeTurn).to.be.a('function');
        });

        test('should define enterEndgame() method', function () {
            expect(sut.enterEndgame).to.be.a('function');
        });

        test('should define events', function () {
            expect(sut.events).to.contain('endgameBegins');
            expect(sut.events).to.contain('endgameOver');
            expect(sut.events).to.contain('nextTurn');
        });
    });

    suite('constructor', function () {
        test('should set turn to 0', function () {
            expect(sut.turn).to.be(0);
        });

        test('should set remaining to playerCount input', function () {
            expect(sut.remaining).to.be(playerCount);
        });

        test('should set endgame to false', function () {
            expect(sut.endgame).to.be(false);
        });
    });

    suite('takeTurn()', function () {
        test('should increment turn counter', function () {
            sut.takeTurn(0);
            expect(sut.turn).to.be(1);
        });

        test('should send nextTurn event', function () {
            var callback = sinon.spy();
            var context = new Object();
            sut.registerForEvent('nextTurn', callback, context);
            sut.takeTurn(0);
            expect(callback.callCount).to.be(1);
            expect(callback.calledWith(0)).to.be(true);
        });

        test('should not send nextTurn event if endgameOver', function () {
            var callback = sinon.spy();
            var context = new Object();
            sut.registerForEvent('nextTurn', callback, context);
            sut.endgame = true;
            sut.remaining = 1;
            sut.takeTurn(0);
            expect(callback.callCount).to.be(0);
        });
    });

    suite('enterEndgame()', function () {
        test('should set endgame to true', function () {
            var callback = sinon.spy();
            var context = new Object();
            sut.registerForEvent('endgameBegins', callback, context);
            sut.enterEndgame();
            expect(sut.endgame).to.be(true);
            expect(callback.callCount).to.be(1);
        });

        test('should throw error if called twice', function () {
            expect(function () {
                sut.enterEndgame();
                sut.enterEndgame();
            }).to.throwException('Error: enterEndgame called while already in endgame');
        });

        test('subsequent takeTurn() calls should decrement remaining', function () {
            sut.takeTurn(0);
            expect(sut.turn).to.be(1);
            sut.enterEndgame();
            sut.takeTurn(1);
            expect(sut.turn).to.be(2);
            expect(sut.remaining).to.be(playerCount - 1);
        });

        test('after playerCount takeTurns() calls an endgameOver event should be sent', function () {
            var callback = sinon.spy();
            var context = new Object();
            sut.registerForEvent('endgameOver', callback, context);
            sut.takeTurn(0);
            expect(sut.turn).to.be(1);
            sut.enterEndgame();
            expect(callback.callCount).to.be(0);
            sut.takeTurn(1);
            expect(sut.turn).to.be(2);
            expect(sut.remaining).to.be(playerCount - 1);
            expect(callback.callCount).to.be(0);
            sut.takeTurn(2);
            expect(sut.turn).to.be(3);
            expect(sut.remaining).to.be(playerCount - 2);
            expect(callback.calledOn(context)).to.be(true);
            expect(callback.calledWith(sut.turn)).to.be(true);
        });
    });
});
