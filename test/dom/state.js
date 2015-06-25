/** @jsx dom */

import raf from 'component-raf'
import assert from 'assert'
import {component,dom,render} from '../../'
import {mount,Span,div} from '../helpers'

var StateChangeOnMount = {
  initialState: function(){
    return { text: 'foo' };
  },
  afterMount: function(component, el, setState){
    setState({ text: 'bar' });
  },
  render: function(component){
    let {props, state} = component
    return <Span text={state.text} />
  }
}

var Composed = {
  afterUpdate: function(){
    throw new Error('Parent should not be updated');
  },
  render: function(component){
    let {props, state} = component
    return <div><StateChangeOnMount /></div>
  }
}

it('should update components when state changes', function(done){
  var app = (<StateChangeOnMount />);

  var container = div()
  var rendered = render(app, container)

  assert.equal(container.innerHTML, '<span>foo</span>');

  raf(function(){
    assert.equal(container.innerHTML, '<span>bar</span>')
    rendered.remove()
    done()
  })
})

it('should update composed components when state changes', function(done){
  var app = (<Composed />)

  var container = div()
  var rendered = render(app, container)

  assert.equal(container.innerHTML, '<div><span>foo</span></div>')

  raf(function(){
    assert.equal(container.innerHTML, '<div><span>bar</span></div>')
    rendered.remove()
    done()
  })
})
