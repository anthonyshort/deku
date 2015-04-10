import assert from 'assert'
import {component,dom,deku} from '../../'
import {mount,div} from '../helpers'

/**
 * Custom components used for testing
 */

var Toggle = component({
  render: function(props, state){
    if (!props.showChildren) {
      return dom('div');
    } else {
      return dom('div', null, [dom('span', { id: 'foo' })]);
    }
  }
});

var CustomTag = component({
  render: function(props, state){
    return dom(props.type);
  }
});

var AdjacentTest = component({
  render: function(props, state){
    if (props.i === 1) return dom('div', { id: 'root' }, [dom('span', { id: 'foo' }), dom('span', { id: 'bar' }), dom('span', { id: 'baz' })]);
    if (props.i === 2) return dom('div', { id: 'root' }, [dom('span', { id: 'foo' })]);
  }
});

var BasicComponent = component({
  render: function(props, state){
    return dom('div', null, ['component']);
  }
});

var ComponentToggle = component({
  render: function(props, state){
    if (!props.showComponent) {
      return dom('span');
    } else {
      return dom(BasicComponent);
    }
  }
});

/**
 * When updating a component it should add new elements
 * that are created on the new pass. These elements should
 * be added to the DOM.
 */

it('should add/remove element nodes', function(){
  var app = deku().set('renderImmediate', true);
  var el = div();
  app.layer('main', el);
  app.mount(Toggle, {
    showChildren: false
  });

  assert.equal(el.innerHTML, '<div></div>')
  app.update({ showChildren: true })
  assert.equal(el.innerHTML, '<div><span id="foo"></span></div>')
  app.update({ showChildren: false })
  assert.equal(el.innerHTML, '<div></div>')
});

/**
 * When updating a component it should remove child elements
 * from the DOM that don't exist in the new rendering but leave the existing nodes.
 */

it('should only remove adjacent element nodes', function(){
  var app = deku().set('renderImmediate', true);
  var el = div();
  app.layer('main', el);
  app.mount(AdjacentTest, {
    i: 1
  });

  assert(document.querySelector('#foo'));
  assert(document.querySelector('#bar'));
  assert(document.querySelector('#baz'));
  app.update({ i: 2 });
  assert(document.querySelector('#foo'));
  assert(document.querySelector('#bar') == null);
  assert(document.querySelector('#baz') == null);
})

/**
 * It should change the tag name of element
 */

it('should change tag names', function(){
  var app = deku().set('renderImmediate', true);
  var el = div();
  app.layer('main', el);
  app.mount(CustomTag, { type: 'span' });

  assert.equal(el.innerHTML, '<span></span>');
  app.update({ type: 'div' });
  assert.equal(el.innerHTML, '<div></div>');
});

/**
 * Because the root node has changed, when updating the mounted component
 * should have it's element updated so that it applies the diff patch to
 * the correct element.
 */

it('should change root node and still update correctly', function(){
  var ComponentA = component({
    render: function(props, state){
      return dom(props.type, null, props.text);
    }
  });
  var Test = component({
    render: function(props, state){
      return dom(ComponentA, { type: props.type, text: props.text });
    }
  });

  var app = deku().set('renderImmediate', true);
  var el = div();
  app.layer('main', el);
  app.mount(Test, {
    type: 'span',
    text: 'test'
  });

  assert.equal(el.innerHTML, '<span>test</span>');
  app.update({ type: 'div', text: 'test' });
  assert.equal(el.innerHTML, '<div>test</div>');
  app.update({ type: 'div', text: 'foo' });
  assert.equal(el.innerHTML, '<div>foo</div>');
});

/**
 * When a node is removed from the tree, all components within that
 * node should be recursively removed and unmounted.
 */

it('should unmount components when removing an element node', function(){
  var i = 0;
  function inc() { i++ }
  var UnmountTest = component({
    beforeUnmount: inc
  });

  var App = component({
    render: function(props, state){
      if (props.showElements) {
        return dom('div', null, [
          dom('div', null, [
            dom(UnmountTest)
          ])
        ]);
      }
      else {
        return dom('div');
      }
    }
  });

  var app = deku().set('renderImmediate', true);
  var el = div();
  app.layer('main', el);
  app.mount(App, {
    showElements: true
  });

  app.update({ showElements: false });
  assert.equal(i, 1);
});

/**
 * When a component has another component directly rendered
 * with it, it should be able to swap out the type of element
 * that is rendered.
 */

it('should change sub-component tag names', function(){
  var Test = component({
    render: function(props, state){
      return dom(CustomTag, { type: props.type });
    }
  });

  var app = deku().set('renderImmediate', true);
  var el = div();
  app.layer('main', el);
  app.mount(Test, { type: 'span' });

  app.update({ type: 'div' });
  assert.equal(el.innerHTML, '<div></div>');
});

/**
 * It should be able to render new components when re-rendering
 */

it('should replace elements with component nodes', function(){
  var Test = component({
    render: function(props, state){
      if (props.showElement) {
        return dom('span', null, ['element']);
      } else {
        return dom(BasicComponent);
      }
    }
  });

  var app = deku().set('renderImmediate', true);
  var el = div();
  app.layer('main', el);
  app.mount(Test, { showElement: true });

  assert.equal(el.innerHTML, '<span>element</span>');
  app.update({ showElement: false });
  assert.equal(el.innerHTML, '<div>component</div>');
});

/**
 * If the component type changes at a node, the first component
 * should be removed and unmount and replaced with the new component
 */

it('should replace components', function(){
  var ComponentA = component({
    render: function(props, state){
      return dom('div', null, ['A']);
    }
  });
  var ComponentB = component({
    render: function(props, state){
      return dom('div', null, ['B']);
    }
  });
  var ComponentC = component({
    render: function(props, state){
      if (props.type === 'A') return dom(ComponentA);
      return dom(ComponentB);
    }
  });

  var app = deku().set('renderImmediate', true);
  var el = div();
  app.layer('main', el);
  app.mount(ComponentC, { type: 'A' });

  assert.equal(el.innerHTML, '<div>A</div>')
  app.update({ type: 'B' })
  assert.equal(el.innerHTML, '<div>B</div>')
  var childId = app.root.children['0'];
  var entity = app.renders[childId];
  assert(entity.component === ComponentB);
})

/**
 * It should remove components from the children hash when they
 * are moved from the tree.
 */

it('should remove references to child components when they are removed', function(){
  var app = deku().set('renderImmediate', true);
  var el = div();
  app.layer('main', el);
  app.mount(ComponentToggle, { showComponent: true });

  assert(app.root.children);
  app.update({ showComponent: false });
  assert(!app.root.children['0']);
});
