import svgAttributeNS from 'svg-attribute-namespace'
import {isValidAttribute} from '../element'
import indexOf from 'index-of'
import setValue from 'setify'
import events from './events'

export function removeAttribute (DOMElement, name, previousValue) {
  let eventType = events[name]
  if (eventType) {
    if (typeof previousValue === 'function') {
      DOMElement.removeEventListener(eventType, previousValue)
    }
    return
  }
  switch (name) {
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

export function setAttribute (DOMElement, name, value, previousValue, option = {}) {
  if (value === previousValue) return
  if(!option.noEventListeners){
    let eventType = events[name]
    if (eventType) {
      if (typeof previousValue === 'function')
        DOMElement.removeEventListener(eventType, previousValue)
      DOMElement.addEventListener(eventType, value)
      return
    }
  }
  if(option.onlyEventListeners) return
  if (!isValidAttribute(value)) {
    removeAttribute(DOMElement, name, previousValue)
    return
  }
  switch (name) {
    case 'checked':
    case 'disabled':
    case 'innerHTML':
    case 'nodeValue':
      DOMElement[name] = value
      break
    case 'selected':
      DOMElement.selected = value
      // Fix for IE/Safari where select is not correctly selected on change
      if (DOMElement.tagName === 'OPTION' && DOMElement.parentNode) {
        let select = DOMElement.parentNode
        select.selectedIndex = indexOf(select.options, DOMElement)
      }
      break
    case 'value':
      setValue(DOMElement, value)
      break
    default:
      DOMElement.setAttributeNS(svgAttributeNS(name), name, value)
      break
  }
}
