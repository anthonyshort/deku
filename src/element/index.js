/**
 * This function lets us create virtual nodes using a simple
 * syntax. It is compatible with JSX transforms so you can use
 * JSX to write nodes that will compile to this function.
 *
 * let node = element('div', { id: 'foo' }, [
 *   element('a', { href: 'http://google.com' },
 *     element('span', {}, 'Google'),
 *     element('b', {}, 'Link')
 *   )
 * ])
 */

export default function element (type, attributes, ...children) {
  if (!type) throw new TypeError('element() needs a type.')

  attributes = attributes || {}
  children = (children || []).reduce(reduceChildren, [])

  let key = typeof attributes.key === 'string' || typeof attributes.key === 'number'
    ? attributes.key
    : undefined

  delete attributes.key

  if (typeof type === 'object') {
    return createThunkElement(type, key, attributes, children)
  }

  if (typeof type === 'function') {
    return createThunkElement({render: type, ...type}, key, attributes, children);
  }

  return {
    attributes,
    children,
    type,
    key
  }
}

function reduceChildren (children, vnodes) {
  let newChildren =  [].concat(vnodes).map(n => {
    if (typeof n === 'string' || typeof n === 'number')
      return createTextElement(n);
    return n;
  })

  children.push.apply(children, newChildren);

  return children;
}

export function createTextElement (text) {
  return {
    type: '#text',
    nodeValue: text
  }
}

export function createThunkElement (component, key, props, children) {
  return {
    type: '#thunk',
    children,
    props,
    component,
    key
  }
}
