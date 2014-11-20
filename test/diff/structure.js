var assert = require('component/assert@0.4.0');
var component = require('/lib/component');

describe('structure', function(){

  /**
   * When updating a component it should add new elements
   * that are created on the new pass. These elements should
   * be added to the DOM.
   */

  it('should add new elements', function(){
    var i = 1;
    var Page = component({
      render: function(dom){
        if (i === 1) return dom('div');
        if (i === 2) return dom('div', null, [dom('span', { id: 'foo' })]);
      }
    });
    var mount = Page.render(el);
    assert(document.querySelector('#foo') == null);
    i = 2;
    mount.forceUpdate();
    assert(document.querySelector('#foo'));
  });

  /**
   * When updating a component it should remove elements
   * from the DOM that don't exist in the new rendering.
   */

  it('should remove nodes', function(){
    var i = 1;
    var Page = component({
      render: function(dom){
        if (i === 1) return dom('div', null, [dom('span', { id: 'foo' })]);
        if (i === 2) return dom('div');
      }
    });
    var view = Page.render(el);
    assert(document.querySelector('#foo'));
    i = 2;
    view.forceUpdate();
    assert(document.querySelector('#foo') == null);
  });

  /**
   * It should change the tag name of element and keep
   * the same content.
   */

  it('should change tag names', function(){
    var i = 0;
    var ComponentA = component({
      render: function(n, state, props){
        return n(props.type, null, ['test']);
      }
    });
    var mount = ComponentA.render(el, { type: 'span' });
    assert.equal(el.innerHTML, '<span>test</span>');
    mount.setProps({ type: 'div' });
    mount.forceUpdate();
    assert.equal(mount.rendered.el.outerHTML, '<div>test</div>');
  });

  /**
   * If there are child component that actually reference the same
   * element as the root element, we need to make sure the references
   * are updated correctly.
   */

  it('should change tag names and update parent components that reference the element', function(){
    var i = 0;
    var ComponentA = component({
      render: function(n, state, props){
        return n(props.type, null, ['test']);
      }
    });
    var ComponentB = component({
      render: function(n, state, props){
        return n(ComponentA, { type: props.type });
      }
    });
    var mount = ComponentB.render(el, { type: 'span' });
    assert(mount.rendered.el === mount.rendered.children['0'].el);
    mount.setProps({ type: 'div' });
    mount.forceUpdate();
    assert(mount.rendered.el === mount.rendered.children['0'].el);
    mount.setProps({ type: 'b' });
    mount.forceUpdate();
    assert.equal(mount.rendered.el.outerHTML, '<b>test</b>');
    assert.equal(mount.rendered.children['0'].el.outerHTML, '<b>test</b>');
  });

  /**
   * Because the root node has changed, when updating the mounted component
   * should have it's element updated so that it applies the diff patch to
   * the correct element.
   */

  it('should change tag names and update', function(){
    var i = 0;
    var ComponentA = component({
      render: function(n, state, props){
        return n(props.type, null, props.text);
      }
    });
    var ComponentB = component({
      render: function(n, state, props){
        return n(ComponentA, { type: props.type, text: props.text });
      }
    });
    var mount = ComponentB.render(el, { type: 'span', text: 'test' });
    mount.setProps({ type: 'div', text: 'test' });
    mount.forceUpdate();
    mount.setProps({ type: 'div', text: 'foo' });
    mount.forceUpdate();
    assert.equal(el.innerHTML, '<div>foo</div>');
  });

  /**
   * When a node is removed from the tree, all components within that
   * node should be recursively removed and unmounted.
   */

  it('should remove nested components when removing a branch', function(){
    var i = 0;
    function inc() { i++ }
    var ComponentA = component({
      afterUnmount: inc,
      beforeUnmount: inc,
      render: function(n, state, props){
        return n('span', null, ['test']);
      }
    });
    var ComponentB = component({
      afterUnmount: inc,
      beforeUnmount: inc,
      render: function(n, state, props){
        return n(ComponentA);
      }
    });
    var ComponentC = component({
      afterUnmount: inc,
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
    mount.setProps({ n: 1 });
    mount.forceUpdate();
    assert.equal(i, 6);
  });

  /**
   * When a component has another component directly rendered
   * with it, it should be able to swap out the type of element
   * that is rendered.
   */

  it('should change sub-component tag names', function(){
    var i = 0;
    var ComponentA = component({
      render: function(n, state, props){
        return n(props.type, null, ['test']);
      }
    });
    var ComponentB = component({
      render: function(n){
        return n(ComponentA);
      }
    });
    var mount = ComponentB.render(el, { type: 'span' });
    mount.setProps({ type: 'div' });
    mount.forceUpdate();
    assert.equal(el.innerHTML, '<div>test</div>');
  });

  /**
   * It should be able to render new components when re-rendering
   */

  it('should swap elements for components', function(){
    var i = 0;
    var ComponentA = component({
      render: function(n, state, props){
        return n(props.type, null, ['test']);
      }
    });
    var ComponentB = component({
      render: function(n){
        if (i === 0) return n('div');
        return n(ComponentA);
      }
    });
    var mount = ComponentB.render(el);
    i = 1;
    mount.forceUpdate();
    assert.equal(el.innerHTML, '<div>test</div>');
  });

  /**
   * If the component type changes at a node, the first component
   * should be removed and unmount and replaced with the new component
   */

  it('should replace components', function(){
    var ComponentA = component({
      render: function(n, state, props){
        return n('div', null, ['A']);
      }
    });
    var ComponentB = component({
      render: function(n, state, props){
        return n('div', null, ['B']);
      }
    });
    var ComponentC = component({
      render: function(n, state, props){
        if (props.type === 'A') return n(ComponentA);
        return n(ComponentB);
      }
    });
    var mount = ComponentC.render(el, { type: 'A' });
    assert.equal(el.innerHTML, '<div>A</div>');
    mount.setProps({ type: 'B' });
    mount.forceUpdate();
    assert.equal(el.innerHTML, '<div>B</div>');
    assert(mount.rendered.children['0'].instance instanceof ComponentB);
  })

  /**
   * It should remove components from the children hash when they
   * are moved from the tree.
   */

  it('should remove references to child components when they are removed', function () {
    var Component = component({
      render: function(n, state, props){
        return n('div', null, ['Component']);
      }
    });
    var Wrapper = component({
      render: function(n, state, props){
        if (props.type === 'component') return n(Component);
        return n('div', null, ['Element']);
      }
    });
    var mount = Wrapper.render(el, { type: 'component' });
    assert(mount.rendered.children['0']);
    mount.setProps({ type: 'element' });
    mount.forceUpdate();
    assert.equal(el.innerHTML, '<div>Element</div>');
    assert(mount.rendered.children['0'] == null);
  });

});
