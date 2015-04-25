/** @jsx dom */

import assert from 'assert'
import {component,dom,deku,render} from '../../'
import {mount,div} from '../helpers'

// Helpers.

var Component = {
  render: function(component) {
    let {props, state} = component
    var attrs = {};
    if (props.attr) attrs[props.attr] = props.value;
    return dom('div', { id: 'foo' }, [
      dom(props.type, attrs, [
        'boo',
        dom('strong', attrs),
        'bar'
      ])
    ])
  }
}

// Tests.

it('should pool dom nodes', function(){
  var app = deku()
  app.mount(<Component type="div" attr="foo" value="bar" />)

  mount(app, function(el, renderer){
    // Switch the nodes back and forth to trigger the pooling
    var target = el.querySelector('#foo div')
    var deepTarget = el.querySelector('strong')

    app.mount(<Component type="span" attr={null} value={null} />)
    app.mount(<Component type="div" attr={null} value={null} />)

    var next = el.querySelector('#foo div')
    var deepNext = el.querySelector('strong')

    // It should re-use the same div for the update
    assert.equal(target, next)

    // It should re-use deeply nested nodes
    assert.equal(deepTarget, deepNext)

    // It should have placed the span back in the pool
    var pools = renderer.inspect().pools;
    assert.equal(pools.span.storage.length, 1)

    // It should remove attributes from nodes when they are re-used
    assert(next.hasAttribute('foo') === false)
    assert(deepNext.hasAttribute('foo') === false)

    // It should empty the pools when unmounted so that elements don't hang
    // around in the cache forever.
    // assert.deepEqual(app.pools, {});
  })
})

it('should disable pooling', function(){
  var el = div()

  var app = deku()
  app.mount(<Component type="div" attr="foo" value="bar" />)

  var renderer = render(app, el, {
    pooling: false,
    batching: false
  })

  // Switch the nodes back and forth to trigger the pooling
  var target = el.querySelector('#foo div')
  var deepTarget = el.querySelector('strong')

  app.mount(<Component type="span" attr={null} value={null} />)
  app.mount(<Component type="div" attr={null} value={null} />)

  var next = el.querySelector('#foo div')
  var deepNext = el.querySelector('strong')

  // It should re-use the same div for the update
  assert.notEqual(target, next)
  assert.notEqual(deepTarget, deepNext)

  // It should have placed the span back in the pool
  var pools = renderer.inspect().pools;
  assert.equal(pools.span, undefined)

  // Cleanup
  renderer.remove()
})

it.skip(`should'nt pool certain elements`, function(){
  var el = div()
  var app = deku()

  app.mount(
    <div>
      <input />
      <textarea></textarea>
    </div>
  )

  var renderer = render(app, el, {
    batching: false
  })

  var input = el.querySelector('input')
  var textarea = el.querySelector('textarea')

  app.mount(
    <div>
      <input />
      <textarea></textarea>
    </div>
  )

  assert(input !== el.querySelector('input'))
  assert(textarea !== el.querySelector('textarea'))
  renderer.remove()
})
