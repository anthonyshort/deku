/** @jsx dom */

import assert from 'assert'
import {dom,deku,render} from '../../'
import {TwoWords,mount,div,Span} from '../helpers'

it('should replace props on the app', function(){
  var app = deku()
  app.mount(<TwoWords one="Hello" two="deku" />)

  mount(app, function(el){
    app.mount(<TwoWords two="Pluto" />)
    assert.equal(el.innerHTML, '<span>undefined Pluto</span>')
  })
})

it('should have initial props', function(){
  var Component = {
    propTypes: {
      text: { type: 'string' }
    },
    render: function(component){
      let {props, state} = component
      return <div>{props.text}</div>
    },
    defaultProps: {
      text: 'Hello!'
    }
  }
  var app = deku()
  app.mount(<Component />)
  mount(app, function(el){
    assert.equal(el.innerHTML, '<div>Hello!</div>')
  })
})

it('should update on the next frame', function(done){
  var el = div();
  var app = deku();
  app.mount(<TwoWords one="Hello" two="World" />)
  var renderer = render(app, el)
  assert.equal(el.innerHTML, '<span>Hello World</span>')
  app.mount(<TwoWords one="Hello" two="Pluto" />)
  assert.equal(el.innerHTML, '<span>Hello World</span>')
  requestAnimationFrame(function(){
    assert.equal(el.innerHTML, '<span>Hello Pluto</span>')
    renderer.remove()
    done();
  });
});

it('should not update twice when setting props', function(done){
  var i = 0;

  var IncrementAfterUpdate = {
    render: function(){
      return <div></div>
    },
    afterUpdate: function(){
      i++
    }
  }

  var el = document.createElement('div')
  var app = deku()
  app.mount(<IncrementAfterUpdate text="one" />)
  var renderer = render(app, el)
  app.mount(<IncrementAfterUpdate text="two" />)
  app.mount(<IncrementAfterUpdate text="three" />)
  requestAnimationFrame(function(){
    assert.equal(i, 1)
    renderer.remove()
    done()
  })
})

it(`should update child even when the props haven't changed`, function () {
  var calls = 0;

  var Child = {
    render: function(component){
      let {props, state} = component
      calls++;
      return <span>{props.text}</span>
    }
  }

  var Parent = {
    render: function(component){
      let {props, state} = component
      return (
        <div name={props.character}>
          <Child text="foo" />
        </div>
      )
    }
  }

  var app = deku()
  app.mount(<Parent character="Link" />)

  mount(app, function(){
    app.mount(<Parent character="Zelda" />)
    assert.equal(calls, 2)
  })
})
