var dom = require('../index.js');
var assert = require('component/assert@0.4.0');

describe('dom', function () {
  var node;

  beforeEach(function(){
    node = dom();
  })

  /**
   * type
   */

  it('should create divs by default', function () {
    assert(node.type === 'div');
  });

  it('should set the type', function () {
    assert(dom('span').type === 'span');
  });

  it('should set attributes', function () {
    var node = dom('div', {
      name: 'Foo'
    });
    assert.equal(
      node.attributes['name'],
      'Foo'
    );
  });

  /**
   * Attributes
   */

  describe.skip('.attrs()', function(){

    it('should be set as an object', function () {
      node.attrs({ name: 'foo' });
      assert(node.attrs('name') === 'foo');
    });

    it.skip('should be set as thunks', function () {
      node.attrs(function(node){
        assert(node instanceof dom);
        return { name: 'foo' };
      });
      assert(node.attrs('name') === 'foo');
    });

  })

  /**
   * Classes
   */

  describe.skip('.class()', function(){

    it('should have classes', function(){
      assert(Array.isArray(node.class()));
    });

    it('should add classes', function(){
      node.class(['one', 'two']);
      assert(node.class()[0] === 'one');
      assert(node.class()[1] === 'two');
    });

    it('should replace classes', function(){
      node
        .class(['one'])
        .class(['two']);
      assert(node.class()[0] === 'two');
      assert(node.class().length === 1);
    });

    it('should be set as thunks', function () {
      node.class(function(node){
        assert(node instanceof dom);
        return ['foo', 'bar', 'baz'];
      });
      assert(node.class().length === 3);
    });

    it('should be set as objects', function () {
      node.class({
        'foo': true,
        'bar': false,
        'baz': false
      });
      assert(node.class().length === 1);
      assert(node.class()[0] === 'foo');
    });

    it('should return objects from thunks', function () {
      node.class(function(node){
        assert(node instanceof dom);
        return {
          'foo': true,
          'bar': false,
          'baz': true
        };
      });
      assert(node.class().length === 2);
      assert(node.class()[0] === 'foo');
      assert(node.class()[1] === 'baz');
    });

  });

  /**
   * Children
   */

  describe.skip('.append()', function(){

    it('should append an array of children', function () {
      var child = dom();
      node.append([child]);
      assert(node.children.length === 1);
    });

    it('should append text nodes', function () {
      node.append(["Hello"]);
      assert(node.children.length === 1);
    });

    describe.skip('as thunks', function(){

      it('sends the current node to thunks', function (done) {
        node.children(function(node){
          assert(node instanceof dom);
          return 'foo';
        });
        assert(node.children().length === 1);
      });

      it('returns an array', function () {
        node.children(function(node){
          return [dom().attrs({ name: 'foo' }).text('Hello World')];
        });
        assert.equal(node.toString(), '<div><div name="foo">Hello World</div></div>');
      });

      it('returns a node', function () {
        node.append(function(node){
          return dom().attrs({ name: 'foo' }).text('Hello World');
        });
        assert.equal(node.toString(), '<div><div name="foo">Hello World</div></div>');
      });

      it('returns a string', function () {
        node.append(function(){
          return 'Hello World';
        });
        assert.equal(node.toString(), '<div><div name="foo">Hello World</div></div>');
      });
    });

  });

  /**
   * Styles
   */

  describe.skip('styles', function(){

    it('should set styles', function(){
      node.styles({
        'text-align': 'right',
        'height': '200px'
      });
      assert(node.styles('text-align') === 'right');
      assert(node.styles('height') === '200px');
    })

  })

  /**
   * Converting to HTML string
   */

  describe.skip('.toString()', function () {

    it('should render the node', function () {
      var node = dom('span');
      assert.equal(node.toString(), '<span></span>');
    });

    describe('rendering attributes', function () {

      it('should render attributes', function () {
        node.attrs({ name: 'foo' });
        assert.equal(node.toString(), '<div name="foo"></div>');
      })

      it('should not render empty attributes', function () {
        node.attrs({ name: '' });
        assert.equal(node.toString(), '<div></div>');
      })

      it('should not render empty array attributes', function () {
        node.attrs({ name: [] });
        assert.equal(node.toString(), '<div></div>');
      })

      it('should render arrays', function () {
        node.attrs({ name: ['one', 'two', 'three'] });
        assert.equal(node.toString(), '<div name="one two three"></div>');
      })

      it('should render objects', function () {
        node.attrs({ name: { one: 'foo', two: 'bar' } });
        assert.equal(node.toString(), '<div name-one="foo" name-two="bar"></div>');
      })

      it('should not render false attributes', function(){
        node.attrs({ 'name': false });
        assert.equal(node.toString(), '<div></div>');
      })

    })

    describe.skip('rendering classes', function () {

      it('should be set as thunks', function () {
        node.class(['foo', 'bar', 'baz']);
        assert.equal(node.toString(), '<div class="foo bar baz"></div>');
      });

    });

    describe.skip('rendering styles', function () {

      it('should render styles', function () {
        node.styles({
          'text-align': 'right',
          'height': '200px'
        });
        assert.equal(
          node.toString(),
          '<div styles="text-align: right; height: 200px"></div>'
        );
      })

    })

    describe.skip('rendering children', function () {

    })

    describe.skip('rendering text nodes', function () {

      it('should append text nodes', function () {
        node.append(["Hello"]);
        assert.equal(node.toString(), '<div>Hello</div>');
      });

      it('should append multiple text nodes', function () {
        node.append(['Hello', 'World']);
        assert.equal(node.toString(), "<div>Hello\nWorld</div>");
      });

    })

  })

  describe.only('diffs', function () {
    var parent;

    beforeEach(function () {
      parent = document.createDocumentFragment();
    });

    it('should replace different nodes', function () {
      var a = dom('div');
      var b = dom('span');
      var el = a.toElement();
      parent.appendChild(el);
      var patch = a.diff(b);
      var newEl = patch(el);
      assert(newEl !== el);
      assert(newEl.tagName === 'SPAN');
    });

    it('should add new attributes', function () {
      var a = dom('div');
      var b = dom('div', { name: 'foo' });
      var el = a.toElement();
      parent.appendChild(el);
      var patch = a.diff(b);
      patch(el);
      assert(el.getAttribute('name') === 'foo');
    });

    it('should remove old attributes', function () {
      var a = dom('div', { name: 'foo' });
      var b = dom('div');
      var el = a.toElement();
      parent.appendChild(el);
      var patch = a.diff(b);
      patch(el);
      assert(el.getAttribute('name') == null);
    });

    it('should update attribute values', function () {
      var a = dom('div', { name: 'foo' });
      var b = dom('div', { name: 'bar' });
      var el = a.toElement();
      var patch = a.diff(b);
      patch(el);
      assert(el.getAttribute('name') == 'bar');
    });

    it('should not update attributes that have not changed', function (done) {
      var a = dom('div', { name: 'foo' });
      var b = dom('div', { name: 'foo' });
      var el = a.toElement();
      el.setAttribute = function(name, value){
        done(false);
      };
      var patch = a.diff(b);
      patch(el);
      done();
    });

  });

})
