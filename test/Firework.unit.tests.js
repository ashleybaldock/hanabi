var expect = require('expect.js');
var sinon = require('sinon');

var Firework = require('../lib/Firework.js').Firework;
var Card = require('../lib/Card.js').Card;

suite('Firework', function () {
    var sut, card1, card2, card3, card4, card5;

    setup(function () {
        card1 = new Card('red', 1);
        card2 = new Card('red', 2);
        card3 = new Card('red', 3);
        card4 = new Card('red', 4);
        card5 = new Card('red', 5);

        sut = new Firework('red');
    });

    suite('contract', function () {
        test('should define getColour() method', function () {
            expect(sut.getColour).to.be.a('function');
        });

        test('should define getValue() method', function () {
            expect(sut.getValue).to.be.a('function');
        });

        test('should define isComplete() method', function () {
            expect(sut.isComplete).to.be.a('function');
        });

        test('should define play() method', function () {
            expect(sut.play).to.be.a('function');
        });

        test('play() should accept only Card as first argument', function (done) {
            sut.play(undefined, function (err) {
                expect(err).to.be('Error: Invalid argument');
                done();
            });
        });

        test('play() should accept only values below 6', function (done) {
            sut.play(new Card('red', 6), function (err) {
                expect(err).to.be('Error: Invalid argument');
                done();
            });
        });

        test('play() should accept only values above 0', function (done) {
            sut.play(new Card('red', 0), function (err) {
                expect(err).to.be('Error: Invalid argument');
                done();
            });
        });

        test('play() should accept only colours matching firework', function (done) {
            sut.play(new Card('blue', 1), function (err) {
                expect(err).to.be('Error: Invalid argument');
                done();
            });
        });

        test('should define events', function () {
            expect(sut.events).to.contain('fireworkComplete');
            expect(sut.events).to.contain('invalidPlay');
        });
    });

    suite('constructor', function () {
        test('on construct should set colour', function (done) {
            sut.getColour(function (colour) {
                expect(colour).to.be('red');
                done();
            });
        });

        test('on construct should set value to 0', function (done) {
            sut.getValue(function (value) {
                expect(value).to.be(0);
                done();
            });
        });
    });

    suite('getColour()', function () {
        test('should throw error if callback not a function', function () {
            expect(function () {
                sut.getColour();
            }).to.throwException('Error: missing callback');
        });

        test('should execute callback with colour', function (done) {
            sut.getColour(function (colour) {
                expect(colour).to.be('red');
                done();
            });
        });
    });

    suite('getValue()', function () {
        test('should throw error if callback not a function', function () {
            expect(function () {
                sut.getValue();
            }).to.throwException('Error: missing callback');
        });

        test('should execute callback with current value', function (done) {
            sut.getValue(function (value) {
                expect(value).to.be(0);
                done();
            });
        });

        test('after correct play should show updated value', function (done) {
            sut.getValue(function (value) {
                expect(value).to.be(0);
                sut.play(card1, function (err) {
                    expect(err).to.be(undefined);
                    sut.getValue(function (value) {
                        expect(value).to.be(1);
                        done();
                    });
                });
            });
        });
    });

    suite('play()', function () {
        test('should throw error if callback not a function', function () {
            expect(function () {
                sut.play(1);
            }).to.throwException('Error: missing callback');
        });

        test('on valid call should increment value', function (done) {
            var callback = sinon.spy();
            var context = new Object();
            sut.registerForEvent('fireworkComplete', callback, context);
            var invalidPlayCallback = sinon.spy();
            sut.registerForEvent('invalidPlay', invalidPlayCallback, context);
            expect(sut.isComplete()).to.be(false);
            sut.getValue(function (value) {
                expect(value).to.be(0);
                sut.play(card1, function (err) {
                    expect(invalidPlayCallback.callCount).to.be(0);
                    expect(err).to.be(undefined);
                    expect(sut.isComplete()).to.be(false);
                    sut.getValue(function (value) {
                        expect(value).to.be(1);
                        sut.play(card2, function (err) {
                            expect(invalidPlayCallback.callCount).to.be(0);
                            expect(err).to.be(undefined);
                            expect(sut.isComplete()).to.be(false);
                            sut.getValue(function (value) {
                                expect(value).to.be(2);
                                expect(callback.callCount).to.be(0);
                                done();
                            });
                        });
                    });
                });
            });
        });

        test('on invalid call (too high) should execute callback with error', function (done) {
            var callback = sinon.spy();
            var context = new Object();
            sut.registerForEvent('fireworkComplete', callback, context);
            var invalidPlayCallback = sinon.spy();
            sut.registerForEvent('invalidPlay', invalidPlayCallback, context);
            sut.play(card2, function (err) {
                expect(callback.callCount).to.be(0);
                expect(invalidPlayCallback.callCount).to.be(1);
                expect(invalidPlayCallback.calledWith(card2)).to.be(true);
                expect(err).to.be('Error: Invalid play');
                done();
            });
        });

        test('on invalid call (same) should execute callback with error', function (done) {
            var callback = sinon.spy();
            var context = new Object();
            sut.registerForEvent('fireworkComplete', callback, context);
            var invalidPlayCallback = sinon.spy();
            sut.registerForEvent('invalidPlay', invalidPlayCallback, context);
            sut.play(card1, function (err) {
                expect(err).to.be(undefined);
                sut.play(card1, function (err) {
                    expect(invalidPlayCallback.callCount).to.be(1);
                    expect(invalidPlayCallback.calledWith(card1)).to.be(true);
                    expect(callback.callCount).to.be(0);
                    expect(err).to.be('Error: Invalid play');
                    done();
                });
            });
        });

        test('on invalid call (too low) should execute callback with error', function (done) {
            var callback = sinon.spy();
            var context = new Object();
            sut.registerForEvent('fireworkComplete', callback, context);
            var invalidPlayCallback = sinon.spy();
            sut.registerForEvent('invalidPlay', invalidPlayCallback, context);
            sut.play(card1, function (err) {
                expect(err).to.be(undefined);
                sut.play(card2, function (err) {
                    expect(err).to.be(undefined);
                    sut.play(card1, function (err) {
                        expect(callback.callCount).to.be(0);
                        expect(invalidPlayCallback.callCount).to.be(1);
                        expect(invalidPlayCallback.calledWith(card1)).to.be(true);
                        expect(err).to.be('Error: Invalid play');
                        done();
                    });
                });
            });
        });

        test('when firework max value reached should trigger fireworkComplete event', function (done) {
            var callback = sinon.spy();
            var context = new Object();
            sut.registerForEvent('fireworkComplete', callback, context);
            sut.value = 4;
            sut.play(card5, function (err) {
                expect(err).to.be(undefined);
                expect(callback.calledOn(context)).to.be(true);
                expect(callback.calledWithExactly('red')).to.be(true);
                expect(sut.isComplete()).to.be(true);
                done();
            });
        });
    });
});
