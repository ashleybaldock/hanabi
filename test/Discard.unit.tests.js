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
    });

    suite('constructor', function () {
        test('on construct should set contents', function () {
            expect(sut.getContents()).to.be.empty();
        });
    });

    suite('getContents()', function () {
        test('should see correctly ordered contents after discarding', function () {
            var card1 = new Card('white', 1);
            var card2 = new Card('white', 2);
            sut.discardCard(card1);
            sut.discardCard(card2);
            var contents = sut.getContents();
            expect(contents[0]).to.be(card1);
            expect(contents[1]).to.be(card2);
        });
    });

    suite('discardCard()', function () {
        test('discarded card should have colour and value', function () {
            expect(function () {
                sut.discardCard(null)
            }).to.throwError('Error: card invalid');
            expect(function () {
                sut.discardCard({})
            }).to.throwError('Error: card invalid');
            expect(function () {
                sut.discardCard({value: 1})
            }).to.throwError('Error: card invalid');
            expect(function () {
                sut.discardCard({colour: 'red'})
            }).to.throwError('Error: card invalid');
        });

        test('should add discarded card to contents and send cardDiscarded event', function () {
            var card = new Card('red', 1);
            sut.discardCard(card);

            expect(sut.getContents()[0]).to.be(card);
        });
    });
});
