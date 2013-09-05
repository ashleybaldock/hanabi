var expect = require('expect.js');
var sinon = require('sinon');

var LifeTokens = require('../lib/LifeTokens.js').LifeTokens;

suite('LifeTokens', function () {
    var sut;
    var max = 3;

    setup(function () {
        sut = new LifeTokens(max);
    });

    suite('contract', function () {
        test('should define livesRemaining() method', function () {
            expect(sut.livesRemaining).to.be.a('function');
        });

        test('should define loseLife() method', function () {
            expect(sut.loseLife).to.be.a('function');
        });

        test('should define events', function () {
            expect(sut.events).to.have.key('lifeLost');
            expect(sut.events).to.have.key('allLivesLost');
        });
    });

    suite('constructor', function () {
        test('on construct should set lives', function (done) {
            sut.livesRemaining(function (lives) {
                expect(lives).to.be(max);
                done();
            });
        });
    });

    suite('livesRemaining()', function () {
        test('should throw error if callback not a function', function () {
            expect(function () {
                sut.livesRemaining();
            }).to.throwException('Error: missing callback');
        });

        test('should execute callback with current number of lives', function (done) {
            sut.livesRemaining(function (lives) {
                expect(lives).to.be(max);
                done();
            });
        });

        test('should execute callback with current number of lives after life lost', function (done) {
            sut.loseLife(function () {
                sut.livesRemaining(function (lives) {
                    expect(lives).to.be(max - 1);
                    done();
                });
            });
        });
    });

    suite('loseLife()', function () {
        test('should throw error if callback not a function', function () {
            expect(function () {
                sut.loseLife();
            }).to.throwException('Error: missing callback');
        });

        test('should execute callback', function (done) {
            sut.loseLife(function () {
                done();
            });
        });

        test('when lives remain should reduce lives by one and emit lifeLost event', function (done) {
            var callbackLifeLost = sinon.spy();
            var callbackAllLivesLost = sinon.spy();
            var context = new Object();
            sut.registerForEvent('allLivesLost', callbackAllLivesLost, context);
            sut.registerForEvent('lifeLost', callbackLifeLost, context);
            sut.loseLife(function (err) {
                expect(err).to.be(undefined);
                expect(callbackAllLivesLost.callCount).to.be(0);
                expect(callbackLifeLost.calledOn(context)).to.be(true);
                expect(callbackLifeLost.calledWithExactly(max - 1)).to.be(true);
                sut.livesRemaining(function (lives) {
                    expect(lives).to.be(max - 1);
                    done();
                });
            });
        });

        test('when last life lost should not reduce lives and emit lifeLost and allLivesLost events', function (done) {
            var callbackLifeLost = sinon.spy();
            var callbackAllLivesLost = sinon.spy();
            var context = new Object();
            sut.registerForEvent('allLivesLost', callbackAllLivesLost, context);
            sut.registerForEvent('lifeLost', callbackLifeLost, context);
            sut.lives = 1;
            sut.loseLife(function (err) {
                expect(err).to.be(undefined);
                expect(callbackAllLivesLost.calledOn(context)).to.be(true);
                expect(callbackLifeLost.calledOn(context)).to.be(true);
                expect(callbackLifeLost.calledWithExactly(0)).to.be(true);
                sut.livesRemaining(function (lives) {
                    expect(lives).to.be(0);
                    done();
                });
            });
        });

        test('when no lives remain should execute callback with error and not alter life count', function (done) {
            var callbackLifeLost = sinon.spy();
            var callbackAllLivesLost = sinon.spy();
            var context = new Object();
            sut.registerForEvent('allLivesLost', callbackAllLivesLost, context);
            sut.registerForEvent('lifeLost', callbackLifeLost, context);
            sut.lives = 0;
            sut.loseLife(function (err) {
                expect(err).to.be('Error: All lives have been lost');
                expect(callbackAllLivesLost.callCount).to.be(0);
                expect(callbackLifeLost.callCount).to.be(0);
                sut.livesRemaining(function (lives) {
                    expect(lives).to.be(0);
                    done();
                });
            });
        });
    });
});
