var expect = require('expect.js');

var ClueTokens = require('../lib/ClueTokens.js').ClueTokens;

suite('ClueTokens', function () {
    var sut;

    setup(function () {
        sut = new ClueTokens();
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

        test('should define registerForEvent() method', function () {
            expect(sut.registerForEvent).to.be.a('function');
        });

        test('should define events', function () {
            expect(sut.events).to.contain('clueUsed');
            expect(sut.events).to.contain('clueRestored');
        });
    });

    suite('constructor', function () {
        test('on construct should set clues', function (done) {
            sut.cluesRemaining(function (clues) {
                expect(clues).to.be(9);
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
            sut.useClue(function (err) {
                expect(err).to.be(undefined);
                sut.cluesRemaining(function (clues) {
                    expect(clues).to.be(8);
                    done();
                });
            });
        });

        test('when no clues remain should execute callback with error', function (done) {
            sut.clues = 0;
            sut.useClue(function (err) {
                expect(err).to.be('Error: No clues remain');
                sut.cluesRemaining(function (clues) {
                    expect(clues).to.be(0);
                    done();
                });
            });
        });
    });
});
