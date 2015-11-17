import {getKey, isActiveAttribute, nodeType, renderCustomElement, createModel} from './shared'

/**
 * Turn an object of key/value pairs into a HTML attribute string. This
 * function is responsible for what attributes are allowed to be rendered and
 * should handle any other special cases specific to deku.
 */

let attributesToString = (attributes) => {
  var str = ''
  for (var name in attributes) {
    var value = attributes[name]
    if (name === 'innerHTML') continue
    if (isActiveAttribute(value)) str += (' ' + name + '="' + attributes[name] + '"')
  }
  return str
}

/**
 * Render a virtual element to a string. You can pass in an option state context
 * object that will be given to all components.
 */

export let renderString = (element, context, path = '0') => {
  switch (nodeType(element)) {
    case 'text':
      return element
    case 'native':
      var attributes = element.attributes
      var tagName = element.type
      var innerHTML = attributes.innerHTML
      var str = '<' + tagName + attributesToString(attributes) + '>'
      if (innerHTML) {
        str += innerHTML
      } else {
        str += element.children.map((child, i) => {
          let keyOrIndex = getKey(child) || i
          renderString(child, context, path + '.' + keyOrIndex)
        }).join('')
      }
      str += '</' + tagName + '>'
      return str
    case 'custom':
      return renderString(renderCustomElement(createModel(element, path), context), context)
    default:
      return ''
  }
}
