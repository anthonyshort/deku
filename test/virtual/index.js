
var assert = require('component/assert@0.4.0');
var virtual = require('/lib/virtual');
var dom = virtual.node;

describe('Virtual Node', function(){
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

  it('should store events', function () {
    var node = dom('div', { onClick: click });
    function click() {};
    assert(node.events['click'] === click);
  });

  it('should allow skipping attributes and using an array of children', function () {
    var node = dom('div', ['foo']);
    assert(node.children[0].data === 'foo');
  });

  it('should allow skipping attributes and using a single child', function () {
    var node = dom('div', 'foo');
    assert(node.children[0].data === 'foo');
  });

  describe('extracting class/id', function(){

    it('should set the tag using classes', function () {
      var node = dom('div.foo');
      assert(node.attributes['class'] === 'foo');
    });

    it('should add classes together', function () {
      var node = dom('div.foo', { class: 'bar' });
      assert(node.attributes['class'] === 'bar foo', node.attributes.class);
    });

    it('should set the id', function () {
      var node = dom('div#foo', { class: 'bar' });
      assert(node.attributes.id === 'foo');
      assert(node.attributes.class === 'bar');
    });

    it('should set the id and the class', function () {
      var node = dom('div#foo.baz', { class: 'bar' });
      assert(node.attributes.id === 'foo');
      assert(node.attributes.class === 'bar baz');
    });

    it('should set the id and the class without the tag', function () {
      var node = dom('#foo.baz', { class: 'bar' });
      assert(node.tagName === 'div');
      assert(node.attributes.id === 'foo');
      assert(node.attributes.class === 'bar baz');
    });

    it('should set the id and the class with the tag', function () {
      var node = dom('span#foo.baz', { class: 'bar' });
      assert(node.tagName === 'span');
      assert(node.attributes.id === 'foo');
      assert(node.attributes.class === 'bar baz');
    });

    it('should set multiple classes', function () {
      var node = dom('span.foo.baz', { class: 'bar' });
      assert(node.tagName === 'span');
      assert(node.attributes.class === 'bar foo baz');
    });

  });

});
