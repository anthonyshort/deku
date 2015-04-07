import {mount,div} from '../helpers'
import {component,render,World,dom} from '../../'
import assert from 'assert'

it('should fire the `afterMount` hook', function(done){
  var Page = component({
    afterMount: function(){
      done();
    }
  });
  var world = World();
  var el = div();
  world.mount(el, Page);
})

it('should fire the `beforeMount` hook before `mount`', function(){
  var pass;
  var Page = component({
    beforeMount: function(){
      pass = false;
    },
    afterMount: function(){
      pass = true;
    }
  });
  var world = World().set('renderImmediate', true);
  var el = div();
  world.mount(el, Page);
  assert(pass);
})

it.skip('should not unmount twice', function(){
  var Page = component()
  var world = World().set('renderImmediate', true);
  var el = div();
  world.mount(el, Page);
  world.unmount(0);
  world.unmount(0);
})

it('should fire mount events on sub-components', function(){
  var i = 0;

  function inc() { i++ }

  var ComponentA = component({
    afterMount: inc,
    beforeMount: inc,
    render: function(props, state){
      return dom('span', { name: props.name }, [props.text]);
    }
  });

  var ComponentB = component({
    afterMount: inc,
    beforeMount: inc,
    render: function(props, state){
      return dom(ComponentA, { text: 'foo', name: props.name });
    }
  });

  var world = World().set('renderImmediate', true);
  var el = div();
  world.mount(el, ComponentB, { name: 'Bob' });

  assert.equal(i, 4);
});

it('should fire unmount events on sub-components from the bottom up', function(){
  var arr = [];

  var ComponentA = component({
    beforeUnmount: function(){
      arr.push('A')
    },
    render: function(props, state){
      return dom('span', { name: props.name }, [props.text]);
    }
  });

  var ComponentB = component({
    beforeUnmount: function(){
      arr.push('B')
    },
    render: function(props, state){
      return dom(ComponentA, { text: 'foo', name: props.name });
    }
  });

  var Parent = component(function(props){
    if (props.show) {
      return dom(ComponentB)
    } else {
      return dom('noscript')
    }
  })

  var world = World().set('renderImmediate', true);
  var el = div();
  world.mount(el, Parent, { show: true });

  world.update({ show: false });
  assert.equal(arr.length, 2)
  assert.equal(arr[0], 'A')
  assert.equal(arr[1], 'B')
});

it('should unmount sub-components that move themselves in the DOM', function(){
  var arr = [];

  var Overlay = component({
    afterMount: function(el){
      document.body.appendChild(el)
    },
    beforeUnmount: function(){
      arr.push('A')
    },
    render: function(){
      return dom('.Overlay');
    }
  });

  var Parent = component(function(props){
    if (props.show) {
      return dom('div', [
        dom(Overlay)
      ])
    } else {
      return dom('div')
    }
  })

  var world = World().set('renderImmediate', true);
  var el = div();
  world.mount(el, Parent, { show: true });

  var overlay = document.querySelector('.Overlay')
  assert(overlay.parentElement === document.body, 'It should move element to the root')
  world.update({ show: false });
  assert.equal(arr[0], 'A');
});

it('should fire mount events on sub-components created later', function(){
  var calls = 0;
  function inc() { calls++ }

  var ComponentA = component({
    afterMount: inc,
    beforeMount: inc
  });

  var ComponentB = component({
    render: function(props, state){
      if (!props.showComponent) {
        return dom();
      } else {
        return dom(ComponentA);
      }
    }
  });

  var world = World().set('renderImmediate', true);
  var el = div();
  world.mount(el, ComponentB, { showComponent: false });

  world.update({ showComponent: true });
  assert.equal(calls, 2);
});

it('should fire unmount events on sub-components created later', function(){
  var calls = 0;
  function inc() { calls++ }

  var ComponentA = component({
    beforeUnmount: inc
  });

  var ComponentB = component({
    render: function(props, state){
      if (!props.showComponent) {
        return dom();
      } else {
        return dom(ComponentA);
      }
    }
  });

  var world = World().set('renderImmediate', true);
  var el = div();
  world.mount(el, ComponentB, { showComponent: true });

  world.update({ showComponent: false });
  assert.equal(calls, 1);
});
