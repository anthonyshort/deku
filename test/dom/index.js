import trigger from 'trigger-event';
import Emitter from 'component-emitter';
import raf from 'component-raf';
import assert from 'assert';
import {component,World,dom,render} from '../../';
import {HelloWorld,Span,TwoWords,mount,div} from '../helpers';

it('should render a component', function(){
  var Test = component(HelloWorld);
  var world = World().set('renderImmediate', true);
  var el = div();
  world.mount(el, Test);
  assert.equal(el.innerHTML, '<span>Hello World</span>');
})

it('should have initial state', function(){
  var DefaultState = component({
    initialState: function(){
      return {
        text: 'Hello World'
      };
    },
    render: function(props, state){
      return dom('span', null, state.text);
    }
  });
  var world = World();
  var el = div();
  world.mount(el, DefaultState);
  assert.equal(el.innerHTML, '<span>Hello World</span>');
})

it('should create a component with properties', function(){
  var Test = component({
    render(props) {
      return dom('span', null, [props.text])
    }
  })
  var world = World();
  var el = div();
  world.mount(el, Test, { text: 'Hello World' })
  assert.equal(el.innerHTML, '<span>Hello World</span>')
})

it('should remove from the DOM', function(){
  var Test = component(HelloWorld);
  var container = div();
  var renderer = render(world(Test), container);
  renderer.remove();
  assert.equal(container.innerHTML, '')
  assert.deepEqual(renderer.entities, {})
  assert.deepEqual(renderer.elements, {})
  assert.deepEqual(renderer.children, {})
})

it('should compose components', function(){
  var Inner = component(HelloWorld);
  var Composed = component({
    render: function(props, state){
      return dom(Inner);
    }
  });
  var world = World();
  var el = div();
  world.mount(el, Composed);
  assert.equal(el.innerHTML, '<span>Hello World</span>');
});

it('should compose components and pass in props', function(){
  var Inner = component(TwoWords);
  var Composed = component(function(props, state){
    return dom(Inner, { one: 'Hello', two: 'World' });
  });
  var world = World();
  var el = div();
  world.mount(el, Composed);
  assert.equal(el.innerHTML, '<span>Hello World</span>');
});

it('should update sub-components', function(){
  var Inner = component(TwoWords);
  var Composed = component(function(props, state){
    return dom('div', null, [
      dom(Inner, { one: 'Hello', two: props.world })
    ]);
  });
  var world = World().set('renderImmediate', true);
  var el = div();
  world.mount(el, Composed, { world: 'Pluto' });
  assert.equal(el.innerHTML, '<div><span>Hello Pluto</span></div>');
});

it('should allow components to have child nodes', function(){
  var ComponentA = component({
    render: function(props, state){
      return dom('div', null, props.children);
    }
  });
  var ComponentB = component({
    render: function(props, state){
      return dom(ComponentA, null, [
        dom('span', null, 'Hello World!')
      ]);
    }
  });
  var world = World();
  var el = div();
  world.mount(el, ComponentB);
  assert.equal(el.innerHTML, '<div><span>Hello World!</span></div>');
});

it('should update component child nodes', function(){
  var ComponentA = component({
    render: function(props, state){
      return dom('div', null, props.children);
    }
  });
  var ComponentB = component({
    render: function(props, state){
      return dom(ComponentA, null, [
        dom('span', null, props.text)
      ]);
    }
  });
  var world = World().set('renderImmediate', true);
  var el = div();
  world.mount(el, ComponentB);
  world.update({ text: 'Hello Pluto!' });
  assert.equal(el.innerHTML, '<div><span>Hello Pluto!</span></div>');
});

it('should allow components to have other components as child nodes', function(){
  var ComponentA = component({
    render: function(props, state){
      return dom('div', { name: 'ComponentA' }, props.children);
    }
  });
  var ComponentC = component({
    render: function(props, state){
      return dom('div', { name: 'ComponentC' }, props.children);
    }
  });
  var ComponentB = component({
    render: function(props, state){
      return dom('div', { name: 'ComponentB' }, [
        dom(ComponentA, null, [
          dom(ComponentC, { text: props.text }, [
            dom('span', null, 'Hello Pluto!')
          ])
        ])
      ]);
    }
  });

  var world = World();
  var el = div();
  world.mount(el, ComponentB, { text: 'Hello World!' })

  assert.equal(el.innerHTML, '<div name="ComponentB"><div name="ComponentA"><div name="ComponentC"><span>Hello Pluto!</span></div></div></div>');
});

it('should only update ONCE when props/state is changed in different parts of the tree', function(){
  var i;
  var emitter = new Emitter();
  var ComponentA = component({
    initialState: function(){
      return {
        text: 'Deku Shield'
      };
    },
    afterMount: function(el, props, state, send) {
      var self = this;
      emitter.on('data', function(text){
        send({ text: text });
      })
    },
    render: function(props, state){
      i++;
      return dom('div', null, [props.text, ' ', state.text]);
    }
  });
  var ComponentB = component({
    render: function(props, state){
      i++;
      return dom('div', null, [
        dom(ComponentA, { text: props.text })
      ]);
    }
  });

  var world = World();
  var el = div();
  world.mount(el, ComponentB, { text: '2x' })

  i = 0;
    // Mark ComponentA as dirty from a state change
  emitter.emit('data', 'Mirror Shield');
  // Update the top-level props
  world.update({ text: '3x' });
  assert.equal(i, 2)
  assert.equal(el.innerHTML, "<div><div>3x Mirror Shield</div></div>")
});

it('should only update if shouldUpdate returns true', function(){
  var i = 0;
  var Component = component({
    afterUpdate(){
      i = i + 1;
    },
    shouldUpdate(){
      return false;
    },
    render(){
      return dom('div')
    }
  });

  var world = World();
  var el = div();
  world.mount(el, Component)
  world.update({ foo: 'bar' });
  assert.equal(i, 0);
  world.update({ foo: 'baz' });
  assert.equal(i, 0);
});

it('should not allow setting the state during render', function (done) {
  var Impure = component(function(props, state, send){
    send({ foo: 'bar' });
    return dom();
  });
  try {
    var app = world(Impure)
    mount(app)
  } catch(e) {
    return done();
  }
});
