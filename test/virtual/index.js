var assert = require('assert');
var dom = require('../../lib/virtual');

it('should throw an error for missing type', function(done){
  try {
    dom()
  } catch (e) {
    done()
  }
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

it('it should throw an error when arrays are used as children', function (done) {
  try {
    dom('div', null, [
      [dom('span')]
    ])
    done(false)
  } catch (e) {
    done()
  }
});

it('it should allow nested arrays of children', function () {
  var children = [dom('span')]
  var node = dom('div', null, [
    children
  ])
  assert(node.children.length === 1)
  assert(node.children[0].tagName === 'span')
});

it('it should add indexes to children', function () {
  var node = dom('div', null, [
    null,
    dom('span'),
    dom('span'),
    dom('span'),
    dom('span'),
    dom('span'),
    null
  ]);
  assert(node.children.length === 5)
  assert(node.children[0].index === 0)
  assert(node.children[1].index === 1)
  assert(node.children[2].index === 2)
  assert(node.children[3].index === 3)
  assert(node.children[4].index === 4)
});

it('should allow a single DOM node as a child', function () {
  var node = dom('div', null, dom('span'));
  assert(node.children[0].type === 'element');
  assert(node.children[0].tagName === 'span');
});

it('should allow children as rest params', function () {
  var node = dom('div', { foo: 'bar' }, 'one', 'two', 'three', 'four');
  assert.equal(node.children.length, 4);
});

it('should allow children as rest params with no attrs', function () {
  var node = dom('div', null, 'one', 'two', 'three', 'four');
  assert.equal(node.children.length, 4);
});

it('should allow skipping attributes and using an array of children', function () {
  var node = dom('div', ['foo']);
  assert(node.children[0].data === 'foo');
});

it('should allow skipping attributes and using a single child', function () {
  var node = dom('div', 'foo');
  assert(node.children[0].data === 'foo');
});
