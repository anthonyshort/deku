import {nodeType, renderComponent} from '../helpers/virtual'
import {attributesToString} from '../helpers/dom'

export default function (app) {
  return stringifyNode(app.element)
}

function stringifyNode (node, path = '0') {
  switch (nodeType(node)) {
    case 'empty': return '<noscript />'
    case 'text': return node
    case 'element':
      var children = node.children
      var attributes = node.attributes
      var tagName = node.type
      var innerHTML = attributes.innerHTML
      var str = '<' + tagName + attributesToString(attributes) + '>'

      if (innerHTML) {
        str += innerHTML
      } else {
        for (var i = 0, n = children.length; i < n; i++) {
          str += stringifyNode(children[i], path + '.' + i)
        }
      }

      str += '</' + tagName + '>'
      return str
    case 'component':
      return stringifyNode(renderComponent(vnode.type, { ...node.attributes, children: node.children }))
    case default:
      return ''
  }
}
