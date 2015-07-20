/** @jsx dom */

import trigger from 'trigger-event'
import raf from 'component-raf'
import assert from 'assert'
import {component,deku} from '../../'
import dom from 'virtual-element'
import {mount,div} from '../helpers'

var AttrComponent = {
  render: function(component){
    let {props, state} = component
    return dom('span', { name: props.name });
  }
}

it('should add/update/remove attributes', function(){
  var app = deku()
  app.mount(<AttrComponent />);
  mount(app, function(el){
    assert.equal(el.innerHTML, '<span></span>')
    app.mount(<AttrComponent name="Bob" />)
    assert.equal(el.innerHTML, '<span name="Bob"></span>')
    app.mount(<AttrComponent name="Tom" />)
    assert.equal(el.innerHTML, '<span name="Tom"></span>')
    app.mount(<AttrComponent name={null} />)
    assert.equal(el.innerHTML, '<span></span>')
    app.mount(<AttrComponent name={undefined} />)
    assert.equal(el.innerHTML, '<span></span>')
  })
})

it('should not touch the DOM if attributes have not changed', function(){
  var app = deku()
  app.mount(<AttrComponent name='Bob' />);
  mount(app, function(el){
    var target = el.children[0];
    target.setAttribute = function(){
      throw new Error('should not set attributes');
    };
    app.mount(<AttrComponent name='Bob' />);
  })
})

it('should not touch the DOM just because attributes are falsy', function () {
  var app = deku()
  app.mount(<AttrComponent name="" />);
  mount(app, function(root){
    var el = root.children[0];
    el.setAttribute = function () {
      throw new Error('should not set attributes');
    };
    el.removeAttribute = function () {
      throw new Error('should not remove attributes');
    };
    app.mount(<AttrComponent name="" />);
  })
})

it('should update the value of input fields', function () {
  var app = deku()
  app.mount(<input value="Bob" />);

  mount(app, function(el){
    assert.equal(el.querySelector('input').value, 'Bob');
    app.mount(<input value="Tom" />);
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

  var app = deku()
  app.mount(<Test content="Hello <strong>deku</strong>" />)

  mount(app, function(el){
    assert.equal(el.innerHTML,'<div>Hello <strong>deku</strong></div>')
    app.mount(<Test content="Hello <strong>Pluto</strong>" />)
    assert.equal(el.innerHTML,'<div>Hello <strong>Pluto</strong></div>')
  })
})

it('should render and update the checked state of a checkbox', function () {
  var app = deku();
  app.mount(<input checked={true} />);

  mount(app, function (el) {
    var checkbox = el.querySelector('input');

    // initially should be checked
    assert(checkbox.checked)
    assert.equal(checkbox.getAttribute('checked'), null);

    // should now be unchecked
    app.mount(<input checked={false} />);
    assert(!checkbox.checked);
    assert(!checkbox.hasAttribute('checked'));
  })
})

it('should render and update a disabled input', function () {
  var app = deku();
  app.mount(<input disabled={true} />);

  mount(app, function (el) {
    var checkbox = el.querySelector('input');

    // initially should be disabled
    assert(checkbox.disabled);
    assert.equal(checkbox.hasAttribute('disabled'), true);

    // should now be enabled
    app.mount(<input disabled={false} />);
    assert.equal(checkbox.disabled, false);
    assert.equal(checkbox.hasAttribute('disabled'), false);
  })
})

it('should render a disabled input as a boolean', function () {
  var app = deku();
  app.mount(<input disabled />);

  mount(app, function (el) {
    var checkbox = el.querySelector('input');

    // initially should be disabled
    assert(checkbox.disabled);
    assert.equal(checkbox.hasAttribute('disabled'), true);

    // should now be enabled
    app.mount(<input />);
    assert.equal(checkbox.disabled, false);
    assert.equal(checkbox.hasAttribute('disabled'), false);
  })
})

it('should render and update a selected option', function () {
  var app = deku();
  app.mount(
    <select>
      <option selected>one</option>
      <option>two</option>
    </select>
  );

  mount(app, function (el) {
    var options = el.querySelectorAll('option');
    selected(options[0])
    unselected(options[1]);

    // should now be enabled
    app.mount(
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
