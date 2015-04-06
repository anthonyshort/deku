import assert from 'assert'
import {component,dom,scene} from '../../'
import {mount} from '../helpers'

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
  var app = scene(Toggle)
    .setProps({ showChildren: false })

  mount(app, function(el, renderer){
    assert.equal(el.innerHTML, '<div></div>')
    app.setProps({ showChildren: true })
    renderer.render()
    assert.equal(el.innerHTML, '<div><span id="foo"></span></div>')
    app.setProps({ showChildren: false })
    renderer.render()
    assert.equal(el.innerHTML, '<div></div>')
  })
});

/**
 * When updating a component it should remove child elements
 * from the DOM that don't exist in the new rendering but leave the existing nodes.
 */

it('should only remove adjacent element nodes', function(){
  var app = scene(AdjacentTest)
    .setProps({ i: 1 })

  mount(app, function(el, renderer){
    assert(document.querySelector('#foo'));
    assert(document.querySelector('#bar'));
    assert(document.querySelector('#baz'));
    app.setProps({ i: 2 });
    renderer.render();
    assert(document.querySelector('#foo'));
    assert(document.querySelector('#bar') == null);
    assert(document.querySelector('#baz') == null);
  })
})

/**
 * It should change the tag name of element
 */

it('should change tag names', function(){
  var app = scene(CustomTag)
    .setProps({ type: 'span' })

  mount(app, function(el, renderer){
    assert.equal(el.innerHTML, '<span></span>');
    app.setProps({ type: 'div' });
    renderer.render();
    assert.equal(el.innerHTML, '<div></div>');
  })
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

  var app = scene(Test)
    .setProps({ type: 'span', text: 'test' })

  mount(app, function(el, renderer){
    assert.equal(el.innerHTML, '<span>test</span>');
    app.setProps({ type: 'div', text: 'test' });
    renderer.render()
    assert.equal(el.innerHTML, '<div>test</div>');
    app.setProps({ type: 'div', text: 'foo' });
    renderer.render()
    assert.equal(el.innerHTML, '<div>foo</div>');
  })
});

/**
 * When a node is removed from the tree, all components within that
 * node should be recursively removed and unmounted.
 */

it('should unmount components when removing an element node', function(){
  var i = 0;
  function inc() { i++ }
  var UnmountTest = component({
    afterUnmount: inc,
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

  var app = scene(App)
    .setProps({ showElements: true })

  mount(app, function(el, renderer){
    app.setProps({ showElements: false });
    renderer.render();
    assert.equal(i, 2);
  })
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

  var app = scene(Test)
    .setProps({ type: 'span' })

  mount(app, function(el, renderer){
    app.setProps({ type: 'div' });
    renderer.render();
    assert.equal(el.innerHTML, '<div></div>');
  })
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

  var app = scene(Test)
    .setProps({ showElement: true })

  mount(app, function(el, renderer){
    assert.equal(el.innerHTML, '<span>element</span>');
    app.setProps({ showElement: false });
    renderer.render()
    assert.equal(el.innerHTML, '<div>component</div>');
  })
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

  var app = scene(ComponentC)
    .setProps({ type: 'A' })

  mount(app, function(el, renderer){
    assert.equal(el.innerHTML, '<div>A</div>')
    app.setProps({ type: 'B' })
    renderer.render()
    assert.equal(el.innerHTML, '<div>B</div>')
    var childId = renderer.children[app.root.id]['0'];
    var entity = renderer.entities[childId];
    assert(entity.component === ComponentB);
  })
})

/**
 * It should remove components from the children hash when they
 * are moved from the tree.
 */

it('should remove references to child components when they are removed', function(){
  var app = scene(ComponentToggle)
    .setProps({ showComponent: true })

  mount(app, function(el, renderer){
    var entityId = app.root.id;
    assert(renderer.children[entityId]);
    app.setProps({ showComponent: false });
    renderer.render()
    assert(!renderer.children[entityId]['0']);
  })
});

