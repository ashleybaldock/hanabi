var expect = require('expect.js');
var sinon = require('sinon');

var Hand = require('../lib/Hand.js').Hand;
var Deck = require('../lib/Deck.js').Deck;
var Card = require('../lib/Card.js').Card;
var Fireworks = require('../lib/Fireworks.js').Fireworks;
var Firework = require('../lib/Firework.js').Firework;
var Discard = require('../lib/Discard.js').Discard;
var LifeTokens = require('../lib/LifeTokens.js').LifeTokens;
var ClueTokens = require('../lib/ClueTokens.js').ClueTokens;

suite('Hand', function () {
    var sut, deck, fireworks, index,
        cluetokens, cluetokensStub,
        discard, discardSpy,
        lifetokens, lifetokensSpy,
        card1, card2, card3, card4;
    var cardCount = 4;

    setup(function () {
        index = 0;
        card1 = new Card('red', 1);
        card2 = new Card('red', 2);
        card3 = new Card('red', 3);
        card4 = new Card('red', 4);

        deck = new Deck();

        discard = new Discard();
        discardSpy = new sinon.spy(discard, 'discardCard');

        cluetokens = new ClueTokens();
        cluetokensStub = new sinon.stub(cluetokens, 'useClue');

        lifetokens = new LifeTokens(3);
        lifetokensSpy = new sinon.spy(lifetokens, 'loseLife');

        fireworks = new Fireworks(Firework, lifetokens, discard);
        sut = new Hand(index, cardCount, deck, fireworks, cluetokens);
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

        test('should define giveClue() method', function () {
            expect(sut.giveClue).to.be.a('function');
        });

        test('should define receiveClue() method', function () {
            expect(sut.receiveClue).to.be.a('function');
        });

        test('should define checkClueValidity() method', function () {
            expect(sut.checkClueValidity).to.be.a('function');
        });

        test('should define getClueMask() method', function () {
            expect(sut.getClueMask).to.be.a('function');
        });

        test('should define events', function () {
            expect(sut.events).to.contain('cardDrawn');
            expect(sut.events).to.contain('discardCard');
            expect(sut.events).to.contain('cardDiscarded');
            expect(sut.events).to.contain('restoreClue');
            expect(sut.events).to.contain('turnComplete');
            expect(sut.events).to.contain('giveClue');
            expect(sut.events).to.contain('clueReceived');
            expect(sut.events).to.contain('cardPlayed');
        });
    });

    suite('constructor', function () {
        test('should set properties', function () {
            expect(sut.deck()).to.be(deck);
            expect(sut.fireworks()).to.be(fireworks);
            expect(sut.cluetokens()).to.be(cluetokens);
            expect(sut.cards).to.have.length(0);
            expect(sut.size).to.be(cardCount);
            expect(sut.index).to.be(index);
        });
    });

    suite('checkClueValidity()', function () {
        test('should return true if any card colour or value matches clue', function () {
            sut.cards = [new Card('red', 1), new Card('blue', 3),
                         new Card('green', 4), new Card('white', 4)];
            expect(sut.checkClueValidity('red')).to.be(true);
            expect(sut.checkClueValidity('blue')).to.be(true);
            expect(sut.checkClueValidity('white')).to.be(true);
            expect(sut.checkClueValidity(1)).to.be(true);
            expect(sut.checkClueValidity(4)).to.be(true);
        });

        test('should return false if no card colour or value matches clue', function () {
            sut.cards = [new Card('red', 1), new Card('blue', 3),
                         new Card('green', 4), new Card('white', 4)];
            expect(sut.checkClueValidity('yellow')).to.be(false);
            expect(sut.checkClueValidity(undefined)).to.be(false);
            expect(sut.checkClueValidity(null)).to.be(false);
            expect(sut.checkClueValidity([])).to.be(false);
            expect(sut.checkClueValidity({})).to.be(false);
            expect(sut.checkClueValidity(0)).to.be(false);
            expect(sut.checkClueValidity(2)).to.be(false);
            expect(sut.checkClueValidity(5)).to.be(false);
        });
    });

    suite('getClueMask()', function () {
        test('should return array representing cards which conform to clue', function () {
            sut.cards = [new Card('red', 1), new Card('blue', 3),
                         new Card('green', 4), new Card('white', 4)];
            expect(sut.getClueMask('red')).to.eql([
                {colour: 'red', value: null},
                {colour: null, value: null},
                {colour: null, value: null},
                {colour: null, value: null}]);
            expect(sut.getClueMask('blue')).to.eql([
                {colour: null, value: null},
                {colour: 'blue', value: null},
                {colour: null, value: null},
                {colour: null, value: null}]);
            expect(sut.getClueMask(4)).to.eql([
                {colour: null, value: null},
                {colour: null, value: null},
                {colour: null, value: 4},
                {colour: null, value: 4}]);
        });
    });

    suite('receiveClue()', function () {
        test('should check clue validity and execute callback with error if invalid', function () {
            var spy = sinon.spy();
            var stub = sinon.stub(sut, 'checkClueValidity').returns(false);

            sut.receiveClue(1, 1, 'red', spy);

            expect(stub.calledWith('red')).to.be(true);
            expect(spy.calledWith('Error: clue invalid')).to.be(true);
        });

        test('should try to call useClue() on cluetokens, executing callback with error if this fails', function () {
            var spy = sinon.spy();
            var stub = sinon.stub(sut, 'checkClueValidity').returns(true);
            cluetokensStub.callsArgWith(0, 'Error: No clues remain');

            sut.receiveClue(1, 1, 'red', spy);

            expect(cluetokensStub.callCount).to.be(1);
            expect(spy.calledWith('Error: No clues remain')).to.be(true);
        });

        test('should emit clueReceived event and execute callback on success', function () {
            var callback = sinon.spy();
            var context = new Object();
            sut.registerForEvent('clueReceived', callback, context);

            var spy = sinon.spy();
            var stub = sinon.stub(sut, 'checkClueValidity').returns(true);
            cluetokensStub.callsArg(0);
            var clueMask = [
                {colour: null, value: null},
                {colour: null, value: null},
                {colour: null, value: 4},
                {colour: null, value: 4}];
            
            var getClueMaskStub = sinon.stub(sut, 'getClueMask').returns(clueMask);

            sut.receiveClue(1, 1, 'red', spy);

            expect(cluetokensStub.callCount).to.be(1);
            expect(getClueMaskStub.calledWith('red')).to.be(true);
            expect(spy.calledWith()).to.be(true);;
            expect(callback.calledOn(context)).to.be(true);
            expect(callback.calledWith(1, 1, clueMask)).to.be(true);
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
                expect(callback.calledWithExactly(index, 0, card)).to.be(true);
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

        test('should execute callback with error if play unsuccessful', function (done) {
            var aCard = new Card('red', 2);
            var drawStub = sinon.stub(deck, 'drawCard').callsArgWith(0, aCard);
            var playStub = sinon.stub(fireworks, 'play').callsArgWith(1, 'Error: Invalid play');
            sut.drawCard(function () {});
            sut.playIndex(0, function (err) {
                expect(err).to.be('Error: Invalid play');
                done();
            });
        });

        test('should emit cardPlayed event if successful', function (done) {
            var cardIndex = 0;
            var cards = [card4, card3, card2, card1];
            var drawStub = sinon.stub(deck, 'drawCard', function (callback) {
                callback(cards.pop());
            });
            var stub = sinon.stub(fireworks, 'play').callsArgWith(1, undefined);
            var sendEventSpy = sinon.spy(sut, 'sendEvent');
            var callback = sinon.spy();
            var context = new Object();
            sut.registerForEvent('cardPlayed', callback, context);
            sut.drawCard(function () {});
            sut.playIndex(cardIndex, function (err) {
                expect(sendEventSpy.calledWith('cardPlayed')).to.be(true);
                expect(callback.calledWith(index, cardIndex, card1)).to.be(true);
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

        test('should send turnComplete event on success', function (done) {
            var cards = [card4, card3, card2, card1];
            var drawStub = sinon.stub(deck, 'drawCard', function (callback) {
                callback(cards.pop());
            });
            var stub = sinon.stub(fireworks, 'play').callsArgWith(1, undefined);
            var sendEventSpy = sinon.spy(sut, 'sendEvent');
            sut.drawCard(function () {});
            sut.playIndex(0, function (err) {
                expect(sendEventSpy.calledWith('turnComplete', [])).to.be(true);
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
                expect(sendEventSpy.calledWith('cardDiscarded', [index, 0, card1])).to.be(true);
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

        test('should emit turnComplete event', function (done) {
            var cards = [card4, card3, card2, card1];
            var drawStub = sinon.stub(deck, 'drawCard', function (callback) {
                callback(cards.pop());
            });
            var sendEventSpy = sinon.spy(sut, 'sendEvent');
            sut.drawCard(function () {});
            sut.discardIndex(0, function (err) {
                expect(err).to.be(undefined);
                expect(sendEventSpy.calledWith('turnComplete', [])).to.be(true);
                done();
            });
        });
    });

    suite('giveCard()', function () {
        test('should emit giveClue event with index and callback', function () {
            var cards = [card4, card3, card2, card1];
            var drawStub = sinon.stub(deck, 'drawCard', function (callback) {
                callback(cards.pop());
            });
            var sendEventSpy = sinon.spy(sut, 'sendEvent');
            sut.drawCard(function () {});
            var func = function () {};

            sut.giveClue(0, 'red', func);
            expect(sendEventSpy.calledWith('giveClue', [index, 0, 'red', func])).to.be(true);
        });
    });
});
