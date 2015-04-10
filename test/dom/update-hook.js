import {component,deku,render,dom} from '../../';
import {mount,div} from '../helpers';
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

it('should fire beforeUpdate', function(done){
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

  var app = deku();
  var el = div();
  app.layer('main', el);
  app.mount(Test, { count: 1 });
  app.update({ count: 2 });
  requestAnimationFrame(function(){
    assert(fired);
    done();
  });
})

it('should fire afterUpdate', function(done){
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

  var app = deku();
  var el = div();
  app.layer('main', el);
  app.mount(Test, { count: 1 });
  app.update({ count: 2 });
  requestAnimationFrame(function(){
    assert(fired);
    done();
  });
});

it('should not allow setting the state during beforeUpdate', function(done){
  var Impure = component({
    beforeUpdate: function(props, state, nextProps, nextState, send){
      send({ foo: 'bar' });
    }
  });
  var app = deku();
  var el = div();
  app.layer('main', el);
  app.mount(Impure, { count: 1 });
  try {
    app.set('renderImmediate', true);
    app.update({ count: 2 });
    throw new Error('Did not prevent set state during beforeUpdate')
  } catch(e) {
    return done();
  }
});

it('should only call `beforeUpdate` once', function(done){
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

  var app = deku();
  var el = div();
  app.layer('main', el);
  app.mount(Component, { text: 'one' });
  app.update({ text: 'two' })
  app.update({ text: 'three' });
  requestAnimationFrame(function(){
    assert(i === 1);
    done();
  });
});
