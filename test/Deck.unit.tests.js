var expect = require('expect.js');
var sinon = require('sinon');

var Deck = require('../lib/Deck.js').Deck;
var Card = require('../lib/Card.js').Card;

suite('Deck', function () {
    var sut;

    setup(function () {
        sut = new Deck();
    });

    suite('contract', function () {
        test('should define cardsRemaining() method', function () {
            expect(sut.cardsRemaining).to.be.a('function');
        });

        test('should define drawCard() method', function () {
            expect(sut.drawCard).to.be.a('function');
        });

        test('should define events', function () {
            expect(sut.events).to.have.key('deckExhausted');
        });
    });

    suite('constructor', function () {
        test('on construct should shuffle cards', function () {
            var sut1 = new Deck();
            var sut2 = new Deck();
            expect(sut1.cards).to.not.be(sut2.cards);
        });
    });

    suite('cardsRemaining()', function () {
        test('should throw error if callback not a function', function () {
            expect(function () {
                sut.cardsRemaining();
            }).to.throwException('error: missing callback');
        });

        test('should execute callback with number of cards remaining', function (done) {
            sut.cardsRemaining(function (beforeCount) {
                expect(beforeCount).to.be(sut.cards.length);
                done();
            });
        });

        test('should return one less than last call after drawCard()', function (done) {
            sut.cardsRemaining(function (beforeCount) {
                sut.drawCard(function (card) {
                    sut.cardsRemaining(function (afterCount) {
                        expect(beforeCount).to.be(afterCount + 1);
                        done();
                    });
                });
            });
        });
    });

    suite('drawCard()', function () {
        test('should throw error if callback not a function', function () {
            expect(function () {
                sut.drawCard();
            }).to.throwException('error: missing callback');
        });

        test('should execute callback with next card and reduce number of cards by 1', function (done) {
            var next = sut.cards[sut.cards.length - 1];
            sut.cardsRemaining(function (beforeCount) {
                sut.drawCard(function (card) {
                    expect(card.colour).to.be(next.colour);
                    expect(card.value).to.be(next.value);
                    sut.cardsRemaining(function (afterCount) {
                        expect(beforeCount).to.be(afterCount + 1);
                        done();
                    });
                });
            });
        });

        test('when last card drawn should send deckExhausted event', function (done) {
            sut.cards = [new Card('white', 1)];
            var callback = sinon.spy();
            var context = new Object();
            sut.registerForEvent('deckExhausted', callback, context);
            sut.cardsRemaining(function (beforeCount) {
                expect(beforeCount).to.be(1);
                sut.drawCard(function (card) {
                    expect(card.colour).to.be('white');
                    expect(card.value).to.be(1);
                    expect(callback.calledOn(context)).to.be(true);
                    sut.cardsRemaining(function (afterCount) {
                        expect(afterCount).to.be(0);
                        done();
                    });
                });
            });
        });

        test('when no cards remain, should execute callback with error', function (done) {
            var callback = sinon.spy();
            var context = new Object();
            sut.cards = [];
            sut.registerForEvent('deckExhausted', callback, context);
            sut.cardsRemaining(function (beforeCount) {
                expect(beforeCount).to.be(0);
                sut.drawCard(function (err) {
                    expect(err).to.be('Error: Deck exhausted');
                    expect(callback.callCount).to.be(0);
                    sut.cardsRemaining(function (afterCount) {
                        expect(afterCount).to.be(0);
                        done();
                    });
                });
            });
        });
    });
});
