var dom = require('../');
var assert = require('assert');
var div = dom.div;

describe('virtual-dom', function () {

  it('should create elements with attributes', function () {
    var str = dom('div', { class: 'foo' }).toString();
    assert.equal(str, '<div class="foo"></div>');
  });

  it('should create divs', function () {
    var str = div().toString();
    assert.equal(str, '<div></div>');
  });

  it('should accept children', function () {
    var str = div(null, [
      div({ name: 'foo' }, 'Hello World')
    ]).toString();
    assert.equal(str, '<div><div name="foo">Hello World</div></div>');
  });

  it('should accept text nodes', function () {
    var str = div(null, ['Hello']).toString();
    assert.equal(str, '<div>Hello</div>');
  });

  it('should accept text nodes without an array', function () {
    var str = div(null, 'Hello').toString();
    assert.equal(str, '<div>Hello</div>');
  });

  it('should accept multiple text nodes', function () {
    var str = div(null, ['Hello', 'World']).toString();
    assert.equal(str, "<div>Hello\nWorld</div>");
  });

  it('should accept functions that return an array of children', function (done) {
    var str = div(null, function(node){
      assert(node instanceof dom.Node);
      return [div({ name: 'foo' }, 'Hello World')];
    }).toString();
    assert.equal(str, '<div><div name="foo">Hello World</div></div>');
    done();
  });

  it('should accept functions that return a node', function (done) {
    var str = div(null, function(node){
      return div({ name: 'foo' }, 'Hello World');
    }).toString();
    assert.equal(str, '<div><div name="foo">Hello World</div></div>');
    done();
  });

  it('should accept functions that return a string', function (done) {
    var str = div(null, function(node){
      return 'Hello World';
    }).toString();
    assert.equal(str, '<div>Hello World</div>');
    done();
  });

  it('should allow attributes to be a function', function () {
    var str = div(function(node){
      return { name: 'foo' };
    }).toString();
    assert.equal(str, '<div name="foo"></div>');
  });

});