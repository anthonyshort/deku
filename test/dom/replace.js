/** @jsx dom */

import assert from 'assert'
import {component,dom} from '../../'
import {mount,div} from '../helpers'

var Toggle = {
  render(component) {
    let {props, state} = component
    if (props.showElement) {
      return <div><span></span></div>
    } else if (props.showText) {
      return <div>bar</div>
    } else {
      return <div></div>
    }
  }
}

it('should replace elements with text elements', function(){
  var app = (<Toggle showElement />)

  mount(app, function(el, renderer){
    assert.equal(el.innerHTML, '<div><span></span></div>')
    renderer.mount(<Toggle showText />)
    assert.equal(el.innerHTML, '<div>bar</div>')
  })
})

it('should replace text nodes with elements', function(){
  var app = (<Toggle showText />)

  mount(app, function(el, renderer){
    assert.equal(el.innerHTML, '<div>bar</div>')
    renderer.mount(<Toggle showElement />)
    assert.equal(el.innerHTML, '<div><span></span></div>')
  })
});
