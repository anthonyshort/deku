/** @jsx dom */

import assert from 'assert'
import {component,dom,deku} from '../../'
import {mount,div} from '../helpers'

var Toggle = {
  render(props, state) {
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
  var app = deku()
  app.mount(<Toggle showElement />)

  mount(app, function(el){
    assert.equal(el.innerHTML, '<div><span></span></div>')
    app.mount(<Toggle showText />)
    assert.equal(el.innerHTML, '<div>bar</div>')
  })
})

it('should replace text nodes with elements', function(){
  var app = deku()
  app.mount(<Toggle showText />)

  mount(app, function(el){
    assert.equal(el.innerHTML, '<div>bar</div>')
    app.mount(<Toggle showElement />)
    assert.equal(el.innerHTML, '<div><span></span></div>')
  })
});
