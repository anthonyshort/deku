import {component,scene,render,dom} from '../../';
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
  var app = scene(Test)
  app.setProps({ count: 1 })
  mount(app, function(el, renderer){
    app.setProps({count:2})
    renderer.render()
    assert(fired)
  })
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
  var app = scene(Test)
  app.setProps({ count: 1 })
  mount(app, function(el, renderer){
    app.setProps({count:2})
    renderer.render()
    assert(fired)
  })
});

it('should not allow setting the state during beforeUpdate', function (done) {
  var Impure = component({
    beforeUpdate: function(props, state, send){
      send({ foo: 'bar' });
    }
  });
  var app = scene(Impure)
  app.setProps({ count: 1 })
  mount(app, function(el, renderer){
    app.setProps({count:2})
    try {
      renderer.render()
      throw new Error('Did not prevent set state during beforeUpdate')
    } catch(e) {
      return done()
    }
  })
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
  var app = scene(Component)
  app.setProps({ text: 'one' })
  mount(app, function(el, renderer){
    app.setProps({ text: 'two' })
    app.setProps({ text: 'three' })
    renderer.render()
    assert(i === 1)
  })
});
