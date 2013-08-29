var expect = require('expect.js');
var sinon = require('sinon');
var SocketHandler = require('../lib/socket.handlers.js').SocketHandler;
var GameListingProvider = require('../lib/MemoryGameListingProvider.js').GameListingProvider;
var GameListing = require('../lib/GameListing.js').GameListing;

// Methods our Socket mock should define (that we use)
var sock = {
    emit: function (data) {},
    join: function (list) {},
    leave: function (list) {}
};

suite('SocketHandler', function () {
    var sut, mockSocket, mockGameListingProvider, mockGameListingConstructor;

    setup(function () {
        mockSocket = sinon.mock(sock);
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
        suite('collaboration with Socket', function () {
            test('should call join with gamelist', function () {
                mockSocket.expects('join').once().withArgs('gamelist');

                sut.subscribeGameList(null, function () {});

                mockSocket.verify();
            });
        });
    });

    suite('unsubscribeGameList()', function () {
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
            mockGameListingConstructor.withArgs('testName', 2).returns(newGameListing);
        });

        suite('collaboration with GameListingConstructor', function () {
            test('should create new GameListing using injected constructor', function () {

                sut.newGame(data, function () {});

                expect(mockGameListingConstructor.calledWithNew()).to.be.ok();
                expect(mockGameListingConstructor.calledWithExactly('testName', 2)).to.be.ok();
            });
        });
        suite('collaboration with GameListingProvider', function () {
            test('should call save() with new GameListing', function (done) {
                mockGameListingProvider.expects('save').once().withArgs(newGameListing).callsArgWith(1, newGameListing);
                sut.newGame(data, done);

                mockGameListingProvider.verify();
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
