import {renderThunk, createModel, isThunk} from './thunk'
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
  if (element.type === '#text') {
    return element.nodeValue
  }

  if (isThunk(element)) {
    return renderString(renderThunk(createModel(element, context, path)), context, path)
  }

  let {attributes, type, children} = element
  let innerHTML = attributes.innerHTML
  let str = '<' + type + attributesToString(attributes) + '>'

  if (innerHTML) {
    str += innerHTML
  } else {
    str += children.map((child, i) => {
      let keyOrIndex = getKey(child) || i
      renderString(child, context, path + '.' + keyOrIndex)
    }).join('')
  }

  str += '</' + type + '>'
  return str
}
