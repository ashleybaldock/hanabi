var expect = require('expect.js');

suite('Array', function() {
    setup(function() {
    });

    suite('#indexOf()', function(){
        test('should return -1 when not present', function(){
            expect([1,2,3].indexOf(4)).to.be(-1);
        });
    });

    teardown(function() {
    });
});
