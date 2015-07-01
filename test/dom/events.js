/** @jsx dom */

import assert from 'assert'
import {dom,render} from '../../'
import {mount,Span,div} from '../helpers'
import trigger from 'trigger-event'
import raf from 'component-raf'
import classes from 'component-classes'

var Delegate = {
  render: function (component) {
    let {props, state} = component
    var active = state.active || 0;
    var self = this;
    var items = [1,2,3].map(function(i){
      return dom('li', {
        onClick: function(e, component, setState){
          setState({ active: i })
        },
        class: { active: active === i }
      }, [
        dom('a', 'link')
      ]);
    });
    return dom('ul', items);
  }
}

it('should add click event', function(){
  var count = 0;
  var Page = {
    render: function(component){
      let {props, state} = component
      return <span onClick={onclick}>Hello World</span>
    }
  }

  var app = (<Page x={20} />)

  mount(app, function(el){
    document.body.appendChild(el);
    assert.equal(el.innerHTML, '<span>Hello World</span>')
    trigger(el.querySelector('span'), 'click')
    assert.equal(count, 1)
    document.body.removeChild(el);
  })

  function onclick(e, component) {
    let {props, state} = component
    assert(props.x, 10);
    ++count;
  }
});

it('should remove click event', function(done){
  var count = 0;
  var rootEl;

  var Page = {
    render: function(component){
      let {props, state} = component
      if (props.click) {
        return <span onClick={onclick}>Hello World</span>
      } else {
        return <span>Hello World</span>
      }
    },
    afterUpdate: function(){
      trigger(rootEl.querySelector('span'), 'click')
      assert.equal(count, 1)
      done()
    }
  }

  var el = div();
  var app = (<Page click={true} />)

  mount(app, function(el, renderer){
    document.body.appendChild(el);
    rootEl = el
    trigger(el.querySelector('span'), 'click')
    assert.equal(count, 1)
    renderer.mount(<Page click={false} />)
    trigger(el.querySelector('span'), 'click')
    assert.equal(count, 1)
    document.body.removeChild(el);
  })

  function onclick() {
    ++count;
  }
});

it('should update click event', function(){
  var count = 0;

  var Page = {
    render: function(component){
      let {props, state} = component
      return <span onClick={props.clicker}>Hello World</span>
    }
  }

  var el = div();
  var app = (<Page clicker={onclicka} />)

  mount(app, function(el, renderer){
    document.body.appendChild(el);
    trigger(el.querySelector('span'), 'click');
    assert.equal(count, 1)
    renderer.mount(<Page clicker={onclickb} />)
    trigger(el.querySelector('span'), 'click')
    assert.equal(count, 0)
    document.body.removeChild(el);
  })

  function onclicka() {
    count += 1;
  }

  function onclickb() {
    count -= 1;
  }
})

it('should delegate events', function () {
  var app = (<Delegate />)

  mount(app, function(el){
    document.body.appendChild(el);
    var first = el.querySelectorAll('a')[0]
    trigger(first, 'click')
    assert(classes(first.parentNode).has('active'));
    var second = el.querySelectorAll('a')[1];
    trigger(second, 'click');
    assert(classes(second.parentNode).has('active'));
    assert(classes(first.parentNode).has('active') === false)
    document.body.removeChild(el);
  })
})

it('should delegate events on the root', function () {
  var DelegateRoot = {
    render: function (component, setState) {
      let {props, state} = component
      return (
        <div class={{ active: state.active }} onClick={onClick}>
          <a>link</a>
        </div>
      )
      function onClick(event, component, setState) {
        setState({ active: true });
      }
    }
  }

  var app = (<DelegateRoot />);

  mount(app, function(el){
    document.body.appendChild(el);
    var first = el.querySelectorAll('a')[0]
    trigger(first, 'click')
    assert(classes(first.parentNode).has('active') === true)
    document.body.removeChild(el);
  })
})

it('should set a delegateTarget', function (done) {
  var rootEl;

  var DelegateRoot = {
    render: function (component) {
      let {props, state} = component
      return <div onClick={onClick}><a>link</a></div>;
      function onClick(event) {
        assert(event.delegateTarget === rootEl.querySelector('div'));
        done();
      }
    }
  }

  var app = (<DelegateRoot />);

  mount(app, function(el){
    document.body.appendChild(el);
    rootEl = el
    var first = el.querySelectorAll('a')[0]
    trigger(first, 'click')
    document.body.removeChild(el);
  })
})

it('should update events when nested children are removed', function () {

  var items = [
    { text: 'one' },
    { text: 'two' },
    { text: 'three' }
  ];

  var Button = {
    render: function(component){
      let {props, state} = component
      return <a onClick={props.onClick}>link</a>
    }
  }

  var ListItem = {
    render: function(component){
      let {props, state} = component
      function remove(e) {
        items.splice(props.index, 1)
      }
      return (
        <li>
          <Button onClick={remove} />
        </li>
      )
    }
  }

  var List = {
    render: function (component) {
      let {props, state} = component
      return (
        <ul>
          {props.items.map(function(item, i){
            return <ListItem data={item} index={i} items={props.items} />
          })}
        </ul>
      )
    }
  }

  var app = (<List items={items} />)

  mount(app, function(el, renderer){
    document.body.appendChild(el);
    trigger(el.querySelector('a'), 'click')
    renderer.mount(<List items={items} />)
    trigger(el.querySelector('a'), 'click')
    renderer.mount(<List items={items} />)
    trigger(el.querySelector('a'), 'click')
    renderer.mount(<List items={items} />)
    assert.equal(el.innerHTML, '<ul></ul>')
    document.body.removeChild(el);
  })
});

it('should remove handlers when an element is removed', function (done) {
  function fn(){}
  var Toggle = {
    render: function(component){
      let {props, state} = component
      if (!props.showChildren) {
        return (
          <div></div>
        )
      } else {
        return (
          <div>
            <span onClick={fn}></span>
          </div>
        )
      }
    }
  }
  var app = (
    <div>
      <Toggle showChildren />
      <div onClick={fn}></div>
    </div>
  )
  mount(app, function(el, renderer){
    renderer.mount(
      <div>
        <Toggle />
      </div>
    )
    var state = renderer.inspect()
    for (var entityId in state.handlers) {
      assert.equal(Object.keys(state.handlers[entityId]).length, 0)
    }
    done()
  })
})

it.skip('should keep focus on elements', function () {
  var App = {
    render: function(comp, next) {
      var state = comp.state;
      var a = state.a;
      var b = state.b;

      function one(e) {
        next({one: e.target.value});
      }

      function two(e) {
        next({two: e.target.value});
      }

      return dom('div', [
        dom('input', {onChange: one, value: a}),
        dom('input', {onChange: two, value: b})
      ]);
    }
  };


  var app = dom(App);
  mount(app, function(el){
    document.body.appendChild(el)
    var inputs = el.querySelectorAll('input')
    var one = inputs[0]
    var two = inputs[1]
    one.focus()
    assert(document.activeElement === one)
    trigger(two, 'click')
    assert(document.activeElement === two)
    document.body.removeChild(el)
  })
});
