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
            client1.emit('newGame', {password: '', playerCount: 0}, function (err) {
                expect(err).to.be("Invalid data");
                done();
            });
        });

        test('newGame should require object with password', function(done) {
            client1.emit('newGame', {name: '', playerCount: 0}, function (err) {
                expect(err).to.be("Invalid data");
                done();
            });
        });

        test('newGame should require object with playerCount', function(done) {
            client1.emit('newGame', {name: '', password: ''}, function (err) {
                expect(err).to.be("Invalid data");
                done();
            });
        });

        test('should be able to call listGames', function(done) {
            client1.emit('listGames', null, done);
        });
    });

    suite.skip('newGame', function () {
        var client1, client2, client3;

        setup(function() {
            client1 = io.connect(socketURL, options);
        });

        test('should create new game which can be retrieved using listGames', function(done) {
            client1.emit('newGame', {
                name: 'testGame',
                password: 'testPassword',
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
