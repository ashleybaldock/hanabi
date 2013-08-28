var expect = require('expect.js');

var Firework = require('../lib/Firework.js').Firework;

suite('Firework', function () {
    var sut;

    setup(function () {
        sut = new Firework('red');
    });

    teardown(function () {
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

        // TODO nice way of doing argument checking
        test('play() should accept only Number as first argument', function () {
            expect(function () {
                sut.play(1);
            }).to.not.throwException();
            expect(function () {
                sut.play();
            }).to.throwException(/InvalidArgument/);
            expect(function () {
                sut.play('');
            }).to.throwException(/InvalidArgument/);
        });

        test('play() should accept only values below 6', function () {
            expect(function () {
                sut.play(6);
            }).to.throwException(/InvalidArgument/);
        });

        test('play() should accept only values above 0', function () {
            expect(function () {
                sut.play(0);
            }).to.throwException(/InvalidArgument/);
        });

        test('should define addFireworkCompleteObserver() method', function () {
            expect(sut.addFireworkCompleteObserver).to.be.a('function');
        });

        test('addFireworkCompleteObserver() method should accept Function as first argument, Object as second argument', function () {
            expect(function () {
                sut.addFireworkCompleteObserver(function () {}, new Object());
            }).to.not.throwException();
            expect(function () {
                sut.addFireworkCompleteObserver(1, '');
            }).to.throwException(/InvalidArgument/);
        });

        test('should define addInvalidPlayObserver() method', function () {
            expect(sut.addInvalidPlayObserver).to.be.a('function');
        });

        test('addInvalidPlayObserver() method should accept Function as first argument, Object as second argument', function () {
            expect(function () {
                sut.addInvalidPlayObserver(function () {}, new Object());
            }).to.not.throwException();
            expect(function () {
                sut.addInvalidPlayObserver(1, '');
            }).to.throwException(/InvalidArgument/);
        });
    });

    suite('constructor', function () {
        test('on construct should set colour', function () {
            expect(sut.getColour()).to.be('red');
        });

        test('on construct should set value to 0', function () {
            expect(sut.getValue()).to.be(0);
        });
    });

    suite('play()', function () {
        var invalidPlayObserver1called;
        var addFireworkCompleteObserver1called;
        var addFireworkCompleteObserver2called;

        setup(function () {
            invalidPlayObserver1called = false;
            sut.addInvalidPlayObserver(function (colour) { invalidPlayObserver1called = true; }, this);

            addFireworkCompleteObserver1called = false;
            addFireworkCompleteObserver2called = false;
            sut.addFireworkCompleteObserver(function (colour) { addFireworkCompleteObserver1called = true; }, this);
            sut.addFireworkCompleteObserver(function (colour) { addFireworkCompleteObserver2called = true; }, this);
        });

        test('on valid call should increment value', function () {
            sut.play(1);
            expect(sut.getValue()).to.be(1);
            sut.play(2);
            expect(sut.getValue()).to.be(2);
        });

        test('on valid call should not trigger invalidPlay callback', function () {
            sut.play(1);
            expect(invalidPlayObserver1called).to.be(false);
        });

        test('on invalid call (too high) should throw exception and trigger invalidPlay callback', function () {
            expect(function () {
                sut.play(2);
            }).to.throwException(/InvalidPlay/);
            expect(invalidPlayObserver1called).to.be(true);
        });

        test('on invalid call (same) should throw exception and trigger invalidPlay callback', function () {
            sut.play(1);
            expect(function () {
                sut.play(1);
            }).to.throwException(/InvalidPlay/);
            expect(invalidPlayObserver1called).to.be(true);
        });

        test('on invalid call (too low) should throw exception and trigger invalidPlay callback', function () {
            sut.play(1);
            sut.play(2);
            expect(function () {
                sut.play(1);
            }).to.throwException(/InvalidPlay/);
            expect(invalidPlayObserver1called).to.be(true);
        });

        test('on call when max value reached should trigger registered callbacks', function () {
            sut.play(1);
            sut.play(2);
            sut.play(3);
            sut.play(4);
            expect(addFireworkCompleteObserver1called).to.be(false);
            expect(addFireworkCompleteObserver2called).to.be(false);
            sut.play(5);
            expect(addFireworkCompleteObserver1called).to.be(true);
            expect(addFireworkCompleteObserver2called).to.be(true);
        });
    });
});
