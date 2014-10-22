var assert = require('component/assert@0.4.0');
var dom = require('../index.js');

describe('dom', function(){
  var node;

  beforeEach(function(){
    node = dom();
  });

  it('should create divs by default', function(){
    assert(node.element.tagName === 'div');
  });

  it('should set the type', function(){
    assert(dom('span').element.tagName === 'span');
  });

  it('should set attributes', function(){
    var node = dom('div', {
      name: 'Foo'
    });
    assert.equal(
      node.element.attributes['name'],
      'Foo'
    );
  });
});
