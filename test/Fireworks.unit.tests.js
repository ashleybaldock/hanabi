var expect = require('expect.js');
var sinon = require('sinon');

var Fireworks = require('../lib/Fireworks.js').Fireworks;
var Firework = require('../lib/Firework.js').Firework;

suite('Fireworks', function () {
    var sut, fireworkConstructor,
        redFirework, blueFirework, greenFirework, yellowFirework, whiteFirework,
        redFireworkRegSpy, blueFireworkRegSpy, greenFireworkRegSpy, yellowFireworkRegSpy,
        whiteFireworkRegSpy;

    setup(function () {
        redFirework = new Firework('red');
        blueFirework = new Firework('blue');
        greenFirework = new Firework('green');
        yellowFirework = new Firework('yellow');
        whiteFirework = new Firework('white');
        redFireworkRegSpy = sinon.spy(redFirework, 'registerForEvent');
        blueFireworkRegSpy = sinon.spy(blueFirework, 'registerForEvent');
        greenFireworkRegSpy = sinon.spy(greenFirework, 'registerForEvent');
        yellowFireworkRegSpy = sinon.spy(yellowFirework, 'registerForEvent');
        whiteFireworkRegSpy = sinon.spy(whiteFirework, 'registerForEvent');

        fireworkConstructor = sinon.stub();
        fireworkConstructor.withArgs('red').returns(redFirework);
        fireworkConstructor.withArgs('blue').returns(blueFirework);
        fireworkConstructor.withArgs('green').returns(greenFirework);
        fireworkConstructor.withArgs('yellow').returns(yellowFirework);
        fireworkConstructor.withArgs('white').returns(whiteFirework);
        sut = new Fireworks(fireworkConstructor);
    });

    suite('contract', function () {
        test('should define play() method', function () {
            expect(sut.play).to.be.a('function');
        });

        test('play() should accept valid Card object', function (done) {
            sut.play(undefined, function (err) {
                expect(err).to.be('Error: Invalid argument');
                sut.play(null, function (err) {
                    expect(err).to.be('Error: Invalid argument');
                    done();
                });
            });
        });

        test('play() should accept Card with value', function (done) {
            sut.play({colour: 'red'}, function (err) {
                expect(err).to.be('Error: Invalid argument');
                done();
            });
        });

        test('play() should accept Card with valid colour', function (done) {
            sut.play({colour: 'pink', value: 2}, function (err) {
                expect(err).to.be('Error: Invalid argument');
                done();
            });
        });

        test('should define onFireworkComplete() method', function () {
            expect(sut.onFireworkComplete).to.be.a('function');
        });

        test('should define isComplete() method', function () {
            expect(sut.isComplete).to.be.a('function');
        });

        test('should define events', function () {
            expect(sut.events).to.contain('fireworkComplete');
            expect(sut.events).to.contain('allFireworksComplete');
        });
    });

    suite('constructor', function () {
        test('should populate fireworks using supplied constructor', function () {
            expect(redFireworkRegSpy.calledWith('fireworkComplete', sut.onFireworkComplete, sut)).to.be.ok();
            expect(blueFireworkRegSpy.calledWith('fireworkComplete', sut.onFireworkComplete, sut)).to.be.ok();
            expect(greenFireworkRegSpy.calledWith('fireworkComplete', sut.onFireworkComplete, sut)).to.be.ok();
            expect(yellowFireworkRegSpy.calledWith('fireworkComplete', sut.onFireworkComplete, sut)).to.be.ok();
            expect(whiteFireworkRegSpy.calledWith('fireworkComplete', sut.onFireworkComplete, sut)).to.be.ok();
            expect(fireworkConstructor.calledWithNew()).to.be.ok();
            expect(fireworkConstructor.callCount).to.be(5);
            expect(fireworkConstructor.calledWith('red')).to.be.ok();
            expect(fireworkConstructor.calledWith('blue')).to.be.ok();
            expect(fireworkConstructor.calledWith('green')).to.be.ok();
            expect(fireworkConstructor.calledWith('yellow')).to.be.ok();
            expect(fireworkConstructor.calledWith('white')).to.be.ok();
            expect(sut.fireworks).to.have.key('red');
            expect(sut.fireworks).to.have.key('blue');
            expect(sut.fireworks).to.have.key('green');
            expect(sut.fireworks).to.have.key('yellow');
            expect(sut.fireworks).to.have.key('white');
            expect(sut.fireworks.red).to.be(redFirework);
            expect(sut.fireworks.blue).to.be(blueFirework);
            expect(sut.fireworks.green).to.be(greenFirework);
            expect(sut.fireworks.yellow).to.be(yellowFirework);
            expect(sut.fireworks.white).to.be(whiteFirework);
        });
    });

    suite('onFireworkComplete()', function () {
        test('if colour not valid option should ignore', function () {
            var callback = sinon.spy();
            var context = new Object();
            sut.registerForEvent('fireworkComplete', callback, context);
            sut.registerForEvent('allFireworksComplete', callback, context);
            sut.onFireworkComplete('pink');
            expect(callback.callCount).to.be(0);
        });

        test('should emit fireworkComplete event to listeners', function () {
            var callback = sinon.spy();
            var callbackAll = sinon.spy();
            var context = new Object();
            sut.registerForEvent('fireworkComplete', callback, context);
            sut.registerForEvent('allFireworksComplete', callbackAll, context);
            sut.onFireworkComplete('red');
            expect(callbackAll.callCount).to.be(0);
            expect(callback.calledOn(context)).to.be(true);
            expect(callback.calledWithExactly('red')).to.be(true);
        });

        test('if all fireworks complete, should emit allFireworksComplete event to listeners', function () {
            var trueStub = sinon.stub(sut, 'isComplete').returns(true);
            var callback = sinon.spy();
            var callbackAll = sinon.spy();
            var context = new Object();
            sut.registerForEvent('fireworkComplete', callback, context);
            sut.registerForEvent('allFireworksComplete', callbackAll, context);
            sut.onFireworkComplete('red');
            expect(callbackAll.calledOn(context)).to.be(true);
            expect(callback.calledOn(context)).to.be(true);
            expect(callback.calledWithExactly('red')).to.be(true);
            trueStub.restore();
        });
    });

    suite('isComplete()', function () {
        test('should return true if all fireworks complete', function () {
            redGetValueStub = sinon.stub(redFirework, 'isComplete').returns(true);
            blueGetValueStub = sinon.stub(blueFirework, 'isComplete').returns(true);
            greenGetValueStub = sinon.stub(greenFirework, 'isComplete').returns(true);
            yellowGetValueStub = sinon.stub(yellowFirework, 'isComplete').returns(true);
            whiteGetValueStub = sinon.stub(whiteFirework, 'isComplete').returns(true);
            expect(sut.isComplete()).to.be(true);
        });

        test('should return false if any firework incomplete', function () {
            redGetValueStub = sinon.stub(redFirework, 'isComplete').returns(true);
            blueGetValueStub = sinon.stub(blueFirework, 'isComplete').returns(true);
            greenGetValueStub = sinon.stub(greenFirework, 'isComplete').returns(true);
            yellowGetValueStub = sinon.stub(yellowFirework, 'isComplete').returns(false);
            whiteGetValueStub = sinon.stub(whiteFirework, 'isComplete').returns(true);
            expect(sut.isComplete()).to.be(false);
        });
    });

    suite('play()', function () {
        test('should throw error if callback not a function', function () {
            expect(function () {
                sut.play();
            }).to.throwException('Error: missing callback');
        });

        test('should call corresponding Firework.play() method passing callback', function (done) {
            redPlayStub = sinon.stub(redFirework, 'play').callsArgWith(1, undefined);
            sut.play({colour: 'red', value: 2}, function (err) {
                expect(redPlayStub.calledWith(2)).to.be.ok();
                expect(err).to.be(undefined);
                done();
            });
        });

        test('should execute callback with error from Firework', function (done) {
            redPlayStub = sinon.stub(redFirework, 'play').callsArgWith(1, 'Error');
            sut.play({colour: 'red', value: 2}, function (err) {
                expect(redPlayStub.calledWith(2)).to.be.ok();
                expect(err).to.be('Error');
                done();
            });
        });
    });
});
