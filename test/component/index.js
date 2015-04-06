import type from 'component-type';
import assert from 'assert';
import {component,dom} from '../../';
import {Span} from '../helpers';

it('should define a component', function(){
  var Test = component();
  assert(type(Test) === 'object')
})

it('should create a component with just a render function', function () {
  var Test = component(function(){
    return dom('span');
  })
  assert(Test.render);
})

it('should mixin plugins when they are objects', function () {
  var plugin = {
    render: function() {
      return dom('span');
    }
  };
  var Test = component()
  Test.use(plugin)
  assert(Test.render)
})

it('should call plugins when they are functions', function (done) {
  var Test;
  function plugin(Component) {
    assert.equal(Component, Test);
    done();
  };
  Test = component();
  Test.use(plugin);
})

it('should define properties using the functional API', function () {
  var Test = component()
    .prop('test', { foo: 'bar' });
  assert(Test.props.test);
  assert(Test.props.test.foo === 'bar');
});

it('should define properties using the classic API', function () {
  var Test = component({
    props: {
      test: { foo: 'bar' }
    }
  });
  assert(Test.props.test);
  assert(Test.props.test.foo === 'bar');
});

it.skip(`should remove the .props property so it can't be accessed`, function () {
  var Test = component({
    props: {
      test: { foo: 'bar' }
    },
    beforeMount: function(){
      assert(this.props == null);
    }
  });
  var app = world(Test)
  mount(app)
});

it('should define custom layers', function(){
  var Test = component()
    .layer('main', main)
    .layer('overlay', overlay)
    .layer('tooltip', tooltip, {
      initial: { x: 10 }
    });

  assert.equal(Test.layers.main.template, main);
  assert.equal(Test.layers.overlay.template, overlay);
  assert.equal(Test.layers.tooltip.template, tooltip);
  assert.equal(Test.layers.tooltip.states.initial.x, 10);

  function main(){}
  function overlay(){}
  function tooltip(){}
});
