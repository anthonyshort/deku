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
      done()
    })
  })

})

