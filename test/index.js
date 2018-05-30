
const assert = require('chai').assert;
const fns = require('../index');
console.log('getFileNameWithoutExtension', fns.getFileNameWithoutExtension);

describe("miniml", () => {
  it('has a function named getFileNameWithoutExtension', () => {
    const func = fns.getFileNameWithoutExtension;

    assert.exists(func, 'function exists');
  });

  describe('getFileNameWithoutExtension', () => {
    it('returns a file name without extension', () => {
      const func = fns.getFileNameWithoutExtension;
      const given = func('filename.txt');
      const expected = 'filename';
  
      // verify
      assert.equal(given, expected);
    });
  });

  it('has a function named writeHTML', () => {
    const func = fns.writeHTML;

    assert.exists(func, 'function exists');
  });

});