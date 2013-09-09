var expect = require('expect.js');
var sinon = require('sinon');

var ClueTokens = require('../lib/ClueTokens.js').ClueTokens;

suite('ClueTokens', function () {
    var sut;
    var max = 9;

    setup(function () {
        sut = new ClueTokens(max);
    });

    suite('contract', function () {
        test('should define cluesRemaining() method', function () {
            expect(sut.cluesRemaining).to.be.a('function');
        });

        test('should define useClue() method', function () {
            expect(sut.useClue).to.be.a('function');
        });

        test('should define restoreClue() method', function () {
            expect(sut.restoreClue).to.be.a('function');
        });

        test('should define events', function () {
            expect(sut.events).to.contain('clueUsed');
            expect(sut.events).to.contain('clueRestored');
        });
    });

    suite('constructor', function () {
        test('on construct should set clues', function (done) {
            sut.cluesRemaining(function (clues) {
                expect(clues).to.be(max);
                done();
            });
        });
    });

    suite('useClue()', function () {
        test('should throw error if callback not a function', function () {
            expect(function () {
                sut.useClue();
            }).to.throwException('Error: missing callback');
        });

        test('should execute callback', function (done) {
            sut.useClue(function () {
                done();
            });
        });

        test('when clues remain should reduce clues by one and emit clueUsed event', function (done) {
            var callback = sinon.spy();
            var context = new Object();
            sut.registerForEvent('clueUsed', callback, context);
            sut.useClue(function (err) {
                expect(err).to.be(undefined);
                expect(callback.calledOn(context)).to.be(true);
                expect(callback.calledWithExactly(max - 1)).to.be(true);
                sut.cluesRemaining(function (clues) {
                    expect(clues).to.be(max - 1);
                    done();
                });
            });
        });

        test('when no clues remain should execute callback with error', function (done) {
            var callback = sinon.spy();
            var context = new Object();
            sut.registerForEvent('clueUsed', callback, context);
            sut.clues = 0;
            sut.useClue(function (err) {
                expect(callback.callCount).to.be(0);
                expect(err).to.be('Error: No clues remain');
                sut.cluesRemaining(function (clues) {
                    expect(clues).to.be(0);
                    done();
                });
            });
        });
    });

    suite('restoreClue()', function () {
        test('should throw error if callback not a function', function () {
            expect(function () {
                sut.restoreClue();
            }).to.throwException('Error: missing callback');
        });

        test('should execute callback', function (done) {
            sut.restoreClue(function () {
                done();
            });
        });

        test('when clues not full should increase clues by 1 and trigger clueRestored event', function (done) {
            var callback = sinon.spy();
            var context = new Object();
            sut.registerForEvent('clueRestored', callback, context);
            sut.clues = 0;
            sut.restoreClue(function (err) {
                expect(err).to.be(undefined);
                expect(callback.calledOn(context)).to.be(true);
                expect(callback.calledWithExactly(1)).to.be(true);
                sut.cluesRemaining(function (clues) {
                    expect(clues).to.be(1);
                    done();
                });
            });
        });

        test('when clues full should trigger callback', function (done) {
            sut.clues = max;
            sut.restoreClue(function (err) {
                expect(err).to.be(undefined);
                sut.cluesRemaining(function (clues) {
                    expect(clues).to.be(max);
                    done();
                });
            });
        });
    });
});
