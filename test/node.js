var assert = require('component/assert@0.4.0');
var dom = require('../lib/node');

describe('node', function(){

  it('should create divs by default', function(){
    assert(dom().tagName === 'div');
  })

  it('should set the tagName', function(){
    assert(dom('span').tagName === 'span');
  })

  it('should add the key as an attribute', function(){
    var a = dom('div', { key: 'foo' });
    var el = a.toElement();
    assert(el.outerHTML === '<div data-key="foo"></div>');
  })

  it('should set attributes', function(){
    var node = dom('div', { name: 'Foo' });
    assert(node.attributes.name === 'Foo');
  })
});
