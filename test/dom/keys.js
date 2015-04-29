/** @jsx dom */

import assert from 'assert'
import {dom,deku} from '../../'
import {mount} from '../helpers'

describe.only('key diffing', function () {

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
    var app = deku()
    app.mount(
      <ul>
        <Item key="0">Zero</Item>
        <Item key="1">One</Item>
        <Item key="2">Two</Item>
      </ul>
    )
    mount(app, function(el, renderer){
      var lis = el.querySelectorAll('li')
      var zero = lis[0]
      var one = lis[1]
      var two = lis[2]
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
      var updated = el.querySelectorAll('li')
      assert(updated[3] === zero)
      assert(updated[4] === one)
      assert(updated[5] === two)
      assert(updated[0].innerHTML === "Five")
      assert(updated[1].innerHTML === "Four")
      assert(updated[2].innerHTML === "Three")
      done()
    })
  })

})
