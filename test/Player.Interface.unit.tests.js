var expect = require('expect.js');
var sinon = require('sinon');
var testUtil = require('./Utility.js');

var PlayerInterface = require('../lib/PlayerInterface.js').PlayerInterface;
var SocketHandler = require('../lib/SocketHandler.js').SocketHandler;

// All classes that should implement this interface defined here
var implementations = [
    function () { return new PlayerInterface(); },
    function () { return new SocketHandler(); }
];

suite('Player.Interface implementations', function () {
    for (var i = 0; i < implementations.length; i++) {
        suite(testUtil.getObjectName(implementations[i]()), function () {
            var sut;
            var eventName = 'testEvent';
            var invalidEventName = 'invalidEvent';
            var implementation = implementations[i];

            setup(function () {
                sut = implementation();
            });
            suite('contract', function () {
                test('should define getPlayerId() method', function () {
                    expect(sut.getPlayerId).to.be.a('function');
                });

                test('should define readyObserver() method', function () {
                    expect(sut.readyObserver).to.be.a('function');
                });
                test('should define moveObserver() method', function () {
                    expect(sut.moveObserver).to.be.a('function');
                });
                test('should define cardDrawnObserver() method', function () {
                    expect(sut.cardDrawnObserver).to.be.a('function');
                });
                test('should define playObserver() method', function () {
                    expect(sut.playObserver).to.be.a('function');
                });
                test('should define clueObserver() method', function () {
                    expect(sut.clueObserver).to.be.a('function');
                });
                test('should define discardObserver() method', function () {
                    expect(sut.discardObserver).to.be.a('function');
                });
                test('should define clueUsedObserver() method', function () {
                    expect(sut.clueUsedObserver).to.be.a('function');
                });
                test('should define clueRestoredObserver() method', function () {
                    expect(sut.clueRestoredObserver).to.be.a('function');
                });
                test('should define lifeLostObserver() method', function () {
                    expect(sut.lifeLostObserver).to.be.a('function');
                });
                test('should define endgameBeginsObserver() method', function () {
                    expect(sut.endgameBeginsObserver).to.be.a('function');
                });
                test('should define deckExhaustedObserver() method', function () {
                    expect(sut.deckExhaustedObserver).to.be.a('function');
                });
                test('should define endgameBeginsObserver() method', function () {
                    expect(sut.endgameBeginsObserver).to.be.a('function');
                });

                test('should define events', function () {
                    expect(sut.events).to.contain('playCard');
                    expect(sut.events).to.contain('discardCard');
                    expect(sut.events).to.contain('giveClue');
                });
            });
        });
    }
});

