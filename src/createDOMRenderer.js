import {diffChildren} from './diff'
import update from './updateElement'

/**
 * Create a DOM renderer using a container element. Everything will be rendered
 * inside of that container. Returns a function that accepts new state that can
 * replace what is currently rendered.
 */

export default function createDOMRenderer (DOMElement) {
  let previousElement
  return (nextElement, context) => {
    let changes = diffChildren([previousElement], [nextElement])
    update(DOMElement, changes, context)
    previousElement = nextElement
  }
}
