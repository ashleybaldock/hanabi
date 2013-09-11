var expect = require('expect.js');
var sinon = require('sinon');
var testUtil = require('./Utility.js');

var SocketHandler = require('../lib/SocketHandler.js').SocketHandler;
var ClueTokens = require('../lib/ClueTokens.js').ClueTokens;
var LifeTokens = require('../lib/LifeTokens.js').LifeTokens;
var Deck = require('../lib/Deck.js').Deck;
var Discard = require('../lib/Discard.js').Discard;
var TurnCounter = require('../lib/TurnCounter.js').TurnCounter;
var GameFactory = require('../lib/GameFactory.js').GameFactory;
var Firework = require('../lib/Firework.js').Firework;
var Fireworks = require('../lib/Fireworks.js').Fireworks;
var Hand = require('../lib/Hand.js').Hand;

// All classes that should implement this interface defined here
var implementations = [
    function () { return new SocketHandler(); },
    function () { return new ClueTokens(); },
    function () { return new LifeTokens(); },
    function () { return new Deck(); },
    function () { return new Discard(); },
    function () { return new TurnCounter(); },
    function () { return GameFactory(); },
    function () { return new Firework(); },
    function () { return new Fireworks(Firework, new LifeTokens(3), new Discard()); },
    function () { return new Hand(); }
];

suite('EventSource.Interface implementations', function () {
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
                test('should define registerForEvent() method', function () {
                    expect(sut.registerForEvent).to.be.a('function');
                });

                test('should define sendEvent() method', function () {
                    expect(sut.sendEvent).to.be.a('function');
                });

                test('should define createEventWiring() method', function () {
                    expect(sut.createEventWiring).to.be.a('function');
                });

                test('should define wiredEvents() method', function () {
                    expect(sut.wiredEvents).to.be.a('function');
                });

                test('should define events', function () {
                    expect(sut.events).to.be.an('array');
                });
            });

            suite('constructor', function () {
                test('should create wiring', function () {
                    var wirings = sut.wiredEvents();
                    expect(wirings).to.be.an('object');
                    for (var i = 0; i < sut.events.length; i++) {
                        expect(wirings).to.have.key(sut.events[i]);
                        expect(wirings[sut.events[i]]).to.be.an('array');
                        expect(wirings[sut.events[i]]).to.have.length(0);
                    }
                });
            });

            suite('createEventWiring()', function () {
                test('should return correct wiring', function () {
                    sut.events = [eventName];
                    var wiring = sut.createEventWiring();
                    expect(wiring).to.have.key(eventName);
                    expect(wiring[eventName]).to.be.an('array');
                    expect(wiring[eventName]).to.have.length(0);
                });
            });

            suite('registerForEvent()', function () {
                test('should throw error if eventName not valid', function () {
                    expect(function () {
                        sut.registerForEvent(invalidEventName, function () {}, new Object());
                    }).to.throwException('Error: event name invalid');
                });
                test('should throw error if callback not a function', function () {
                    expect(function () {
                        sut.registerForEvent(eventName, null, new Object());
                    }).to.throwException('Error: callback not a function');
                });
                test('should throw error if context not an object', function () {
                    expect(function () {
                        sut.registerForEvent(eventName, function () {}, undefined);
                    }).to.throwException('Error: context not an object');
                });

                test('should add event to wirings returned by wiredEvents()', function () {
                    sut.events = [eventName];
                    var wiring = sut.createEventWiring();
                    var stub = sinon.stub(sut, 'wiredEvents').returns(wiring);
                    var spy = sinon.spy();
                    var context = new Object();
                    sut.registerForEvent(eventName, spy, context);
                    expect(wiring[eventName][0]).to.have.key('callback');
                    expect(wiring[eventName][0]).to.have.key('context');
                    expect(wiring[eventName][0].callback).to.be(spy);
                    expect(wiring[eventName][0].context).to.be(context);
                });
            });

            suite('sendEvent()', function () {
                test('should throw error if eventName not valid', function () {
                    expect(function () {
                        sut.sendEvent(invalidEventName);
                    }).to.throwException('Error: event name invalid');
                });

                test('should execute all registered callbacks', function () {
                    sut.events = [eventName];
                    var wiring = sut.createEventWiring();
                    var stub = sinon.stub(sut, 'wiredEvents').returns(wiring);
                    var callback1 = sinon.spy();
                    var callback2 = sinon.spy();
                    var context = new Object();
                    sut.registerForEvent(eventName, callback1, context);
                    sut.registerForEvent(eventName, callback2, context);
                    sut.sendEvent(eventName);
                    expect(callback1.calledOn(context)).to.be(true);
                    expect(callback2.calledOn(context)).to.be(true);
                });
            });
        });
    }
});
