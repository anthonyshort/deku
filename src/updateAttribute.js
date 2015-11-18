import isValidAttribute from './isValidAttribute'
import setValue from 'setify'
import events from './events'
import svg from './svg'

/**
 * Remove an attribute.
 */

export let removeAttribute = (DOMElement, name, value) => {
  switch (name) {
    case events[name]:
      DOMElement.removeEventListener(events[name], value)
      break
    case 'checked':
    case 'disabled':
    case 'selected':
      DOMElement[name] = false
      break
    case 'innerHTML':
    case 'nodeValue':
      DOMElement.innerHTML = ''
      break
    case 'value':
      setValue(DOMElement, null)
      break
    default:
      DOMElement.removeAttribute(name)
      break
  }
}

/**
 * Set an attribute
 */

export let setAttribute = (DOMElement, name, value, previousValue) => {
  switch (name) {
    case events[name]:
      if (previousValue) {
        DOMElement.removeEventListener(events[name], previousValue)
      }
      DOMElement.addEventListener(events[name], value)
      break
    case 'checked':
    case 'disabled':
    case 'selected':
      DOMElement[name] = true
      break
    case 'innerHTML':
      DOMElement.innerHTML = value
      break
    case 'value':
      setValue(DOMElement, value)
      break
    default:
      if (svg.isAttribute(name)) {
        DOMElement.setAttributeNS(svg.namespace, name, value)
      } else {
        DOMElement.setAttribute(name, value)
      }
      break
  }
}

/**
 * Update an attribute on a DOM element. This handles special cases where we set
 * properties and events too. It is responsible for how attributes should be rendered
 * from the virtual elements.
 */

export default function updateAttribute (DOMElement, name, value, previousValue) {
  if (typeof value === 'function') {
    value = value(DOMElement, name)
  }
  if (isValidAttribute(value)) {
    setAttribute(DOMElement, name, value, previousValue)
  } else {
    removeAttribute(DOMElement, name, previousValue)
  }
}
