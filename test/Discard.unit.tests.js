var expect = require('expect.js');
var sinon = require('sinon');

var Discard = require('../lib/Discard.js').Discard;
var Card = require('../lib/Card.js').Card;

suite('Deck', function () {
    var sut;

    setup(function () {
        sut = new Discard();
    });

    suite('contract', function () {
        test('should define getContents() method', function () {
            expect(sut.getContents).to.be.a('function');
        });

        test('should define discardCard() method', function () {
            expect(sut.discardCard).to.be.a('function');
        });

        test('should define events', function () {
            expect(sut.events).to.have.key('cardDiscarded');
        });
    });

    suite('constructor', function () {
        test('on construct should set contents', function () {
            sut.getContents(function (cards) {
                expect(cards).to.be.empty();
            });
        });
    });

    suite('getContents()', function () {
        test('should throw error if callback not a function', function () {
            expect(function () {
                sut.getContents();
            }).to.throwException('error: missing callback');
        });

        test('should return current contents', function (done) {
            sut.getContents(function (contents) {
                expect(contents).to.be.empty();
                done();
            });
        });

        test('should see correctly ordered contents after discarding', function (done) {
            var card1 = new Card('white', 1);
            var card2 = new Card('white', 2);
            sut.discardCard(card1, function () {
                sut.discardCard(card2, function () {
                    sut.getContents(function (contents) {
                        expect(contents[0]).to.be(card1);
                        expect(contents[1]).to.be(card2);
                        done();
                    });
                });
            });
        });
    });

    suite('discardCard()', function () {
        test('should throw error if callback not a function', function () {
            expect(function () {
                sut.discardCard();
            }).to.throwException('error: missing callback');
        });

        test('discarded card should have colour and value', function (done) {
            sut.discardCard(null, function (err) {
                expect(err).to.be('Error: card invalid');
                sut.discardCard({}, function (err) {
                    expect(err).to.be('Error: card invalid');
                    sut.discardCard({value: 1}, function (err) {
                        expect(err).to.be('Error: card invalid');
                        sut.discardCard({colour: 'red'}, function (err) {
                            expect(err).to.be('Error: card invalid');
                            done();
                        });
                    });
                });
            });
        });

        test('should add discarded card to contents and send cardDiscarded event', function (done) {
            var card = new Card('red', 1);
            var callback = sinon.spy();
            var context = new Object();
            sut.registerForEvent('cardDiscarded', callback, context);
            sut.discardCard(card, function (err) {
                expect(err).to.be(undefined);
                expect(callback.calledOn(context)).to.be(true);
                expect(callback.calledWithExactly(card)).to.be(true);
                sut.getContents(function (cards) {
                    expect(cards[0]).to.be(card);
                    done();
                });
            });
        });
    });
});
