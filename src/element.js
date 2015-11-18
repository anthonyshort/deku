import flatten from 'array-flatten'

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

export default function element (type, attributes = {}, ...children) {
  if (!type) throw new TypeError('element() needs a type.')

  children = flatten(children, 2)
    .filter(i => typeof i !== 'undefined')
    .map(n => typeof n === 'string' ? createTextElement(n) : n)

  return {
    type: type,
    children: children,
    attributes: attributes
  }
}

function createTextElement (text) {
  return element('#text', { nodeValue: text })
}
