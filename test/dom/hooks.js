/** @jsx element */

import raf from 'component-raf'
import {mount,div} from '../helpers'
import {render,deku,element} from '../../'
import assert from 'assert'

it('should fire all lifecycle hooks in the correct order with correct params', function(done){
  let log = []

  var MyComponent = {
    name: 'MyComponent',
    defaultProps: {
      style: 'round'
    },
    initialState () {
      log.push('initialState')
      return {
        open: true
      }
    },
    beforeMount (component) {
      let {props, state, id} = component
      assert(props.style === 'round')
      assert(state.open === true)
      assert(id)
      log.push('beforeMount')
    },
    shouldUpdate (component, nextProps, nextState) {
      let {props, state, id} = component
      assert(props.style === 'round')
      assert(state.open === true)
      assert(nextProps.style === 'round')
      assert(nextState.open === false)
      assert(id)
      log.push('shouldUpdate')
      return true
    },
    beforeUpdate (component, nextProps, nextState) {
      let {props, state, id} = component
      assert(props)
      assert(state)
      assert(id)
      log.push('beforeUpdate')
    },
    beforeRender (component) {
      let {props, state, id} = component
      assert(props)
      assert(state)
      assert(id)
      log.push('beforeRender')
    },
    render (component, setState) {
      let {props, state, id} = component
      log.push('render')
      return <div>Hello World</div>
    },
    afterRender (component, el) {
      let {props, state, id} = component
      assert(props)
      assert(state)
      assert(id)
      assert(el)
      log.push('afterRender')
    },
    afterUpdate (component, prevProps, prevState, setState) {
      let {props, state, id} = component
      assert(props.style === 'round')
      assert(state.open === false)
      assert(id)
      assert(prevProps.style === 'round')
      assert(prevState.open === true)
      assert(typeof setState === 'function')
      log.push('afterUpdate')
    },
    afterMount (component, el, setState) {
      let {props, state, id} = component
      assert(props)
      assert(state)
      assert(id)
      assert(el)
      assert(typeof setState === 'function')
      setState({ open: false })
      log.push('afterMount')
    },
    beforeUnmount (component, el) {
      let {props, state, id} = component
      assert(props)
      assert(state)
      assert(id)
      assert(el)
      log.push('beforeUnmount')
    }
  }

  var app = deku()
  app.mount(<MyComponent />)

  var container = div()
  var renderer = render(app, container)

  // Wait till the next frame because we triggered an
  // update in the afterMount hook
  raf(function(){
    assert.deepEqual(log, [
      'initialState',
      'beforeMount',
      'beforeRender',
      'render',
      'afterRender',
      'afterMount',
      'shouldUpdate',
      'beforeUpdate',
      'beforeRender',
      'render',
      'afterRender',
      'afterUpdate'
    ])
    renderer.remove()
    done()
  })
})

it('should exist in the DOM when after mount is called', function (done) {
  var Test = {
    render({ props, state }) {
      return <div id='foo'>Hello World</div>
    },
    afterMount (component, el) {
      assert(document.getElementById('foo'))
      done()
    }
  }

  var container = document.createElement('div')
  document.body.appendChild(container)
  var renderer = render(deku(<Test />), container)
  document.body.removeChild(container)
  renderer.remove()
})

it('should fire mount events top-down', function () {
  var order = []

  var Child = {
    render() { return <div /> },
    afterMount() { order.push('child:afterMount') },
    afterRender() { order.push('child:afterRender') }
  }

  var Parent = {
    render() { return <Child /> },
    afterMount() { order.push('parent:afterMount') },
    afterRender() { order.push('parent:afterRender') }
  }

  var app = deku(<Parent />)
  mount(app)
  assert.deepEqual(order, [
    'parent:afterRender',
    'parent:afterMount',
    'child:afterRender',
    'child:afterMount'
  ])
});
