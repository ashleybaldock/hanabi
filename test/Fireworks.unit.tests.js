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

        test('should define onFireworkComplete() method', function () {
            expect(sut.onFireworkComplete).to.be.a('function');
        });

        test('should define events', function () {
            expect(sut.events).to.have.key('fireworkComplete');
            expect(sut.events).to.have.key('fireworksComplete');
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
});
