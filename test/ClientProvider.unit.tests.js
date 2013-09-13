var expect = require('expect.js');

var MemoryClientProvider = require('../lib/MemoryClientProvider.js').ClientProvider;
var dbConnectionString = process.env.DBCONNECTIONSTRING;
var Client = require('../lib/Client.js').Client;

var sut;

var contract_tests = function (done) {
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

    test('should define findById() method', function() {
        expect(sut.findById).to.be.a('function');
    });

    test('findById() should throw error if callback not a function', function() {
        expect(function () {
            sut.findById(null);
        }).to.throwException(function (ex) {
            expect(ex).to.be('callback is not a function!');
        });
    });

    test('findById() should execute callback', function (done) {
        sut.findById('0', done);
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
            sut.removeById('0', null);
        }).to.throwException(function (ex) {
            expect(ex).to.be('callback is not a function!');
        });
    });

    test('removeById() should execute callback', function (done) {
        sut.removeById('0', done);
    });
};

var persist_tests = function (done) {
    test('removeById() should remove previously created item', function (done) {
        sut.save(new Client(), function (newListing) {
            expect(newListing.id).to.be('0');
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
};

suite('MemoryClientProvider', function() {

    setup(function() {
        sut = new MemoryClientProvider();
    });

    suite('contract', contract_tests);

    suite('persist tests', persist_tests);
});

