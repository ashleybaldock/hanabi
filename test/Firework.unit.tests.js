var expect = require('expect.js');
var sinon = require('sinon');

var Firework = require('../lib/Firework.js').Firework;

suite('Firework', function () {
    var sut;

    setup(function () {
        sut = new Firework('red');
    });

    suite('contract', function () {
        test('should define getColour() method', function () {
            expect(sut.getColour).to.be.a('function');
        });

        test('should define getValue() method', function () {
            expect(sut.getValue).to.be.a('function');
        });

        test('should define play() method', function () {
            expect(sut.play).to.be.a('function');
        });

        test('play() should accept only Number as first argument', function (done) {
            sut.play(undefined, function (err) {
                expect(err).to.be('Error: Invalid argument');
                done();
            });
        });

        test('play() should accept only values below 6', function (done) {
            sut.play(6, function (err) {
                expect(err).to.be('Error: Invalid argument');
                done();
            });
        });

        test('play() should accept only values above 0', function (done) {
            sut.play(0, function (err) {
                expect(err).to.be('Error: Invalid argument');
                done();
            });
        });

        test('should define events', function () {
            expect(sut.events).to.have.key('fireworkComplete');
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
                sut.play(1, function (err) {
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
            sut.getValue(function (value) {
                expect(value).to.be(0);
                sut.play(1, function (err) {
                    expect(err).to.be(undefined);
                    sut.getValue(function (value) {
                        expect(value).to.be(1);
                        sut.play(2, function (err) {
                            expect(err).to.be(undefined);
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
            sut.play(2, function (err) {
                expect(callback.callCount).to.be(0);
                expect(err).to.be('Error: Invalid play');
                done();
            });
        });

        test('on invalid call (same) should execute callback with error', function (done) {
            var callback = sinon.spy();
            var context = new Object();
            sut.registerForEvent('fireworkComplete', callback, context);
            sut.play(1, function (err) {
                expect(err).to.be(undefined);
                sut.play(1, function (err) {
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
            sut.play(1, function (err) {
                expect(err).to.be(undefined);
                sut.play(2, function (err) {
                    expect(err).to.be(undefined);
                    sut.play(1, function (err) {
                        expect(callback.callCount).to.be(0);
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
            sut.play(5, function (err) {
                expect(err).to.be(undefined);
                expect(callback.calledOn(context)).to.be(true);
                expect(callback.calledWithExactly('red')).to.be(true);
                done();
            });
        });
    });
});
