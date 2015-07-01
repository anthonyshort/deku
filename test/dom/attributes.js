/** @jsx dom */

import trigger from 'trigger-event'
import raf from 'component-raf'
import assert from 'assert'
import {component,dom} from '../../'
import {mount,div} from '../helpers'

var AttrComponent = {
  render: function(component){
    let {props, state} = component
    return dom('span', { name: props.name });
  }
}

it('should add/update/remove attributes', function(){
  mount(<AttrComponent />, function(el, renderer){
    assert.equal(el.innerHTML, '<span></span>')
    renderer.mount(<AttrComponent name="Bob" />)
    assert.equal(el.innerHTML, '<span name="Bob"></span>')
    renderer.mount(<AttrComponent name="Tom" />)
    assert.equal(el.innerHTML, '<span name="Tom"></span>')
    renderer.mount(<AttrComponent name={null} />)
    assert.equal(el.innerHTML, '<span></span>')
    renderer.mount(<AttrComponent name={undefined} />)
    assert.equal(el.innerHTML, '<span></span>')
  })
})

it('should not touch the DOM if attributes have not changed', function(){
  mount(<AttrComponent name='Bob' />, function(el, renderer){
    var target = el.children[0];
    target.setAttribute = function(){
      throw new Error('should not set attributes');
    };
    renderer.mount(<AttrComponent name='Bob' />);
  })
})

it('should not touch the DOM just because attributes are falsy', function () {
  mount(<AttrComponent name="" />, function(root, renderer){
    var el = root.children[0];
    el.setAttribute = function () {
      throw new Error('should not set attributes');
    };
    el.removeAttribute = function () {
      throw new Error('should not remove attributes');
    };
    renderer.mount(<AttrComponent name="" />);
  })
})

it('should update the value of input fields', function () {
  mount(<input value="Bob" />, function(el, renderer){
    assert.equal(el.querySelector('input').value, 'Bob');
    renderer.mount(<input value="Tom" />);
    assert.equal(el.querySelector('input').value, 'Tom');
  })
})

it('should render and update innerHTML', function () {
  var Test = {
    render: function(component){
      let {props, state} = component
      return dom('div', { innerHTML: props.content });
    }
  }

  mount(<Test content="Hello <strong>deku</strong>" />, function(el, renderer){
    assert.equal(el.innerHTML,'<div>Hello <strong>deku</strong></div>')
    renderer.mount(<Test content="Hello <strong>Pluto</strong>" />)
    assert.equal(el.innerHTML,'<div>Hello <strong>Pluto</strong></div>')
  })
})

it('should render and update the checked state of a checkbox', function () {
  mount(<input checked={true} />, function (el, renderer) {
    var checkbox = el.querySelector('input');

    // initially should be checked
    assert(checkbox.checked)
    assert.equal(checkbox.getAttribute('checked'), null);

    // should now be unchecked
    renderer.mount(<input checked={false} />);
    assert(!checkbox.checked);
    assert(!checkbox.hasAttribute('checked'));
  })
})

it('should render and update a disabled input', function () {
  mount(<input disabled={true} />, function (el, renderer) {
    var checkbox = el.querySelector('input');

    // initially should be disabled
    assert(checkbox.disabled);
    assert.equal(checkbox.hasAttribute('disabled'), true);

    // should now be enabled
    renderer.mount(<input disabled={false} />);
    assert.equal(checkbox.disabled, false);
    assert.equal(checkbox.hasAttribute('disabled'), false);
  })
})

it('should render a disabled input as a boolean', function () {
  mount(<input disabled />, function (el, renderer) {
    var checkbox = el.querySelector('input');

    // initially should be disabled
    assert(checkbox.disabled);
    assert.equal(checkbox.hasAttribute('disabled'), true);

    // should now be enabled
    renderer.mount(<input />);
    assert.equal(checkbox.disabled, false);
    assert.equal(checkbox.hasAttribute('disabled'), false);
  })
})

it('should render and update a selected option', function () {
  var app = (
    <select>
      <option selected>one</option>
      <option>two</option>
    </select>
  );

  mount(app, function (el, renderer) {
    var options = el.querySelectorAll('option');
    selected(options[0])
    unselected(options[1]);

    // should now be enabled
    renderer.mount(
      <select>
        <option>one</option>
        <option selected>two</option>
      </select>
    );

    options = el.querySelectorAll('option');
    unselected(options[0]);
    selected(options[1]);
  })

  function selected(option) {
    assert(option.selected, 'selected DOM property should be true');
  }

  function unselected(option) {
    assert(!option.selected, 'selected DOM property should be false');
  }
})
