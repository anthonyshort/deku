
import assert from 'assert'
import {component,dom,world} from '../../'
import {mount,Span} from '../helpers'
import trigger from 'trigger-event'
import raf from 'component-raf'
import classes from 'component-classes'

var Delegate = component({
  render: function (props, state, send) {
    var active = state.active || 0;
    var self = this;
    var items = [1,2,3].map(function(i){
      return dom('li', {
        onClick: function(){
          send({ active: i })
        },
        class: { active: active === i }
      }, [
        dom('a', 'link')
      ]);
    });
    return dom('ul', items);
  }
});

it('should add click event', function(){
  var count = 0;
  var Page = component({
    render: function(props, state){
      return dom('span', { onClick: onclick }, ['Hello World']);
    }
  });

  var app = world(Page)
    .setProps({ x: 20 })

  mount(app, function(el, renderer){
    assert.equal(el.innerHTML, '<span>Hello World</span>')
    trigger(el.querySelector('span'), 'click')
    assert.equal(count, 1)
  })

  function onclick(e, props, state) {
    assert(props.x, 10);
    ++count;
  }
});

it('should remove click event', function(done){
  var count = 0;
  var rootEl;

  var Page = component({
    render: function(props, state){
      if (props.click) {
        return dom('span', { onClick: onclick }, ['Hello World']);
      } else {
        return dom('span', {}, ['Hello World']);
      }
    },
    afterUpdate: function(){
      trigger(rootEl.querySelector('span'), 'click');
      assert.equal(count, 1);
      done();
    }
  });

  var app = world(Page)
    .setProps({ click: true })

  mount(app, function(el, renderer){
    rootEl = el
    trigger(el.querySelector('span'), 'click')
    assert.equal(count, 1)
    app.setProps({ click: false })
    renderer.render()
    assert.equal(count, 1)
  })

  function onclick() {
    ++count;
  }
});

it('should update click event', function(){
  var count = 0;

  var Page = component({
    render: function(props, state){
      return dom('span', { onClick: props.click }, ['Hello World']);
    }
  });

  var app = world(Page)
    .setProps({ click: onclicka })

  mount(app, function(el, renderer){
    trigger(el.querySelector('span'), 'click');
    assert.equal(count, 1);
    app.setProps({ click: onclickb })
    renderer.render()
    trigger(el.querySelector('span'), 'click')
    assert.equal(count, 0)
  })

  function onclicka() {
    count += 1;
  }

  function onclickb() {
    count -= 1;
  }
});

it('should delegate events', function () {
  var app = world(Delegate)

  mount(app, function(el, renderer){
    var first = el.querySelectorAll('a')[0]
    trigger(first, 'click')
    renderer.render()
    assert(classes(first.parentNode).has('active'));
    var second = el.querySelectorAll('a')[1];
    trigger(second, 'click');
    renderer.render()
    assert(classes(second.parentNode).has('active'));
    assert(classes(first.parentNode).has('active') === false);
  })
});

it('should delegate events on the root', function () {
  var DelegateRoot = component({
    render: function (props, state, send) {
      return dom('div', { class: { active: state.active }, onClick: onClick }, [
        dom('a', 'link')
      ]);

      function onClick(event) {
        send({ active: true });
      }
    }
  });

  var app = world(DelegateRoot)

  mount(app, function(el, renderer){
    var first = el.querySelectorAll('a')[0]
    trigger(first, 'click')
    renderer.render()
    assert(classes(first.parentNode).has('active') === true)
  })
});

it('should set a delegateTarget', function (done) {
  var rootEl;

  var DelegateRoot = component({
    render: function (props, state) {
      return dom('div', { onClick: onClick }, [
        dom('a', 'link')
      ]);

      function onClick(event) {
        assert(event.delegateTarget === rootEl.querySelector('div'));
        done();
      }
    }
  });

  var app = world(DelegateRoot)

  mount(app, function(el, renderer){
    rootEl = el
    var first = el.querySelectorAll('a')[0]
    trigger(first, 'click')
  })
});

it('should update events when nested children are removed', function () {

  var items = [
    { text: 'one' },
    { text: 'two' },
    { text: 'three' }
  ];

  var Button = component({
    render: function(props, state){
      return dom('a', { onClick: props.onClick })
    }
  });

  var ListItem = component({
    render: function(props, state){
      return dom('li', [
        dom(Button, {
          onClick: function(){
            items.splice(props.index, 1);
          }
        })
      ]);
    }
  });

  var List = component({
    render: function (props, state) {
      return dom('ul', [
        props.items.map(function(item, i){
          return dom(ListItem, {
            data: item,
            index: i,
            items: props.items
          });
        })
      ]);
    }
  });

  var app = world(List)
    .setProps({ items: items })

  mount(app, function(el, renderer){
    trigger(el.querySelector('a'), 'click')
    app.setProps({ items: items })
    renderer.render()
    trigger(el.querySelector('a'), 'click')
    app.setProps({ items: items })
    renderer.render()
    trigger(el.querySelector('a'), 'click')
    app.setProps({ items: items })
    renderer.render()
    assert.equal(el.innerHTML, '<ul></ul>')
  })
});
