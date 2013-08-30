var expect = require('expect.js');
var io = require('socket.io-client');

var socketURL = 'http://localhost:3001';

var options = {
    transports: ['websocket'],
    'force new connection': true
};

suite('server.js', function() {
    var sut;

    setup(function() {
        process.env['PORT'] = '3001';
        sut = require('../server.js').server;
    });

    suite('contract', function() {
        var client1, client2, client3;

        setup(function() {
            client1 = io.connect(socketURL, options);
        });

        test('should be able to call newGame', function(done) {
            client1.emit('newGame', {
                name: 'testGame',
                password: 'testPassword',
                playerCount: 2
            }, done);
        });

        test('newGame should require object', function(done) {
            client1.emit('newGame', null, function (err) {
                expect(err).to.be("Invalid data");
                done()
            });
        });

        test('newGame should require object with name', function(done) {
            client1.emit('newGame', {playerCount: 0}, function (err) {
                expect(err).to.be("Invalid data - missing name");
                done();
            });
        });

        test('newGame should require object with non-empty name', function(done) {
            client1.emit('newGame', {name: '', playerCount: 0}, function (err) {
                expect(err).to.be("Invalid data - missing name");
                done();
            });
        });

        test('newGame should require object with playerCount', function(done) {
            client1.emit('newGame', {name: 'test'}, function (err) {
                expect(err).to.be("Invalid data - missing playerCount");
                done();
            });
        });

        test('should be able to call listGames', function(done) {
            client1.emit('listGames', null, done);
        });
    });

    suite('newGame', function () {
        var client1, client2, client3;

        setup(function () {
            client1 = io.connect(socketURL, options);
            client2 = io.connect(socketURL, options);
        });

        teardown(function () {
            client1.disconnect();
            client2.disconnect();
        });

        test('should cause client subscribed to game listing notifications to receive newGameCreated event', function (done) {
            client2.on('newGameCreated', function (data) {
                console.log('success done');
                expect(data.name).to.be('testGame');
                expect(data.playerCount).to.be(2);
                done();
            });
            client2.emit('subscribeGameList', null, function (err) {
                expect(err).to.be(undefined);
                client1.emit('newGame', {
                    name: 'testGame',
                    playerCount: 2
                }, function (err2) {
                    expect(err2).to.be(undefined);
                });
            });
        });

        test.skip('should create new game which can be retrieved using listGames', function(done) {
            client1.emit('newGame', {
                name: 'testGame',
                playerCount: 2
            }, function (err) {
                client1.emit('listGames', null, function (data) {
                    expect(data).to.be.an('array');
                    expect(data.length).to.be(1);
                    expect(data[0].name).to.be('testGame');
                    expect(data[0].playerCount).to.be(2);
                    done();
                });
            });
        });
    });
});
