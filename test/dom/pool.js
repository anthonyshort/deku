import test from 'tape'
import Pool from '../../src/dom/pool'

test('storeDomNode', t => {
  let node = document.createElement('div')
  node.__attr = true
  let pool = new Pool()
  pool.enableRecycling(true)

  pool.store(node)

  let storedNode = pool.get('div')

  t.equal(storedNode.__attr, true, 'Pool returned same node')
  t.end()
})

test('getNewDomNode', t => {
  let pool = new Pool()
  let newNode = pool.get('div')
  t.equal(newNode.tagName.toLowerCase(), 'div', 'Pool created and returned div')
  
  pool.enableRecycling(true)
  newNode = pool.get('div')
  t.equal(newNode.tagName.toLowerCase(), 'div', 'Pool created and returned div with enabled recycling')
  t.end()
})

test('getNewSvgNode', t => {
  let pool = new Pool()
  let newNode = pool.get('circle')

  t.equal(newNode instanceof SVGElement, true, 'Pool created svg element')
  t.end()
})

test('preallocateDomNodes', t => {
  let pool = new Pool()
  pool.enableRecycling(true)
  pool.preallocate('div', 20)

  t.equal(pool._getStorageSizeFor('div'), 20, 'Preallocated 20 elements')
  t.equal(pool.get('div').tagName.toLowerCase(), 'div', 'Stored element was div')
  t.equal(pool._getStorageSizeFor('div'), 19, '19 elements left after .get()')
  t.end()
})

