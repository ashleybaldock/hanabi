var expect = require('expect.js');
var sinon = require('sinon');

var Hand = require('../lib/Hand.js').Hand;
var Deck = require('../lib/Deck.js').Deck;
var Card = require('../lib/Card.js').Card;
var Fireworks = require('../lib/Fireworks.js').Fireworks;
var Firework = require('../lib/Firework.js').Firework;
var Discard = require('../lib/Discard.js').Discard;
var LifeTokens = require('../lib/LifeTokens.js').LifeTokens;

suite('Hand', function () {
    var sut, deck, discard, fireworks, lifetokens,
        discardSpy, lifetokensSpy,
        card1, card2, card3, card4;
    var cardCount = 4;

    setup(function () {
        card1 = new Card('red', 1);
        card2 = new Card('red', 2);
        card3 = new Card('red', 3);
        card4 = new Card('red', 4);

        deck = new Deck();

        discard = new Discard();
        discardSpy = new sinon.spy(discard, 'discardCard');

        lifetokens = new LifeTokens(3);
        lifetokensSpy = new sinon.spy(lifetokens, 'loseLife');

        fireworks = new Fireworks(Firework, lifetokens, discard);
        sut = new Hand(cardCount, deck, fireworks);
    });

    suite('contract', function () {
        test('should define drawCard() method', function () {
            expect(sut.drawCard).to.be.a('function');
        });

        test('should define playIndex() method', function () {
            expect(sut.playIndex).to.be.a('function');
        });

        test('should define discardIndex() method', function () {
            expect(sut.discardIndex).to.be.a('function');
        });

        test('should define events', function () {
            expect(sut.events).to.contain('cardDrawn');
            expect(sut.events).to.contain('discardCard');
            expect(sut.events).to.contain('restoreClue');
        });
    });

    suite('constructor', function () {
        test('should set cardCount and deck properties', function () {
            expect(sut.deck()).to.be(deck);
            expect(sut.fireworks()).to.be(fireworks);
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

    suite('playIndex()', function () {
        test('should execute callback with error if invalid index', function (done) {
            sut.playIndex(0, function (err) {
                expect(err).to.be('Error: invalid index');
                done();
            });
        });

        test('should call fireworks.play() with card at specified index', function (done) {
            var card1 = new Card('red', 1);
            var card2 = new Card('red', 2);
            var card3 = new Card('red', 3);
            var card4 = new Card('red', 4);
            var cards = [card4, card3, card2, card1];
            var drawStub = sinon.stub(deck, 'drawCard', function (callback) {
                callback(cards.pop());
            });
            var stub = sinon.stub(fireworks, 'play').callsArgWith(1, undefined);
            sut.drawCard(function () {});
            expect(sut.cards).to.have.length(1);
            expect(sut.cards[0]).to.be(card1);
            console.log('after first drawCard sut.cards is: ' + JSON.stringify(sut.cards));
            sut.playIndex(0, function (err) {
                console.log('after playIndex call sut.cards is: ' + JSON.stringify(sut.cards));
                expect(err).to.be(undefined);
                expect(drawStub.callCount).to.be(2);
                expect(stub.calledWith(card1)).to.be(true);
                expect(sut.cards).to.have.length(1);
                expect(sut.cards[0]).to.be(card2);
                stub.restore();
                drawStub.restore();
                done();
            });
        });

        test('should remove indexed card and add new one at the end of array', function (done) {
            var card1 = new Card('red', 1);
            var card2 = new Card('red', 2);
            var card3 = new Card('red', 3);
            var card4 = new Card('red', 4);
            var newCard = new Card('blue', 5);
            var cards = [newCard, card4, card3, card2, card1];
            var drawStub = sinon.stub(deck, 'drawCard', function (callback) {
                callback(cards.pop());
            });
            var stub = sinon.stub(fireworks, 'play').callsArgWith(1, undefined);
            sut.drawCard(function () {});
            sut.drawCard(function () {});
            sut.drawCard(function () {});
            sut.drawCard(function () {});
            expect(sut.cards).to.have.length(4);
            expect(sut.cards[0]).to.be(card1);
            expect(sut.cards[1]).to.be(card2);
            expect(sut.cards[2]).to.be(card3);
            expect(sut.cards[3]).to.be(card4);
            sut.playIndex(1, function (err) {
                expect(err).to.be(undefined);
                expect(stub.calledWith(card2)).to.be(true);
                expect(sut.cards).to.have.length(4);
                expect(sut.cards[0]).to.be(card1);
                expect(sut.cards[1]).to.be(card3);
                expect(sut.cards[2]).to.be(card4);
                expect(sut.cards[3]).to.be(newCard);
                done();
            });
        });

        test('in collaboration with Fireworks should discard and lose life if playIndex unsuccessful', function (done) {
            var aCard = new Card('red', 2);
            var drawStub = sinon.stub(deck, 'drawCard').callsArgWith(0, aCard);
            var fireworksSpy = sinon.spy(fireworks, 'play');
            sut.drawCard(function () {});
            sut.playIndex(0, function (err) {
                expect(fireworksSpy.calledWith(aCard)).to.be(true);
                expect(discardSpy.callCount).to.be(1);
                expect(discardSpy.calledWith(aCard)).to.be(true);
                expect(lifetokensSpy.callCount).to.be(1);
                expect(lifetokensSpy.calledWith(aCard)).to.be(true);
                done();
            });
        });

        test('should trigger drawCard() if successful', function (done) {
            var cards = [card4, card3, card2, card1];
            var drawStub = sinon.stub(deck, 'drawCard', function (callback) {
                callback(cards.pop());
            });
            var stub = sinon.stub(fireworks, 'play').callsArgWith(1, undefined);
            sut.drawCard(function () {});
            sut.playIndex(0, function (err) {
                expect(err).to.be(undefined);
                expect(stub.calledWith(card1)).to.be(true);
                expect(drawStub.callCount).to.be(2);
                expect(sut.cards[0]).to.be(card2);
                done();
            });
        });
    });

    suite('discardIndex()', function () {
        test('should execute callback with error if invalid index', function (done) {
            sut.discardIndex(0, function (err) {
                expect(err).to.be('Error: invalid index');
                done();
            });
        });

        test('should remove specified card from cards', function (done) {
            var cards = [card4, card3, card2, card1];
            var drawStub = sinon.stub(deck, 'drawCard', function (callback) {
                callback(cards.pop());
            });
            sut.drawCard(function () {});
            expect(sut.cards).to.have.length(1);
            sut.discardIndex(0, function (err) {
                expect(err).to.be(undefined);
                expect(sut.cards).to.have.length(1);
                done();
            });
        });

        test('should remove specified card from cards (in middle)', function (done) {
            var cards = [card4, card3, card2, card1];
            var drawStub = sinon.stub(deck, 'drawCard', function (callback) {
                callback(cards.pop());
            });
            var sendEventSpy = sinon.spy(sut, 'sendEvent');
            sut.drawCard(function () {});
            sut.drawCard(function () {});
            sut.drawCard(function () {});
            expect(sut.cards).to.have.length(3);
            sut.discardIndex(1, function (err) {
                expect(err).to.be(undefined);
                expect(sendEventSpy.calledWith('discardCard', [card2])).to.be(true);
                expect(sut.cards).to.have.length(3);
                expect(sut.cards[0]).to.be(card1);
                expect(sut.cards[1]).to.be(card3);
                expect(sut.cards[2]).to.be(card4);
                done();
            });
        });

        test('should emit cardDiscarded event', function (done) {
            var cards = [card4, card3, card2, card1];
            var drawStub = sinon.stub(deck, 'drawCard', function (callback) {
                callback(cards.pop());
            });
            var sendEventSpy = sinon.spy(sut, 'sendEvent');
            sut.drawCard(function () {});
            sut.discardIndex(0, function (err) {
                expect(err).to.be(undefined);
                expect(sendEventSpy.calledWith('discardCard', [card1])).to.be(true);
                done();
            });
        });

        test('should emit clueRestored event', function (done) {
            var cards = [card4, card3, card2, card1];
            var drawStub = sinon.stub(deck, 'drawCard', function (callback) {
                callback(cards.pop());
            });
            var sendEventSpy = sinon.spy(sut, 'sendEvent');
            sut.drawCard(function () {});
            sut.discardIndex(0, function (err) {
                expect(err).to.be(undefined);
                expect(sendEventSpy.calledWith('restoreClue', [])).to.be(true);
                done();
            });
        });

        test('should trigger drawCard() if successful', function (done) {
            var cards = [card4, card3, card2, card1];
            var drawStub = sinon.stub(deck, 'drawCard', function (callback) {
                callback(cards.pop());
            });
            sut.drawCard(function () {});
            sut.discardIndex(0, function (err) {
                expect(err).to.be(undefined);
                expect(drawStub.callCount).to.be(2);
                expect(sut.cards[0]).to.be(card2);
                done();
            });
        });
    });
});