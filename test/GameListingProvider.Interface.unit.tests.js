var expect = require('expect.js');
var testUtil = require('./Utility.js');

var dbConnectionString = process.env.DBCONNECTIONSTRING;
var GameListing = require('../lib/GameListing.js').GameListing;

var implementations = [
    function () { return new (require('../lib/MemoryGameListingProvider.js').GameListingProvider)() }
    //function () { return new (require('../lib/MongoDBGameListingProvider.js').GameListingProvider)(dbConnectionString) }
];


suite('GameListingProvider.Interface implementations', function () {
    var implementation;
    for (var i = 0; i < implementations.length; i++) {
        implementation = implementations[i];
        suite(testUtil.getFunctionName(implementation), function () {
            var sut;

            setup(function () {
                sut = implementation();
            });

            suite('contract', function () {
                test('should define findAll() method', function() {
                    expect(sut.findAll).to.be.a('function');
                });

                test('findAll() should throw error if callback not a function', function() {
                    expect(function () {
                        sut.findAll(null);
                    }).to.throwException(function (ex) {
                        expect(ex).to.be('callback is not a function!');
                    });
                });

                test('should define findActive() method', function() {
                    expect(sut.findActive).to.be.a('function');
                });

                test('findActive() should throw error if callback not a function', function() {
                    expect(function () {
                        sut.findActive(null);
                    }).to.throwException(function (ex) {
                        expect(ex).to.be('callback is not a function!');
                    });
                });

                test('should define findActiveByClientId() method', function() {
                    expect(sut.findActiveByClientId).to.be.a('function');
                });

                test('findActiveByClientId() should throw error if callback not a function', function() {
                    expect(function () {
                        sut.findActiveByClientId(null);
                    }).to.throwException(function (ex) {
                        expect(ex).to.be('callback is not a function!');
                    });
                });

                test('findActiveByClientId() should execute callback', function (done) {
                    sut.findActiveByClientId(0, function () { done() });
                });

                test('should define save() method', function() {
                    expect(sut.save).to.be.a('function');
                });

                test('save() should throw error if callback not a function', function () {
                    expect(function () {
                        sut.save({}, null);
                    }).to.throwException(function (ex) {
                        expect(ex).to.be('callback is not a function!');
                    });
                });

                test('should define removeById() method', function () {
                    expect(sut.removeById).to.be.a('function');
                });

                test('removeById() should throw error if callback not a function', function () {
                    expect(function () {
                        sut.removeById(0, null);
                    }).to.throwException(function (ex) {
                        expect(ex).to.be('callback is not a function!');
                    });
                });

                test('removeById() should execute callback', function (done) {
                    sut.removeById(0, done);
                });
            });

            suite('persist tests', function () {
                test('removeById() should remove previously created item', function (done) {
                    sut.save(new GameListing('test1', 2), function (newListing) {
                        expect(newListing.id).to.be(0);
                        sut.findAll(function (result) {
                            expect(result.length).to.be(1);
                            sut.removeById(newListing.id, function (removedListing) {
                                sut.findAll(function (result) {
                                    expect(result.length).to.be(0);
                                    done();
                                });
                            });
                        });
                    });
                });
            });
        });
    }
});
