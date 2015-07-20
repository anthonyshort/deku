import {mount,div} from '../helpers'
import {render,deku} from '../../'
import assert from 'assert'
import dom from 'virtual-element'

it('should fire mount events on sub-components', function(){
  var i = 0;
  function inc() { i++ }
  var ComponentA = {
    afterMount: inc,
    beforeMount: inc,
    render: function(component){
      let {props, state} = component
      return dom('span', { name: props.name }, [props.text]);
    }
  };
  var ComponentB = {
    afterMount: inc,
    beforeMount: inc,
    render: function(component){
      let {props, state} = component
      return dom(ComponentA, { text: 'foo', name: props.name });
    }
  };
  var app = deku()
  app.mount(dom(ComponentB, { name: 'Bob' }))
  mount(app, function(){
    assert.equal(i, 4);
  })
});

it('should fire unmount events on sub-components from the bottom up', function(){
  var arr = [];

  var ComponentA = {
    beforeUnmount: function(){
      arr.push('A')
    },
    render: function(component){
      let {props, state} = component
      return dom('span', { name: props.name }, [props.text]);
    }
  };

  var ComponentB = {
    beforeUnmount: function(){
      arr.push('B')
    },
    render: function(component){
      let {props, state} = component
      return dom(ComponentA, { text: 'foo', name: props.name });
    }
  };

  var Parent = {
    render: function(component){
      let {props, state} = component
      if (props.show) {
        return dom(ComponentB)
      } else {
        return dom('noscript')
      }
    }
  }

  var app = deku()
  app.mount(dom(Parent, { show: true }));

  mount(app, function(){
    app.mount(dom(Parent, { show: false }));
    assert.equal(arr.length, 2)
    assert.equal(arr[1], 'A')
    assert.equal(arr[0], 'B')
  })
});

it('should unmount sub-components that move themselves in the DOM', function(){
  var arr = [];

  var Overlay = {
    afterMount: function(component, el){
      document.body.appendChild(el)
    },
    beforeUnmount: function(){
      arr.push('A')
    },
    render: function(){
      return dom('div', { class: 'Overlay' });
    }
  };

  var Parent = {
    render: function(component){
      let {props, state} = component
      if (props.show) {
        return dom('div', [
          dom(Overlay)
        ])
      } else {
        return dom('div')
      }
    }
  }

  var app = deku()
  app.mount(dom(Parent, { show: true }));
  mount(app, function(el){
    var overlay = document.querySelector('.Overlay')
    assert(overlay.parentElement === document.body, 'It should move element to the root')
    app.mount(dom(Parent, { show: false }));
    assert.equal(arr[0], 'A');
  })
});

it('should fire mount events on sub-components created later', function(){
  var calls = 0;
  function inc() { calls++ }
  var ComponentA = {
    render: function(){
      return dom('div')
    },
    afterMount: inc,
    beforeMount: inc
  };
  var ComponentB = {
    render: function(component){
      let {props, state} = component
      if (!props.showComponent) {
        return dom('div');
      } else {
        return dom(ComponentA);
      }
    }
  };
  var app = deku()
  app.mount(dom(ComponentB, { showComponent: false }));
  mount(app, function(){
    app.mount(dom(ComponentB, { showComponent: true }));
    assert.equal(calls, 2);
  })
});

it('should fire unmount events on sub-components created later', function(){
  var calls = 0;
  function inc() { calls++ }

  var ComponentA = {
    render: function(){
      return dom('div');
    },
    beforeUnmount: inc
  };

  var ComponentB = {
    render: function(component){
      let {props, state} = component
      if (!props.showComponent) {
        return dom('div');
      } else {
        return dom(ComponentA);
      }
    }
  };

  var app = deku()
  app.mount(dom(ComponentB, { showComponent: true }));
  mount(app, function(){
    app.mount(dom(ComponentB, { showComponent: false }));
    assert.equal(calls, 1);
  })
});
