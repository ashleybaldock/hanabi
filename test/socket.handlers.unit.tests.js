var expect = require('expect.js');
var sinon = require('sinon');
var SocketHandler = require('../lib/socket.handlers.js').SocketHandler;
var GameListingProvider = require('../lib/MemoryGameListingProvider.js').GameListingProvider;
var GameListing = require('../lib/GameListing.js').GameListing;

// Methods our Socket mock should define (that we use)
var sock = {
    emit: function (data) {},
    join: function (list) {},
    leave: function (list) {},
    to: function (list) {},
    emit: function (ev, data) {},
    flags: {
        broadcast: false
    }
};
sock.__defineGetter__('broadcast', function () {
    return this;
});

suite('SocketHandler', function () {
    var sut, mockSocket, mockGameListingProvider, mockGameListingConstructor;

    setup(function () {
        mockSocket = sinon.mock(sock);
        mockSocket.object.__defineGetter__('broadcast', function () { this.flags.broadcast = true; return this; });
        mockGameListingProvider = sinon.mock(new GameListingProvider());
        mockGameListingConstructor = sinon.stub();
        sut = new SocketHandler(mockSocket.object, mockGameListingProvider.object, mockGameListingConstructor);
    });

    suite('contract', function () {
        test('should define newGame() method', function () {
            expect(sut.newGame).to.be.a('function');
        });

        test('should define listGames() method', function () {
            expect(sut.listGames).to.be.a('function');
        });

        test('should define subscribeGameList() method', function () {
            expect(sut.subscribeGameList).to.be.a('function');
        });

        test('should define unsubscribeGameList() method', function () {
            expect(sut.unsubscribeGameList).to.be.a('function');
        });
    });

    suite('constructor', function () {
        test('should set own property socket to injected object', function () {
            expect(sut.socket).to.be(mockSocket.object);
        });

        test('should set own property gameListingProvider to injected object', function () {
            expect(sut.gameListingProvider).to.be(mockGameListingProvider.object);
        });

        test('should set own property GameListingConstructor to injected object', function () {
            expect(sut.GameListingConstructor).to.be(mockGameListingConstructor);
        });
    });

    suite('subscribeGameList()', function () {
        test('should execute callback', function (done) {
            sut.subscribeGameList(null, done);
        });

        suite('collaboration with Socket', function () {
            test('should call join with gamelist', function () {
                mockSocket.expects('join').once().withArgs('gamelist');

                sut.subscribeGameList(null, function () {});

                mockSocket.verify();
            });
        });
    });

    suite('unsubscribeGameList()', function () {
        test('should execute callback', function (done) {
            sut.unsubscribeGameList(null, done);
        });

        suite('collaboration with Socket', function () {
            test('should call leave with gamelist', function () {
                mockSocket.expects('leave').once().withArgs('gamelist');

                sut.unsubscribeGameList(null, function () {});

                mockSocket.verify();
            });
        });
    });

    suite('newGame()', function () {
        var newGameListing = new GameListing('testName', 2);
        var data = {name: 'testName', playerCount: 2};

        setup(function () {
            mockSocket.expects('to').once().withArgs('gamelist').returns(mockSocket.object);
            mockSocket.expects('emit').once().withArgs('newGameCreated', newGameListing);
            mockGameListingProvider.expects('save').once().withArgs(newGameListing).callsArgWith(1, newGameListing);
            mockGameListingConstructor.withArgs('testName', 2).returns(newGameListing);
        });

        suite('collaboration', function () {
            test('should create new GameListing using injected constructor', function () {
                sut.newGame(data, function () {});

                expect(mockGameListingConstructor.calledWithNew()).to.be.ok();
                expect(mockGameListingConstructor.calledWithExactly('testName', 2)).to.be.ok();

                mockGameListingProvider.restore();
                mockSocket.restore();
            });
            test('should call save() on created GameListing', function (done) {
                sut.newGame(data, done);

                mockGameListingProvider.verify();
                mockSocket.restore();
            });
            test('should call broadcast.to().emit() on injected socket', function (done) {
                sut.newGame(data, done);

                mockGameListingProvider.restore();
                mockSocket.verify();
                expect(mockSocket.object.flags.broadcast).to.be(true);
            });
        });
    });

    suite('listGames()', function () {
        suite('collaboration with GameListingProvider', function () {
            test('should execute callback with games from provider', function (done) {
                var expectedResult = new GameListing('testing', 2);
                var check = function (result) {
                    expect(result).to.be(expectedResult);
                    done();
                };
                mockGameListingProvider.expects('findActive').once().withArgs(check).callsArgWith(0, expectedResult);
                sut.listGames(null, check);

                mockGameListingProvider.verify();
            });
        });
    });

});
