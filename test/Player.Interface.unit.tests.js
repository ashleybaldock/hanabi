var expect = require('expect.js');
var sinon = require('sinon');
var testUtil = require('./Utility.js');

// All classes that should implement this interface defined here
var implementations = [
    function () { return new (require('../lib/PlayerInterface.js').PlayerInterface)(); }
];

suite('Player.Interface implementations', function () {
    var implementation;
    for (var i = 0; i < implementations.length; i++) {
        implementation = implementations[i];
        suite(testUtil.getFunctionName(implementation), function () {
            var sut;
            var eventName = 'testEvent';
            var invalidEventName = 'invalidEvent';

            setup(function () {
                sut = implementation();
            });
        });
    }
});

