import {component,world,render,dom} from '../../';
import {mount} from '../helpers';
import assert from 'assert';

var updateMixin = {
  initialState: function(){
    return { count: 1 };
  },
  render: function(props, state){
    return dom('span', null, props.count);
  },
  afterMount: function(el, props, state, send){
    send({ count: 2 });
  }
};

it('should fire beforeUpdate', function () {
  var fired = false;
  var Test = component({
    beforeUpdate: function(props, state, nextProps, nextState){
      assert.equal(nextProps.count, 2);
      assert.equal(props.count, 1);
      assert.equal(nextState.count, 2);
      assert.equal(state.count, 1);
      fired = true;
    }
  });
  Test.use(updateMixin)

  var world = World().set('renderImmediate', true);
  var el = div();
  world.mount(el, Test, { count: 1 });
  world.update({ count: 2 });
  assert(fired);
})

it('should fire afterUpdate', function () {
  var fired = false;
  var Test = component({
    afterUpdate: function(props, state, prevProps, prevState){
      assert.equal(props.count, 2);
      assert.equal(prevProps.count, 1);
      assert.equal(state.count, 2);
      assert.equal(prevState.count, 1);
      fired = true;
    }
  });
  Test.use(updateMixin)

  var world = World().set('renderImmediate', true);
  var el = div();
  world.mount(el, Test, { count: 1 });
  world.update({ count: 2 });
  assert(fired);
});

it('should not allow setting the state during beforeUpdate', function (done) {
  var Impure = component({
    beforeUpdate: function(props, state, nextProps, nextState, send){
      send({ foo: 'bar' });
    }
  });
  var world = World().set('renderImmediate', true);
  var el = div();
  world.mount(el, Impure, { count: 1 });
  world.update({ count: 2 });
  try {
    renderer.render()
    throw new Error('Did not prevent set state during beforeUpdate')
  } catch(e) {
    return done()
  }
});

it('should only call `beforeUpdate` once', function(){
  var i = 0;
  var Component = component({
    beforeUpdate: function(props, state, nextProps, nextState){
      i++;
      assert(props.text === 'one');
      assert(nextProps.text === 'three');
    },
    render: function(props, state){
      return dom('div', null, [props.text]);
    }
  });

  var world = World().set('renderImmediate', true);
  var el = div();
  world.mount(Component, { text: 'one' });
  world.update({ text: 'two' })
  world.update({ text: 'three' })
  assert(i === 1);
});
