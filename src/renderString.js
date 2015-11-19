import {renderThunk, createModel} from './thunk'
import {isThunk, isText} from './utils'
import {getKey, isValidAttribute} from './utils'

/**
 * Turn an object of key/value pairs into a HTML attribute string. This
 * function is responsible for what attributes are allowed to be rendered and
 * should handle any other special cases specific to deku.
 */

function attributesToString (attributes) {
  var str = ''
  for (var name in attributes) {
    let value = attributes[name]
    if (name === 'innerHTML') continue
    if (isValidAttribute(value)) str += (' ' + name + '="' + attributes[name] + '"')
  }
  return str
}

/**
 * Render a virtual element to a string. You can pass in an option state context
 * object that will be given to all components.
 */

export default function renderString (element, context, path = '0') {
  if (isText(element)) {
    return element.nodeValue
  }

  if (isThunk(element)) {
    element.model = createModel(element, context, path)
    return renderString(renderThunk(element), context, path)
  }

  let {attributes, type, children} = element
  let innerHTML = attributes.innerHTML
  let str = '<' + type + attributesToString(attributes) + '>'

  if (innerHTML) {
    str += innerHTML
  } else {
    str += children.map((child, i) => renderString(child, context, path + '.' + getKey(child) || i)).join('')
  }

  str += '</' + type + '>'
  return str
}
