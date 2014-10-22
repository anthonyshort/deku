var assert = require('component/assert@0.4.0');
var dom = require('../index.js');

describe('dom', function(){
  var node;

  beforeEach(function(){
    node = dom();
  });

  it('should create divs by default', function(){
    assert(node.owner.tagName === 'div');
  });

  it('should set the type', function(){
    assert(dom('span').owner.tagName === 'span');
  });

  it('should set attributes', function(){
    var node = dom('div', {
      name: 'Foo'
    });
    assert.equal(
      node.owner.attributes['name'],
      'Foo'
    );
  });
});
