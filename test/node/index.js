
var assert = require('component/assert@0.4.0');
var dom = require('/lib/node');

describe('node', function(){
  it('should create divs by default', function(){
    assert(dom().tagName === 'div');
  });

  it('should create unique ids', function(){
    var one = dom();
    var two = dom();
    assert(one.id !== two.id);
  });

  it('should set the tagName', function(){
    assert(dom('span').tagName === 'span');
  });

  it('should add the key as an attribute', function(){
    var a = dom('div', { key: 'foo' });
    assert(a.attributes['data-key'] === 'foo');
  });

  it('should set attributes', function(){
    var node = dom('div', { name: 'Foo' });
    assert(node.attributes.name === 'Foo');
  });

  it('should set class from a string', function () {
    var node = dom('div', { class: 'foo bar baz' });
    assert(node.attributes.class === 'foo bar baz');
  });

  it('should set class from an array', function () {
    var node = dom('div', { class: ['foo', 'bar', 'baz'] });
    assert(node.attributes.class === 'foo bar baz');
  });

  it('should not render class from an empty array', function () {
    var node = dom('div', { class: [] });
    assert(node.attributes.class === undefined);
  });

  it('should set class from an object', function () {
    var names = { foo: true, bar: false, baz: true };
    var node = dom('div', { class: names });
    assert(node.attributes.class === 'foo baz');
  });

  it('should set the style attribute with an object', function () {
    var styles = {
      'text-align': 'left',
      'height': '10px',
      'width': '10px'
    };
    var node = dom('div', { style: styles });
    assert(node.attributes.style === 'text-align:left;height:10px;width:10px;');
  });

  it('should render styles from a string', function () {
    var node = dom('div', { style: 'text-align:left;height:10px;width:10px;' });
    assert(node.attributes.style === 'text-align:left;height:10px;width:10px;');
  });

  it('should set data attributes with a dataset object', function () {
    var data = {
      content: 'lorem ipsum',
      foo: true
    };
    var node = dom('div', { data: data });
    assert(node.attributes['data-content'] === 'lorem ipsum');
    assert(node.attributes['data-foo'] === true);
  });

  it('should throw a helpful error if you try to use an array as a node', function (done) {
    try {
      var node = dom('div', null, [
        [dom('span')]
      ]);
    } catch (e) {
      assert(e.message === 'Child node cant be an array. This can happen if you try to use props.children like a node.');
      done();
    }
  });

});
