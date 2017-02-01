var chai = require('chai');
var assert = chai.assert;
// var ros3d = require('../../build/ros3d.js');

describe('Array', function() {
  describe('#indexOf()', function() {
    it('should return -1 when the value is not present', function() {
      assert.equal(0, [1,2,3].indexOf(1));
    });
  });
});
