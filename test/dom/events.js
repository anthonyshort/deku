/** @jsx dom */

import assert from 'assert'
import {dom,deku} from '../../'
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

  var app = deku()
  app.mount(<Page x={20} />)

  mount(app, function(el, renderer){
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

  var app = deku()
  var el = div();
  app.mount(<Page click={true} />)

  mount(app, function(el){
    document.body.appendChild(el);
    rootEl = el
    trigger(el.querySelector('span'), 'click')
    assert.equal(count, 1)
    app.mount(<Page click={false} />)
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

  var app = deku()
  var el = div();
  app.mount(<Page clicker={onclicka} />)

  mount(app, function(el, renderer){
    document.body.appendChild(el);
    trigger(el.querySelector('span'), 'click');
    assert.equal(count, 1)
    app.mount(<Page clicker={onclickb} />)
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
  var app = deku()
  app.mount(<Delegate />)

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

  var app = deku()
  app.mount(<DelegateRoot />);

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

  var app = deku()
  app.mount(<DelegateRoot />);

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
        console.log(items)
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

  var app = deku()
  app.mount(<List items={items} />)

  mount(app, function(el){
    document.body.appendChild(el);
    trigger(el.querySelector('a'), 'click')
    app.mount(<List items={items} />)
    trigger(el.querySelector('a'), 'click')
    app.mount(<List items={items} />)
    trigger(el.querySelector('a'), 'click')
    app.mount(<List items={items} />)
    assert.equal(el.innerHTML, '<ul></ul>')
    document.body.removeChild(el);
  })
});
