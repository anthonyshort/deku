import {isValidAttribute} from '../shared/utils'
import events from '../shared/events'
import svg from '../shared/svg'
import setValue from 'setify'

export function removeAttribute (DOMElement, name, previousValue) {
  switch (name) {
    case events[name]:
      if (typeof previousValue === 'function') {
        DOMElement.removeEventListener(events[name], previousValue)
      }
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
      DOMElement.value = ''
      break
    default:
      DOMElement.removeAttribute(name)
      break
  }
}

export function setAttribute (DOMElement, name, value, previousValue) {
  if (value === previousValue) {
    return
  }
  if (typeof value === 'function') {
    value = value(DOMElement, name)
  }
  if (!isValidAttribute(value)) {
    removeAttribute(DOMElement, name, previousValue)
    return
  }
  switch (name) {
    case events[name]:
      if (typeof previousValue === 'function') {
        DOMElement.removeEventListener(events[name], previousValue)
      }
      DOMElement.addEventListener(events[name], value)
      break
    case 'checked':
    case 'disabled':
    case 'selected':
    case 'innerHTML':
    case 'nodeValue':
      DOMElement[name] = value
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
