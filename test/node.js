var assert = require('component/assert@0.4.0');
var tron = require('../index.js');
var dom = tron.node;

describe('dom', function(){
  // it('should create divs by default', function(){
  //   assert(dom().owner.tagName === 'div');
  // });

  it('should set the type', function(){
    var el = dom('span').render();
    assert(el.tagName === 'SPAN');
  });

  it('should create divs by default', function(){
    var a = dom();
    var el = a.render();
    assert(el.tagName === 'DIV');
  });

  it('should not add exluded properies', function(){
    var a = dom('div', { key: 'foo' });
    var el = a.render();
    assert(el.outerHTML === '<div></div>');
  });

  it('should set attributes', function(){
    var node = dom('div', {
      name: 'Foo'
    });
    assert.equal(
      node.data.attributes['name'],
      'Foo'
    );
  });
});
