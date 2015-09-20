import {nodeType, renderComponent, props} from '../helpers/virtual'
import {attributesToString} from '../helpers/dom'
import map from 'fast.js/map'

export default function (app) {
  return renderString(app.element)
}

function renderString (node) {
  switch (nodeType(node)) {
    case 'empty':
      return '<noscript />'
    case 'text':
      return node
    case 'element':
      var attributes = node.attributes
      var tagName = node.type
      var innerHTML = attributes.innerHTML
      var str = '<' + tagName + attributesToString(attributes) + '>'
      if (innerHTML) {
        str += innerHTML
      } else {
        str += map(node.children, renderString).join('')
      }
      str += '</' + tagName + '>'
      return str
    case 'component':
      return renderString(renderComponent(vnode.type, props(vnode)))
    default:
      return ''
  }
}
