var expect = require('expect.js');
var sinon = require('sinon');
var SocketHandler = require('../lib/socket.handlers.js').SocketHandler;

// Methods our Socket mock should define (that we use)
var sock = {
    emit: function (data) {},
    join: function (list) {},
    leave: function (list) {}
};

suite('SocketHandler', function () {
    var sut, mockSocket;

    setup(function () {
        mockSocket = sinon.mock(sock);
        sut = new SocketHandler(mockSocket.object);
    });

    suite('contract', function () {
        test('should define newGame() method', function () {
            expect(sut.newGame).to.be.a('function');
        });

        test('should define listGames() method', function () {
            expect(sut.listGames).to.be.a('function');
        });
    });

    suite('collaboration with Socket', function () {
        test('newGame() should call emit once', function() {
            mockSocket.expects('emit').once().withArgs('blah');

            sut.newGame({
                name: 'testGame',
                password: 'testPassword',
                playerCount: 2
            }, function () {});

            mockSocket.verify();
        });
    });
});
