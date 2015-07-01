/** @jsx dom */

import assert from 'assert'
import {component, dom} from '../../'
import {mount, div} from '../helpers'

it('should render statics', function(){

  var Component = {
    dependencies: {
      text: 'text'
    },
    render: function({props}) {
      return <div>{props.text}</div>
    }
  }

  var App = {
    statics: {
      'text': 'Hello World'
    },
    render: function(component){
      return <Component/>
    }
  };

  var app = (<App/>)
  mount(app, function(el, renderer) {
    assert.equal(el.innerHTML, '<div>Hello World</div>')
  })

});


it('should only render parent statics', function(){

  var C2 = {
    dependencies: {
      text: 'text'
    },
    render: function({props}) {
      return <div>{props.text}</div>
    }
  }

  var C1 = {
    statics: {
      'text': 'Goodbye World'
    },
    render: function(component){
      return <C2/>
    }
  };

  var App = {
    statics: {
      'text': 'Hello World'
    },
    render: function(component){
      return (
        <div>
          <C1/>
          <C2/>
        </div>
      )
    }
  };

  var app = (<App/>)
  mount(app, function(el, renderer) {
    assert.equal(el.innerHTML, '<div><div>Goodbye World</div><div>Hello World</div></div>')
  })

});
