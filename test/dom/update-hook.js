/** @jsx dom */

import raf from 'component-raf'
import {component,render,dom} from '../../';
import {mount,div} from '../helpers';
import assert from 'assert';

var Updater = {
  initialState: function(){
    return { count: 1 };
  },
  render: function(component){
    let {props, state} = component
    return dom('span', null, props.count);
  },
  afterMount: function(component, el, setState){
    setState({ count: 2 });
  }
};

it('should fire beforeUpdate', function(done){
  var fired = false;

  var Test = {
    initialState: function(){
      return { count: 1 };
    },
    render: function(component){
      let {props, state} = component
      return dom('span', null, props.count);
    },
    beforeUpdate: function(component, nextProps, nextState){
      let {props, state} = component
      assert.equal(nextProps.count, 2);
      assert.equal(props.count, 1);
      assert.equal(nextState.count, 2);
      assert.equal(state.count, 1);
      fired = true;
    },
    afterMount: function(component, el, setState){
      setState({ count: 2 });
    }
  }

  var app = (<Test count={1} />)

  mount(app, function(el, renderer){
    renderer.mount(<Test count={2} />)
    assert(fired);
    done();
  })
})

it('should fire afterUpdate', function(done){
  var fired = false;

  var Test = {
    initialState: function(){
      return { count: 1 };
    },
    render: function(component){
      let {props, state} = component
      return dom('span', null, props.count);
    },
    afterUpdate: function(component, prevProps, prevState){
      let {props, state} = component
      assert.equal(props.count, 2);
      assert.equal(prevProps.count, 1);
      assert.equal(state.count, 2);
      assert.equal(prevState.count, 1);
      fired = true;
    },
    afterMount: function(component, el, setState){
      setState({ count: 2 });
    }
  }

  var app = (<Test count={1} />)

  mount(app, function(el, renderer){
    renderer.mount(<Test count={2} />)
    assert(fired);
    done();
  })
});

it('should only call `beforeUpdate` once', function(done){
  var i = 0;
  var Component = {
    beforeUpdate: function(component, nextProps, nextState){
      let {props, state} = component
      i++;
      assert(props.text === 'one');
      assert(nextProps.text === 'three');
    },
    render: function(props, state){
      return <div>{props.text}</div>
    }
  };

  var el = document.createElement('div')
  var app = (<Component text="one" />)

  var renderer = render(app, el)

  renderer.mount(<Component text="two" />)
  renderer.mount(<Component text="three" />)

  raf(function(){
    assert(i === 1)
    renderer.remove()
    done();
  })
});
