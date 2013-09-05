var expect = require('expect.js');
var sinon = require('sinon');

var getObjectClass = function (obj) {
    if (typeof obj !== 'object' || obj === null) return false;
    return /(\w+)\(/.exec(obj.constructor.toString())[1];
}

var getFunctionName = function (func) {
    if (typeof func !== 'function' || func === null) return false;
    return /(\w+)\(/.exec(func.toString())[1];
}

// All classes that should implement this interface defined here
var implementations = [
    require('../lib/ClueTokens.js').ClueTokens
];

suite('EventSource.Interface implementations', function () {
    var implementation;
    for (var i = 0; i < implementations.length; i++) {
        implementation = implementations[i];
        suite(getFunctionName(implementation), function () {
            var sut;
            var eventName = 'testEvent';
            var invalidEventName = 'invalidEvent';

            setup(function () {
                sut = new implementation();
                sut.events = {'testEvent': []};
            });

            suite('contract', function () {
                test('should define registerForEvent() method', function () {
                    expect(sut.registerForEvent).to.be.a('function');
                });

                test('should define sendEvent() method', function () {
                    expect(sut.sendEvent).to.be.a('function');
                });

                test('should define events', function () {
                    expect(sut.events).to.be.a(typeof {});
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
            });

            suite('sendEvent()', function () {
                test('should throw error if eventName not valid', function () {
                    expect(function () {
                        sut.sendEvent(invalidEventName);
                    }).to.throwException('Error: event name invalid');
                });

                test('when sentEvent() called, should execute all registered callbacks', function () {
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
