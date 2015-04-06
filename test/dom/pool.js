import assert from 'assert'
import {component,dom,world} from '../../'
import {mount} from '../helpers'

// Helpers.

function render(props) {
  var attrs = {};
  if (props.attr) attrs[props.attr] = props.value;
  return dom('div#foo', [
    dom(props.type, attrs, [
      'boo',
      dom('strong', attrs),
      'bar'
    ])
  ])
}

// Tests.

it('should pool dom nodes', function(){
  var mounted;
  var Component = component(render)

  var app = world(Component)
    .setProps({ type: 'div', attr: 'foo', value: 'bar' })

  mount(app, function(el, renderer){
    mounted = renderer

    // Switch the nodes back and forth to trigger the pooling
    var target = el.querySelector('#foo div')
    var deepTarget = el.querySelector('strong')

    app.replaceProps({ type: 'span' })
    renderer.render()
    app.replaceProps({ type: 'div' })
    renderer.render()

    var next = el.querySelector('#foo div')
    var deepNext = el.querySelector('strong')

    // It should re-use the same div for the update
    assert.equal(target, next)

    // It should re-use deeply nested nodes
    assert.equal(deepTarget, deepNext)

    // It should have placed the span back in the pool
    assert.equal(renderer.pools.span.storage.length, 1)

    // It should remove attributes from nodes when they are re-used
    assert(next.hasAttribute('foo') === false)
    assert(deepNext.hasAttribute('foo') === false)
  })

  // It should empty the pools when unmounted so that elements don't hang
  // around in the cache forever.
  assert.deepEqual(mounted.pools, {})
})

it('should not pool any components that have the option disabled', function () {
  var Component = component(function(props){
    return dom('a');
  })

  Component.set('disablePooling', true)

  var Parent = component(function(props){
    return dom('span', null, [
      dom(Component)
    ]);
  })

  var GrandParent = component(function(props){
    if (props.show) {
      return dom('div', null, [
        dom(Parent)
      ])
    } else {
      return dom('noscript')
    }
  })

  GrandParent.set('disablePooling', true)

  var app = world(GrandParent)
    .setProps({ show: true })

  mount(app, function(el, renderer){
    var div = el.querySelector('div')
    var span = el.querySelector('span')
    var a = el.querySelector('a')
    app.setProps({ show: false })
    renderer.render()
    app.setProps({ show: true })
    renderer.render()
    var nextdiv = el.querySelector('div')
    var nextspan = el.querySelector('span')
    var nexta = el.querySelector('a')
    assert(div !== nextdiv, 'div should not be pooled')
    assert(span === nextspan, 'span should be pooled')
    assert(a !== nexta, 'anchor should not be pooled')
  })
});
