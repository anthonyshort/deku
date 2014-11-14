var assert = require('component/assert@0.4.0');
var component = require('/lib/component');

describe('structure', function(){

  it('should add new elements', function(){
    var i = 1;
    var Page = component({
      render: function(dom){
        if (i === 1) return dom('div');
        if (i === 2) return dom('div', null, [dom('span', { id: 'foo' })]);
      }
    });
    var view = Page.render(el);
    assert(document.querySelector('#foo') == null);
    i = 2;
    view.render();
    assert(document.querySelector('#foo'));
  });

  it.skip('should remove old elements', function(){
    var a = dom('div');
    var b = dom('div', null, [dom('span')]);
    var el = b.toElement();
    var patch = diff(b, a);
    assert(el.childNodes.length === 1);
    patch(el);
    assert(el.childNodes.length === 0);
  });

  it.skip('should replace different nodes', function(){
    var a = dom('div');
    var b = dom('span');
    var el = a.toElement();
    parent.appendChild(el);
    var patch = diff(a,b);
    patch(el);
    assert(el.element.tagName === 'SPAN');
  });

  it.skip('should swap text elements with elements', function(){
    var a = dom('div', null, [dom('span')]);
    var b = dom('div', null, ['bar']);
    var el = b.toElement();
    var patch = diff(b, a);
    assert(el.innerHTML === 'bar');
    patch(el);
    assert(el.innerHTML === '<span></span>');
  });

  it('should change tag names', function(){
    var i = 0;
    var ComponentA = component({
      render: function(n, state, props){
        return n(props.type, null, ['test']);
      }
    });
    var mount = ComponentA.render(el, { type: 'span' });
    mount.set({ type: 'div' })
    assert.equal(el.innerHTML, '<div>test</div>');
  });

  it.skip('should remove nested components when switching tag names', function(){
    var i = 0;
    function inc() { i++ }
    var ComponentA = component({
      unmount: inc,
      beforeUnmount: inc,
      render: function(n, state, props){
        return n('span', null, ['test']);
      }
    });
    var ComponentB = component({
      unmount: inc,
      beforeUnmount: inc,
      render: function(n, state, props){
        return n(ComponentA);
      }
    });
    var ComponentC = component({
      unmount: inc,
      beforeUnmount: inc,
      render: function(n, state, props){
        if (props.n === 0) {
          return n('div', null, [
            n('div', null, [
              n(ComponentB),
              n(ComponentA)
            ])
          ]);
        }
        else {
          n('span', null, [
            n(ComponentB),
            n(ComponentA)
          ])
        }
      }
    });
    var mount = ComponentC.render(el, { n: 0 });
    mount.set({ n: 1 })
    assert.equal(i, 6);
  });

  it('should remove nested components when removing a branch', function(){
    var i = 0;
    function inc() { i++ }
    var ComponentA = component({
      unmount: inc,
      beforeUnmount: inc,
      render: function(n, state, props){
        return n('span', null, ['test']);
      }
    });
    var ComponentB = component({
      unmount: inc,
      beforeUnmount: inc,
      render: function(n, state, props){
        return n(ComponentA);
      }
    });
    var ComponentC = component({
      unmount: inc,
      beforeUnmount: inc,
      render: function(n, state, props){
        if (props.n === 0) {
          return n('div', null, [
            n('div', null, [
              n(ComponentB),
              n(ComponentA)
            ])
          ]);
        }
        else {
          return n('div');
        }
      }
    });
    var mount = ComponentC.render(el, { n: 0 });
    mount.set({ n: 1 })
    assert.equal(i, 6);
  });


});
