/** @jsx dom */

import trigger from 'trigger-event'
import raf from 'component-raf'
import assert from 'assert'
import {component,dom,deku} from '../../'
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

it('should update the real value of input fields', function () {
  var Input = {
    render: function(component){
      let {props, state} = component
      return dom('input', { value: props.value })
    }
  };

  var app = deku()
  app.mount(<Input value="Bob" />);

  mount(app, function(el){
    assert.equal(el.querySelector('input').value, 'Bob');
    app.mount(<Input value="Tom" />);
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

it('should render a checked checkbox properly', function () {
  var Input = {
    render: function ({ props }) {
      return dom('input', { type: 'checkbox', checked: props.checked })
    }
  }

  var app = deku();
  app.mount(<Input checked={true} />);

  mount(app, function (el) {
    var checkbox = el.querySelector('input');

    // initially should be checked
    assert(checkbox.checked)
    assert.equal(checkbox.getAttribute('checked'), 'checked');

    // should now be unchecked
    app.mount(<Input checked={false} />);
    assert(!checkbox.checked);
    assert(!checkbox.hasAttribute('checked'));
  })
})

it('should render a disabled input properly', function () {
  var Input = {
    render: function ({ props }) {
      return dom('input', { disabled: props.disabled });
    }
  }

  var app = deku();
  app.mount(<Input disabled={true} />);

  mount(app, function (el) {
    var checkbox = el.querySelector('input');

    // initially should be disabled
    assert(checkbox.disabled);
    assert.equal(checkbox.getAttribute('disabled'), 'disabled');

    // should now be enabled
    app.mount(<Input disabled={false} />);
    assert(!checkbox.disabled);
    assert(!checkbox.hasAttribute('disabled'));
  })
})

it('should render a selected option properly', function () {
  var Select = {
    render: function ({ props }) {
      return dom('select', [
        dom('option', { selected: props.selected })
      ]);
    }
  }

  var app = deku();
  app.mount(<Select selected={true} />);

  mount(app, function (el) {
    var option = el.querySelector('option');

    // initially should be disabled
    assert(option.selected);
    assert.equal(option.getAttribute('selected'), 'selected');

    // should now be enabled
    app.mount(<Select selected={false} />);
    assert(!option.selected);
    assert(!option.hasAttribute('selected'));
  })
})

it('should render a defaultValue input properly', function () {
  var Input = {
    render: function ({ props }) {
      return dom('input', { defaultValue: props.defaultValue });
    }
  }

  var app = deku();
  app.mount(<Input defaultValue='hello world' />);

  mount(app, function (el) {
    var input = el.querySelector('input');

    // initially should be disabled
    assert.equal(input.defaultValue, 'hello world');
    assert(!input.hasAttribute('defaultValue'));

    // should now be enabled
    app.mount(<Input defaultValue={false} />);
    assert(!input.defaultValue);
    assert(!input.hasAttribute('defaultValue'));
  })
})

it('should render a defaultChecked checkbox properly', function () {
  var Input = {
    render: function ({ props }) {
      return dom('input', { type: 'checkbox', defaultChecked: props.defaultChecked });
    }
  }

  var app = deku();
  app.mount(<Input defaultChecked={true} />);

  mount(app, function (el) {
    var input = el.querySelector('input');

    // initially should be disabled
    assert(input.defaultChecked);
    assert(!input.hasAttribute('defaultChecked'));

    // should now be enabled
    app.mount(<Input defaultChecked={false} />);
    assert(!input.defaultChecked);
    assert(!input.hasAttribute('defaultChecked'));
  })
})
