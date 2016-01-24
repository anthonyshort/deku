import {isText, isThunk, isEmpty, isValidAttribute} from '../element'

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
 * Render a virtual element to a string.
 */

export function renderString (element, path = '0') {
  if (isText(element)) {
    return element.nodeValue
  }

  if (isEmpty(element)) {
    return '<noscript></noscript>'
  }

  if (isThunk(element)) {
    let { props, component, children } = element
    let { render } = component
    let output = render({
      children,
      props,
      path
    })
    return renderString(
      output,
      path
    )
  }

  let {attributes, type, children} = element
  let innerHTML = attributes.innerHTML
  let str = '<' + type + attributesToString(attributes) + '>'

  if (innerHTML) {
    str += innerHTML
  } else {
    str += children.map((child, i) => renderString(child, path + '.' + (child.key == null ? i : child.key))).join('')
  }

  str += '</' + type + '>'
  return str
}
