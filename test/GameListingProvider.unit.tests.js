var expect = require('expect.js');

var memoryGameListingProvider = require('../lib/MemoryGameListingProvider.js');
var mongoDBGameListingProvider = require('../lib/MongoDBGameListingProvider.js');

var sut;

var contract_tests = function (done) {
    test('should define findAll() method', function() {
        expect(sut.findAll).to.be.a('function');
    });

    test('should define findById() method', function() {
        expect(sut.findById).to.be.a('function');
    });

    test('should define save() method', function() {
        expect(sut.save).to.be.a('function');
    });

    test('should define removeById() method', function() {
        expect(sut.removeById).to.be.a('function');
    });
};

suite('MemoryGameListingProvider', function() {

    setup(function() {
        sut = new memoryGameListingProvider.GameListingProvider();
    });

    suite('contract', contract_tests);
});

suite.skip('MongoDBGameListingProvider', function() {

    setup(function() {
        sut = new mongoDBGameListingProvider.GameListingProvider("");
    });

    suite('contract', contract_tests);
});
