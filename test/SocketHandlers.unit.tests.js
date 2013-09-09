var expect = require('expect.js');
var sinon = require('sinon');
var SocketHandler = require('../lib/SocketHandler.js').SocketHandler;
var GameProvider = require('../lib/MemoryGameProvider.js').GameProvider;
var ClientProvider = require('../lib/MemoryClientProvider.js').ClientProvider;
var Game = require('../lib/Game.js').Game;
var Client = require('../lib/Client.js').Client;

// Methods our Socket mock should define (that we use)
var sock = {
    emit: function (data) {},
    join: function (list) {},
    leave: function (list) {},
    to: function (list) {},
    emit: function (ev, data) {},
    flags: {
        broadcast: false
    },
    set: function () {},
    get: function () {}
};
sock.__defineGetter__('broadcast', function () {
    return this;
});

suite('SocketHandler', function () {
    var sut
      , mockSocket
      , mockGameProvider
      , mockGameConstructor
      , mockClientProvider
      , mockClientConstructor;

    setup(function () {
        mockSocket = sinon.mock(sock);
        mockSocket.object.__defineGetter__('broadcast', function () { this.flags.broadcast = true; return this; });
        mockGameProvider = sinon.mock(new GameProvider());
        mockClientProvider = sinon.mock(new ClientProvider());
        mockGameConstructor = sinon.stub();
        mockClientConstructor = sinon.stub();
        sut = new SocketHandler(mockSocket.object, mockGameProvider.object, mockGameConstructor, mockClientProvider.object, mockClientConstructor);
    });

    suite('contract', function () {
        test('should define newGame() method', function () {
            expect(sut.newGame).to.be.a('function');
        });

        test('newGame should require object', function (done) {
            sut.newGame(null, function (err) {
                expect(err).to.be("Invalid data");
                done()
            });
        });

        test('newGame should require object with name', function(done) {
            sut.newGame({playerCount: 0}, function (err) {
                expect(err).to.be("Invalid data - missing name");
                done();
            });
        });

        test('newGame should require object with non-empty name', function(done) {
            sut.newGame({name: '', playerCount: 0}, function (err) {
                expect(err).to.be("Invalid data - missing name");
                done();
            });
        });

        test('newGame should require object with playerCount', function(done) {
            sut.newGame({name: 'test'}, function (err) {
                expect(err).to.be("Invalid data - missing playerCount");
                done();
            });
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

        test('should define routeClient() method', function () {
            expect(sut.routeClient).to.be.a('function');
        });

        test('routeClient should require object', function (done) {
            sut.routeClient(null, function (err) {
                expect(err).to.be("Invalid data - not an object");
                done()
            });
        });

        test('routeClient should require object with id', function(done) {
            sut.routeClient({}, function (err) {
                expect(err).to.be("Invalid data - missing id");
                done();
            });
        });

        test('should define setClientName() method', function () {
            expect(sut.setClientName).to.be.a('function');
        });

        test('should define joinGame() method', function () {
            expect(sut.joinGame).to.be.a('function');
        });

        test('joinGame should require object', function (done) {
            sut.joinGame(null, function (err) {
                expect(err).to.be('Invalid data - not an object');
                done()
            });
        });

        test('joinGame should require object with id', function(done) {
            sut.joinGame({}, function (err) {
                expect(err).to.be("Invalid data - missing id");
                done();
            });
        });
    });

    suite('constructor', function () {
        test('should set own property socket to injected object', function () {
            expect(sut.socket).to.be(mockSocket.object);
        });

        test('should set own property gameProvider to injected object', function () {
            expect(sut.gameProvider).to.be(mockGameProvider.object);
        });

        test('should set own property GameConstructor to injected object', function () {
            expect(sut.GameConstructor).to.be(mockGameConstructor);
        });

        test('should set own property clientProvider to injected object', function () {
            expect(sut.clientProvider).to.be(mockClientProvider.object);
        });

        test('should set own property ClientConstructor to injected object', function () {
            expect(sut.ClientConstructor).to.be(mockClientConstructor);
        });
    });

    suite('subscribeGameList()', function () {
        test('should execute callback function', function (done) {
            sut.subscribeGameList(null, done);
        });

        test('should skip callback if not function', function () {
            sut.subscribeGameList(null, null);
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

        test('should skip callback if not function', function () {
            sut.unsubscribeGameList(null, null);
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
        var newGame = new Game('testName', 2);
        var persistedGame = new Game('testName', 2);
        persistedGame.id = 0;
        var data = {name: 'testName', playerCount: 2};

        teardown(function () {
            mockGameProvider.restore();
            mockSocket.restore();
        });

        test('should throw exception if callback not set', function () {
            expect(function () {
                sut.newGame(null, null);
            }).to.throwException('Callback mandatory for newGame call');
        });

        suite('collaboration', function () {
            test('should create and persist new Game and inform clients via emit and callback', function (done) {
                mockSocket.expects('to').once().withArgs('gamelist').returns(mockSocket.object);
                mockSocket.expects('emit').once().withArgs('newGameCreated', persistedGame);
                mockGameProvider.expects('save').once().withArgs(newGame).callsArgWith(1, persistedGame);
                mockGameConstructor.withArgs('testName', 2).returns(newGame);

                sut.newGame(data, function (result) {
                    expect(result).to.be.an('object');
                    expect(mockGameConstructor.calledWithNew()).to.be.ok();
                    expect(mockGameConstructor.calledWithExactly('testName', 2)).to.be.ok();

                    mockGameProvider.verify();
                    mockSocket.verify();
                    expect(mockSocket.object.flags.broadcast).to.be(true);

                    done();
                });
            });
        });
    });

    suite('listGames()', function () {
        test('should execute callback', function (done) {
            sut.listGames(null, function () { done() });
        });

        suite('collaboration with GameProvider', function () {
            test('should execute callback with games from provider', function (done) {
                var expectedResult = new Game('testing', 2);
                var check = function (result) {
                    expect(result).to.be(expectedResult);
                    done();
                };
                mockGameProvider.expects('findActive').once().withArgs(check).callsArgWith(0, expectedResult);
                sut.listGames(null, check);

                mockGameProvider.verify();
            });
        });
    });

    suite('routeClient()', function () {
        test('should execute callback', function (done) {
            sut.routeClient(null, function () { done() });
        });

        suite('collaboration', function () {
            var testId = 1;
            var activeGameId = 1;
            var newClient = new Client();
            var existingClient = new Client();
            existingClient.id = testId;
            var activeGame = new Game('testGame', 2);
            activeGame.id = activeGameId;
            activeGame.players[1] = existingClient.id;
            activeGame.state = 'playing';

            teardown(function () {
                mockClientProvider.restore();
                mockSocket.restore();
            });

            test('client id not found (null)', function (done) {
                mockClientProvider.expects('findById').once().withArgs(null).callsArgWith(1, undefined);
                mockClientConstructor.returns(newClient);
                mockClientProvider.expects('save').once().withArgs(newClient).callsArgWith(1, {id: testId});
                mockSocket.expects('emit').once().withArgs('setClientId', testId);
                mockSocket.expects('emit').once().withArgs('gotoSplash', null);
                mockSocket.expects('set').once().withArgs('clientId', testId).callsArg(2);;

                sut.routeClient({id: null}, function () {
                    expect(mockClientConstructor.calledWithNew()).to.be.ok();
                    expect(mockClientConstructor.calledWithExactly()).to.be.ok();

                    mockClientProvider.verify();
                    mockSocket.verify();
                    done();
                });
            });

            test('client id not found (invalid)', function (done) {
                mockClientProvider.expects('findById').once().withArgs(testId).callsArgWith(1, undefined);
                mockClientConstructor.returns(newClient);
                mockClientProvider.expects('save').once().withArgs(newClient).callsArgWith(1, {id: testId});
                mockSocket.expects('emit').once().withArgs('setClientId', testId);
                mockSocket.expects('emit').once().withArgs('gotoSplash', null);
                mockSocket.expects('set').once().withArgs('clientId', testId).callsArg(2);;

                sut.routeClient({id: testId}, function () {
                    expect(mockClientConstructor.calledWithNew()).to.be.ok();
                    expect(mockClientConstructor.calledWithExactly()).to.be.ok();

                    mockClientProvider.verify();
                    mockSocket.verify();
                    done();
                });
            });

            test('client id found, no active game associated', function (done) {
                mockClientProvider.expects('findById').once().withArgs(testId).callsArgWith(1, existingClient);
                mockGameProvider.expects('findActiveByClientId').once().withArgs(testId).callsArgWith(1, []);
                mockSocket.expects('emit').once().withArgs('gotoSplash', null);
                mockSocket.expects('set').once().withArgs('clientId', testId).callsArg(2);;

                sut.routeClient({id: testId}, function () {
                    mockClientProvider.verify();
                    mockGameProvider.verify();
                    mockSocket.verify();
                    done();
                });
            });

            test('client id found, active game associated', function (done) {
                mockClientProvider.expects('findById').once().withArgs(testId).callsArgWith(1, existingClient);
                mockGameProvider.expects('findActiveByClientId').once().withArgs(testId).callsArgWith(1, [activeGame]);
                mockSocket.expects('emit').once().withArgs('gotoGame', activeGame.id);
                mockSocket.expects('set').once().withArgs('clientId', testId).callsArg(2);;

                sut.routeClient({id: testId}, function () {
                    mockClientProvider.verify();
                    mockGameProvider.verify();
                    mockSocket.verify();
                    done();
                });
            });

            test('client id found, multiple active games associated', function (done) {
                // This should never happen, but what is the expected behaviour if it does?
                mockClientProvider.expects('findById').once().withArgs(testId).callsArgWith(1, existingClient);
                mockGameProvider.expects('findActiveByClientId').once().withArgs(testId).callsArgWith(1, [activeGame, activeGame]);

                mockSocket.expects('set').once().withArgs('clientId', testId).callsArg(2);;

                sut.routeClient({id: testId}, function (err) {
                    expect(err).to.be('Error: Multiple active games associated with client id!');
                    mockClientProvider.verify();
                    mockGameProvider.verify();
                    mockSocket.verify();
                    done();
                });

            });
        });
    });

    suite('setClientName()', function () {
        test('should execute callback', function (done) {
            sut.setClientName(null, function () { done() });
        });

        test('should skip callback if not function', function () {
            sut.setClientName(null, null);
        });

        suite('collaboration', function () {
            var testId = 1;
            var updatedClient = new Client();
            updatedClient.id = testId;
            updatedClient.name = 'new name';
            var existingClient = new Client();
            existingClient.id = testId;

            test('client id not found', function (done) {
                mockClientProvider.expects('findById').once().withArgs(testId).callsArgWith(1, undefined);
                sut.setClientName(updatedClient, function (err) {
                    mockClientProvider.verify();
                    expect(err).to.be('Failed: clientId not found');
                    done();
                });
            });

            test('client id found', function (done) {
                mockClientProvider.expects('findById').once().withArgs(testId).callsArgWith(1, existingClient);
                mockClientProvider.expects('save').once().withArgs(updatedClient).callsArgWith(1, updatedClient);
                sut.setClientName(updatedClient, function (err) {
                    mockClientProvider.verify();
                    expect(err).to.be(undefined);
                    done();
                });
            });
        });
    });

    suite('joinGame()', function () {

        suite('collaboration', function () {
            var testId = 1;
            var activeGameId = 1;
            var newClient = new Client();
            var existingClient = new Client();
            existingClient.id = testId;
            var activeGame = new Game('testGame', 2);
            activeGame.id = activeGameId;
            activeGame.players[1] = existingClient.id;
            activeGame.state = 'playing';

            test('client id not set on socket', function (done) {
                mockSocket.expects('get').once().withArgs('clientId').callsArgWith(1, null, testId);

                sut.joinGame({id: testId}, function () {
                    mockSocket.verify();
                    done();
                });
            });
        });
    });
});
