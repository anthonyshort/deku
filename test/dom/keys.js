/** @jsx dom */

import assert from 'assert'
import {dom,deku} from '../../'
import {mount} from '../helpers'
import trigger from 'trigger-event'

describe('key diffing', function () {

  it('should move elements with keys', function(done){
    var app = deku()
    app.mount(
      <ul>
        <li key="0">One</li>
        <li key="1">Two</li>
      </ul>
    )
    mount(app, function(el, renderer){
      var lis = el.querySelectorAll('li')
      var one = lis[0]
      var two = lis[1]
      app.mount(
        <ul>
          <li key="1">Two</li>
          <li key="0">One</li>
        </ul>
      )
      var updated = el.querySelectorAll('li')
      assert(updated[1] === one)
      assert(updated[0] === two)
      done()
    })
  })

  it('should remove elements with keys', function(done){
    var app = deku()
    app.mount(
      <ul>
        <li key="0">One</li>
        <li key="1">Two</li>
      </ul>
    )
    mount(app, function(el, renderer){
      var lis = el.querySelectorAll('li')
      var two = lis[1]
      app.mount(
        <ul>
          <li key="1">Two</li>
        </ul>
      )
      var updated = el.querySelectorAll('li')
      assert(updated[0] === two)
      done()
    })
  })

  it('should update elements with keys', function(done){
    var app = deku()
    app.mount(
      <ul>
        <li key="0">One</li>
        <li key="1">Two</li>
        <li key="2">Three</li>
      </ul>
    )
    mount(app, function(el, renderer){
      var lis = el.querySelectorAll('li')
      var one = lis[0]
      var two = lis[1]
      var three = lis[2]
      app.mount(
        <ul>
          <li key="0">One</li>
          <li key="2">Four</li>
        </ul>
      )
      var updated = el.querySelectorAll('li')
      assert(updated[0] === one)
      assert(updated[1] === three)
      assert(updated[1].innerHTML === 'Four')
      done()
    })
  })

  it('should add elements with keys', function(done){
    var app = deku()
    app.mount(
      <ul>
        <li key="0">One</li>
        <li key="1">Two</li>
        <li key="2">Three</li>
      </ul>
    )
    mount(app, function(el, renderer){
      var lis = el.querySelectorAll('li')
      var one = lis[0]
      var two = lis[1]
      var three = lis[2]
      app.mount(
        <ul>
          <li key="0">One</li>
          <li key="1">Two</li>
          <li key="3">Four</li>
          <li key="2">Three</li>
        </ul>
      )
      var updated = el.querySelectorAll('li')
      assert(updated[0] === one)
      assert(updated[1] === two)
      assert(updated[2].innerHTML === "Four")
      assert(updated[3] === three)
      done()
    })
  })

  var Item = {
    render(component) {
      return <li>{component.props.children}</li>
    }
  }

  it('should move components with keys', function(done){
    var app = deku()
    app.mount(
      <ul>
        <Item key="0">One</Item>
        <Item key="1">Two</Item>
      </ul>
    )
    mount(app, function(el, renderer){
      var lis = el.querySelectorAll('li')
      var one = lis[0]
      var two = lis[1]
      app.mount(
        <ul>
          <Item key="1">Two</Item>
          <Item key="0">One</Item>
        </ul>
      )
      var updated = el.querySelectorAll('li')
      assert(updated[1] === one)
      assert(updated[0] === two)
      done()
    })
  })

  it('should remove components with keys', function(done){
    var app = deku()
    app.mount(
      <ul>
        <Item key="0">One</Item>
        <Item key="1">Two</Item>
      </ul>
    )
    mount(app, function(el, renderer){
      var lis = el.querySelectorAll('li')
      var two = lis[1]
      app.mount(
        <ul>
          <Item key="1">Two</Item>
        </ul>
      )
      var updated = el.querySelectorAll('li')
      assert(updated[0] === two)
      done()
    })
  })

  it('should update components with keys', function(done){
    var app = deku()
    app.mount(
      <ul>
        <Item key="0">One</Item>
        <Item key="1">Two</Item>
        <Item key="2">Three</Item>
      </ul>
    )
    mount(app, function(el, renderer){
      var lis = el.querySelectorAll('li')
      var one = lis[0]
      var two = lis[1]
      var three = lis[2]
      app.mount(
        <ul>
          <Item key="0">One</Item>
          <Item key="2">Four</Item>
        </ul>
      )
      var updated = el.querySelectorAll('li')
      assert(updated[0] === one)
      assert(updated[1] === three)
      assert(updated[1].innerHTML === 'Four')
      done()
    })
  })

  it('should add components with keys', function(done){
    var app = deku(
      <ul>
        <Item key="0">Zero</Item>
        <Item key="1">One</Item>
        <Item key="2">Two</Item>
      </ul>
    )
    mount(app, function(el, renderer){
      assert.equal(el.innerHTML, `<ul><li>Zero</li><li>One</li><li>Two</li></ul>`)
      app.mount(
        <ul>
          <Item key="5">Five</Item>
          <Item key="4">Four</Item>
          <Item key="3">Three</Item>
          <Item key="0">Zero</Item>
          <Item key="1">One</Item>
          <Item key="2">Two</Item>
        </ul>
      )
      assert.equal(length(renderer.inspect().children.root), 6)
      assert.equal(el.innerHTML, `<ul><li>Five</li><li>Four</li><li>Three</li><li>Zero</li><li>One</li><li>Two</li></ul>`)
      app.mount(
        <ul>
          <Item key="6">Six</Item>
          <Item key="7">Seven</Item>
          <Item key="8">Eight</Item>
          <Item key="0">Zero</Item>
          <Item key="1">One</Item>
          <Item key="5">Five</Item>
          <Item key="3">Three</Item>
        </ul>
      )
      assert.equal(length(renderer.inspect().children.root), 7)
      assert.equal(el.innerHTML, `<ul><li>Six</li><li>Seven</li><li>Eight</li><li>Zero</li><li>One</li><li>Five</li><li>Three</li></ul>`)
      done()
    })
  })

  it('should move event handlers', function(done){
    function click() {
      done()
    }
    var app = deku(
      <ul>
        <li key="1">I do nothing</li>
        <li onClick={click} key="0">Click Me!</li>
      </ul>
    )
    mount(app, function(el, renderer){
      document.body.appendChild(el)
      app.mount(
        <ul>
          <li onClick={click} key="0">Click Me!</li>
          <li key="1">I do nothing</li>
        </ul>
      )
      var li = el.querySelectorAll('li')[0]
      trigger(li, 'click')
      document.body.removeChild(el)
    })
  })

})

function length(obj) {
  return Object.keys(obj).length
}
