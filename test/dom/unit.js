/** @jsx dom */

import {createEntity, patchAttributes, createElement} from '../../lib/renderers/client'
import dom from 'virtual-element'
import test from 'tape'

const Text = props => <div>{props.children}</div>

test('createEntity', t => {
  let entity = createEntity(
    <Text color="red">
      <span>Hello World</span>
    </Text>
  )
  t.equal(entity.type, Text)
  t.deepEqual(entity.children, {})
  t.equal(entity.nativeElement, null)
  t.equal(entity.virtualElement, null)
  t.end()
})

test('createElement', t => {
  let vnode = (
    <Text color="red">
      <span>Hello World</span>
    </Text>
  )

  let entity = createEntity(vnode)

  let nextEntity = createElement(entity, vnode.children[0], '0.0', el => {
    t.equal(el.outerHTML, '<span>Hello World</span>')
  })

  t.end()
})

test('patchAttributes', t => {
  var left = <div />
  var right = <div name="ted" />
  var el = document.createElement('div')
  patchAttributes(left, right, el)
  t.equal(el.getAttribute('name'), 'ted', 'attribute added')

  var left = <div name="ted" />
  var right = <div />
  var el = document.createElement('div')
  el.setAttribute('name', 'ted')
  patchAttributes(left, right, el)
  t.equal(el.getAttribute('name'), null, 'attribute removed')

  var left = <div name="fred" />
  var right = <div name="ted" />
  var el = document.createElement('div')
  el.setAttribute('name', 'fred')
  patchAttributes(left, right, el)
  t.equal(el.getAttribute('name'), 'ted', 'attribute updated')

  t.end()
})
