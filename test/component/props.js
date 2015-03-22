import raf from 'component-raf'
import assert from 'assert'
import {component,dom,scene} from '../../'
import {TwoWords,mount,Span} from '../helpers'

var Test = component(TwoWords);

it('should replace props on the scene', function(){
  var app = scene(Test)
    .setProps({ one: 'Hello', two: 'World' })

  mount(app, function(el, renderer){
    app.replaceProps({ one: 'Hello' })
    renderer.render()
    assert.equal(el.innerHTML, '<span>Hello undefined</span>')
  })
});

it('should merge props on the scene', function(){
  var app = scene(Test)
    .setProps({ one: 'Hello', two: 'World' })

  mount(app, function(el, renderer){
    app.setProps({ two: 'Pluto' })
    renderer.render()
    assert.equal(el.innerHTML, '<span>Hello Pluto</span>')
  })
});

it('should replace then set props on the scene', function(){
  var app = scene(Test)
    .setProps({ one: 'Hello', two: 'World' })

  mount(app, function(el, renderer){
    app.replaceProps({ one: 'Hello' });
    app.setProps({ two: 'Pluto' });
    renderer.render()
    assert.equal(el.innerHTML, '<span>Hello Pluto</span>')
  })
});

it('should update on the next frame', function(){
  var app = scene(Test)
    .setProps({ one: 'Hello', two: 'World' })

  mount(app, function(el, renderer){
    app.setProps({ one: 'Hello', two: 'Pluto' });
    assert.equal(el.innerHTML, '<span>Hello World</span>')
  })
});

it('should not update props if the scene is removed', function (done) {
  var app = scene(component(Span))
    .setProps({ text: 'foo' })

  mount(app, function(el, renderer){
    renderer.update = function(){
      done(false)
    }
    app.setProps({ text: 'bar' });
    renderer.remove();
    raf(function(){
      done()
    });
  })
});

it.skip('should setProps and call the callback', function(done){
  // Deprecated
});

it.skip('should return a promise when changing the props', function(done){
  // Deprecated
});

it.skip('should still call all callbacks even if it doesn\'t change', function(){
  // Deprecated
});

it('should not update twice when setting props', function(){
  var i = 0;
  var IncrementAfterUpdate = component({
    afterUpdate: function(){
      i++;
    }
  });

  var app = scene(IncrementAfterUpdate)
    .setProps({ text: 'one' })

  mount(app, function(el, renderer){
    app.setProps({ text: 'two' });
    app.setProps({ text: 'three' });
    renderer.render();
    assert.equal(i, 1);
  })
});

it('should update child even when the props haven\'t changed', function () {
  var calls = 0;

  var Child = component({
    render: function(props, state){
      calls++;
      return dom('span', null, [props.text]);
    }
  });

  var Parent = component({
    render: function(props, state){
      return dom('div', { name: props.character }, [
        dom(Child, { text: 'foo' })
      ]);
    }
  });

  var app = scene(Parent)
    .setProps({ character: 'Link' })

  mount(app, function(el, renderer){
    app.setProps({ character: 'Zelda' });
    renderer.render();
    assert.equal(calls, 2);
  })
});

it.skip('should call propsChanged when props are changed', function (done) {
  var Test = component({
    propsChanged: function(nextProps){
      assert(nextProps.foo);
      done();
    }
  });

  var app = scene(Test)
    .setProps({ foo: false })

  mount(app, function(el, renderer){
    app.setProps({ foo: true });
    renderer.render();
  })
});

it('should call propsChanged on child components', function (done) {
  var Child = component({
    propsChanged: function(nextProps){
      assert(nextProps.count === 1);
      done();
    }
  });
  var Parent = component({
    render: function(props){
      return dom(Child, { count: props.count });
    }
  });

  var app = scene(Parent)
    .setProps({ count: 0 })

  mount(app, function(el, renderer){
    app.setProps({ count: 1 });
    renderer.render();
  })
});

it.skip('should not call propsChanged on child components when they props don\'t change', function () {
  var Child = component({
    propsChanged: function(nextProps){
      throw new Error('Child should not be called');
    }
  });
  var Parent = component({
    render: function(props){
      return dom(Child);
    }
  });
  var scene = Parent.render(el, { count: 0 });
  scene.update();
  scene.setProps({ count: 1 });
  scene.update();
  scene.remove();
});

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

it.skip('should remove the .props property', function () {
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

