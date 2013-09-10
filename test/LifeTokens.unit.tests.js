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
            expect(sut.events).to.contain('lifeLost');
            expect(sut.events).to.contain('allLivesLost');
        });
    });

    suite('constructor', function () {
        test('on construct should set lives', function () {
            expect(sut.livesRemaining()).to.be(max);
        });
    });

    suite('livesRemaining()', function () {
        test('should return current number of lives after life lost', function () {
            sut.loseLife();
            expect(sut.livesRemaining()).to.be(max - 1);
        });
    });

    suite('loseLife()', function () {
        test('when lives remain should reduce lives by one and emit lifeLost event', function () {
            var callbackLifeLost = sinon.spy();
            var callbackAllLivesLost = sinon.spy();
            var context = new Object();
            sut.registerForEvent('allLivesLost', callbackAllLivesLost, context);
            sut.registerForEvent('lifeLost', callbackLifeLost, context);

            sut.loseLife();

            expect(callbackAllLivesLost.callCount).to.be(0);
            expect(callbackLifeLost.calledOn(context)).to.be(true);
            expect(callbackLifeLost.calledWithExactly(max - 1)).to.be(true);
            expect(sut.livesRemaining()).to.be(max - 1);
        });

        test('when last life lost should not reduce lives and emit lifeLost and allLivesLost events', function () {
            var callbackLifeLost = sinon.spy();
            var callbackAllLivesLost = sinon.spy();
            var context = new Object();
            sut.registerForEvent('allLivesLost', callbackAllLivesLost, context);
            sut.registerForEvent('lifeLost', callbackLifeLost, context);
            sut.lives = 1;

            sut.loseLife();

            expect(callbackAllLivesLost.calledOn(context)).to.be(true);
            expect(callbackLifeLost.calledOn(context)).to.be(true);
            expect(callbackLifeLost.calledWithExactly(0)).to.be(true);
            expect(sut.livesRemaining()).to.be(0);
        });

        test('when no lives remain should execute callback with error and not alter life count', function () {
            var callbackLifeLost = sinon.spy();
            var callbackAllLivesLost = sinon.spy();
            var context = new Object();
            sut.registerForEvent('allLivesLost', callbackAllLivesLost, context);
            sut.registerForEvent('lifeLost', callbackLifeLost, context);
            sut.lives = 0;

            expect(function () {
                sut.loseLife();
            }).to.throwException('Error: All lives have been lost');

            expect(callbackAllLivesLost.callCount).to.be(0);
            expect(callbackLifeLost.callCount).to.be(0);
            expect(sut.livesRemaining()).to.be(0);
        });
    });
});
