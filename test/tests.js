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
    assert(node.element.tagName === 'div');
  });

  it('should set the type', function () {
    assert(dom('span').element.tagName === 'span');
  });

  it('should set attributes', function () {
    var node = dom('div', {
      name: 'Foo'
    });
    assert.equal(
      node.element.attributes['name'],
      'Foo'
    );
  });

  describe('diffs', function () {
    var parent;

    beforeEach(function () {
      parent = document.createDocumentFragment();
    });

    it.skip('should replace different nodes', function () {
      var a = dom('div');
      var b = dom('span');
      var el = a.toElement();
      parent.appendChild(el);
      var patch = a.diff(b);
      patch(el);
      assert(el.element.tagName === 'SPAN');
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

    it('should add new elements', function () {
      var a = dom('div');
      var b = dom('div', null, [dom('span')]);
      var el = a.toElement();
      var patch = a.diff(b);
      assert(el.childNodes.length === 0);
      patch(el);
      assert(el.childNodes.length === 1);
      assert(el.childNodes[0].tagName === 'SPAN');
    });

    it('should remove old elements', function () {
      var a = dom('div');
      var b = dom('div', null, [dom('span')]);
      var el = b.toElement();
      var patch = b.diff(a);
      assert(el.childNodes.length === 1);
      patch(el);
      assert(el.childNodes.length === 0);
    });

    it('should add text elements', function () {
      var a = dom('div');
      var b = dom('div', null, ['foo']);
      var el = a.toElement();
      var patch = a.diff(b);
      assert(el.childNodes.length === 0);
      patch(el);
      assert(el.childNodes[0].data === 'foo');
    });

    it('should remove text elements', function () {
      var a = dom('div');
      var b = dom('div', null, ['foo']);
      var el = b.toElement();
      var patch = b.diff(a);
      assert(el.childNodes.length === 1);
      patch(el);
      assert(el.innerHTML === '');
    });

    it('should update text elements', function () {
      var a = dom('div', null, ['foo']);
      var b = dom('div', null, ['bar']);
      var el = a.toElement();
      var patch = a.diff(b);
      assert(el.innerHTML === 'foo');
      patch(el);
      assert(el.innerHTML === 'bar');
    });

    it('should swap elements with text elements', function () {
      var a = dom('div', null, [dom('span')]);
      var b = dom('div', null, ['bar']);
      var el = a.toElement();
      var patch = a.diff(b);
      assert(el.innerHTML === '<span></span>');
      patch(el);
      assert(el.innerHTML === 'bar');
    });

    it('should swap text elements with elements', function () {
      var a = dom('div', null, [dom('span')]);
      var b = dom('div', null, ['bar']);
      var el = b.toElement();
      var patch = b.diff(a);
      assert(el.innerHTML === 'bar');
      patch(el);
      assert(el.innerHTML === '<span></span>');
    });


  });

})
