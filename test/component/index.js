import type from 'component-type';
import assert from 'assert';
import {component,dom} from '../../';
import {Span} from '../helpers';

it('should define a component', function(){
  var Test = component();
  assert(type(Test) === 'function')
})

it('should create a component with just a render function', function () {
  var Test = component(function(){
    return dom('span');
  })
  assert(Test.prototype.render)
})

it('should mixin plugins when they are objects', function () {
  var plugin = {
    render: function() {
      return dom('span');
    }
  };
  var Test = component()
  Test.use(plugin)
  assert(Test.prototype.render)
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

it('should bind `this` to any method', function(done){
  var Page = component({
    hack: function(){
      assert(this instanceof Page);
      done();
    }
  });
  var page = new Page()
  page.hack()
})

it('should compose without needing to use dom object', function () {
  var Component = component()
  var vnode = Component({ text: 'foo' })
  assert.equal(vnode.type, 'component')
  assert.equal(vnode.props.text, 'foo')
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
  var app = scene(Test)
  mount(app)
});

