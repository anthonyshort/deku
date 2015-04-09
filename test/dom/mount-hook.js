import {mount,div} from '../helpers'
import {component,render,deku,dom} from '../../'
import assert from 'assert'

it('should fire the `afterMount` hook', function(done){
  var Page = component({
    afterMount: function(){
      done();
    }
  });
  var app = deku();
  var el = div();
  app.mount(el, Page);
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
  var app = deku().set('renderImmediate', true);
  var el = div();
  app.mount(el, Page);
  assert(pass);
})

it.skip('should not unmount twice', function(){
  var Page = component()
  var app = deku().set('renderImmediate', true);
  var el = div();
  app.mount(el, Page);
  app.unmount(0);
  app.unmount(0);
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

  var app = deku().set('renderImmediate', true);
  var el = div();
  app.mount(el, ComponentB, { name: 'Bob' });

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

  var app = deku().set('renderImmediate', true);
  var el = div();
  app.mount(el, Parent, { show: true });

  app.update({ show: false });
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

  var app = deku().set('renderImmediate', true);
  var el = div();
  app.mount(el, Parent, { show: true });

  var overlay = document.querySelector('.Overlay')
  assert(overlay.parentElement === document.body, 'It should move element to the root')
  app.update({ show: false });
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

  var app = deku().set('renderImmediate', true);
  var el = div();
  app.mount(el, ComponentB, { showComponent: false });

  app.update({ showComponent: true });
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

  var app = deku().set('renderImmediate', true);
  var el = div();
  app.mount(el, ComponentB, { showComponent: true });

  app.update({ showComponent: false });
  assert.equal(calls, 1);
});
