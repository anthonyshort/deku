var assert = require('component/assert@0.4.0');
var dom = require('../index.js');

describe('dom', function(){
  // it('should create divs by default', function(){
  //   assert(dom().owner.tagName === 'div');
  // });

  it('should set the type', function(){
    assert(dom('span').tagName === 'span');
  });

  it('should set attributes', function(){
    var node = dom('div', {
      name: 'Foo'
    });
    assert.equal(
      node.attributes['name'],
      'Foo'
    );
  });
});
