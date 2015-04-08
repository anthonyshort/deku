import assert from 'assert'
import {component,dom,World} from '../../'
import {TwoWords,mount,div,Span} from '../helpers'

var Test = component(TwoWords);

it('should merge props on the world', function(){
  var world = World().set('renderImmediate', true);
  var el = div();
  world.mount(el, Test, { one: 'Hello', two: 'World' });

  world.update({ two: 'Pluto' })
  assert.equal(el.innerHTML, '<span>Hello Pluto</span>')
});

it('should update on the next frame', function(done){
  var world = World();
  var el = div();
  world.mount(el, Test, { one: 'Hello', two: 'World' });

  world.update({ one: 'Hello', two: 'Pluto' });
  assert.equal(el.innerHTML, '<span>Hello World</span>');
  requestAnimationFrame(function(){
    assert.equal(el.innerHTML, '<span>Hello Pluto</span>');
    done();
  });
});

it.skip('should not update props if the world is removed', function (done) {
  var Test = component(Span);
  var world = World();
  var el = div();
  world.mount(el, Test, { text: 'foo' });
  var renderer = world.renderer;

  renderer.update = function(){
    done(false)
  }

  world.update({ text: 'bar' });
  world.remove();
  requestAnimationFrame(function(){
    done()
  });
});

it('should not update twice when setting props', function(done){
  var i = 0;
  var IncrementAfterUpdate = component({
    afterUpdate: function(){
      i++;
    }
  });

  var world = World();
  var el = div();
  world.mount(el, IncrementAfterUpdate, { text: 'one' });
  world.update({ text: 'two' });
  world.update({ text: 'three' });
  requestAnimationFrame(function(){
    assert.equal(i, 1);
    done();
  });
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

  var world = World().set('renderImmediate', true);
  var el = div();
  world.mount(el, Parent, { character: 'Link' });
  world.update({ character: 'Zelda' });
  assert.equal(calls, 2);
});
