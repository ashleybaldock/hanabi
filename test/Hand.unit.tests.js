var expect = require('expect.js');
var sinon = require('sinon');

var Hand = require('../lib/Hand.js').Hand;
var Deck = require('../lib/Deck.js').Deck;
var Card = require('../lib/Card.js').Card;

suite('Hand', function () {
    var sut;
    var cardCount = 4;
    var deck = new Deck();

    setup(function () {
        sut = new Hand(cardCount, deck);
    });

    suite('contract', function () {
        test('should define drawCard() method', function () {
            expect(sut.drawCard).to.be.a('function');
        });

        test('should define events', function () {
            expect(sut.events).to.contain('cardDrawn');
        });
    });

    suite('constructor', function () {
        test('should set cardCount and deck properties', function () {
            expect(sut.deck()).to.be(deck);
            expect(sut.cards).to.have.length(0);
            expect(sut.size).to.be(cardCount);
        });
    });

    suite('drawCard()', function () {
        test('should throw error if callback not a function', function () {
            expect(function () {
                sut.drawCard();
            }).to.throwException('error: missing callback');
        });

        test('should draw card using drawCard method supplied in constructor and emit cardDrawn event', function (done) {
            var callback = sinon.spy();
            var context = new Object();
            sut.registerForEvent('cardDrawn', callback, context);
            var card = new Card('red', 1);
            var stub = sinon.stub(deck, 'drawCard').callsArgWith(0, card);
            sut.drawCard(function (err) {
                expect(err).to.be(undefined);
                expect(stub.callCount).to.be(1);
                expect(callback.calledOn(context)).to.be(true);
                expect(callback.calledWithExactly(card)).to.be(true);
                expect(sut.cards).to.have.length(1);
                stub.restore();
                done();
            });
        });

        test('should execute callback with error when hand full', function (done) {
            sut.cards = [new Card('red', 1), new Card('blue', 1),
                         new Card('green', 1), new Card('white', 1)];
            sut.drawCard(function (err) {
                expect(err).to.be('Error: hand full');
                expect(sut.cards).to.have.length(4);
                done();
            });
        });

        test('should execute callback with error when deck empty', function (done) {
            var stub = sinon.stub(deck, 'drawCard').callsArgWith(0, 'Error: Deck exhausted');
            sut.drawCard(function (err) {
                expect(err).to.be('Error: Deck exhausted');
                stub.restore();
                done();
            });
        });
    });
});
