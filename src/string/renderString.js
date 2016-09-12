import isValidAttribute from '@f/is-valid-attr'
import isNull from '@f/is-null'

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

export function renderString (vnode, context, path = '0', opts = {}) {
  switch (vnode.type) {
    case 'text':
      return renderTextNode(vnode)
    case 'empty':
      return renderEmptyNode()
    case 'thunk':
      return renderThunk(vnode, path, context, opts)
    case 'native':
      return renderHTML(vnode, path, context, opts)
  }
}

function renderTextNode (vnode) {
  return vnode.nodeValue
}

function renderEmptyNode () {
  return '<noscript></noscript>'
}

function renderThunk (vnode, path, context, opts) {
  let { props, children } = vnode
  let output = vnode.fn({ children, props, path, context })
  return renderString(output, context, path, opts)
}

function renderHTML (vnode, path, context, opts) {
  let {attributes, tagName, children} = vnode
  let innerHTML = attributes.innerHTML
  let str = '<' + tagName + attributesToString(attributes) + '>'

  if (innerHTML) {
    str += innerHTML
  } else {
    str += children.map((child, i) => renderString(
      child,
      context,
      path + '.' + (isNull(child.key) ? i : child.key),
      opts
    )).join('')
  }

  str += '</' + tagName + '>'
  return str
}
