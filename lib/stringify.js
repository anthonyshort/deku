var utils = require('./utils')
var events = require('./events')
var defaults = utils.defaults
var pickMap = utils.pickMap
var assign = require('fast.js/object/assign')

/**
 * Expose `stringify`.
 */

module.exports = function (element) {
  /**
   * Render to string.
   *
   * @param {Component} component
   * @param {Object} [props]
   * @return {String}
   */

  function stringify (component, optProps, context) {
    if (component.statics) context = assign({}, context, component.statics)
    var propTypes = component.propTypes || {}
    var props = defaults(
      optProps || {},
      component.defaultProps || {},
      pickMap(component.dependencies || {}, context)
    )
    var state = component.initialState ? component.initialState(props) : {}
    if (component.beforeMount) component.beforeMount({ props: props, state: state })
    if (component.beforeRender) component.beforeRender({ props: props, state: state })
    var node = component.render({ props: props, state: state })
    return stringifyNode(node, '0', context)
  }

  /**
   * Render a node to a string
   *
   * @param {Node} node
   * @param {Tree} tree
   *
   * @return {String}
   */

  function stringifyNode (node, path, context) {
    switch (node.type) {
      case 'text': return node.data
      case 'element':
        var children = node.children
        var attributes = node.attributes
        var tagName = node.tagName
        var innerHTML = attributes.innerHTML
        var str = '<' + tagName + attrs(attributes) + '>'

        if (innerHTML) {
          str += innerHTML
        } else {
          for (var i = 0, n = children.length; i < n; i++) {
            str += stringifyNode(children[i], path + '.' + i, context)
          }
        }

        str += '</' + tagName + '>'
        return str
      case 'component': return stringify(node.component, node.props, context)
    }

    throw new Error('Invalid type')
  }

  return stringifyNode(element, '0', {})
}

/**
 * HTML attributes to string.
 *
 * @param {Object} attributes
 * @return {String}
 * @api private
 */

function attrs (attributes) {
  var str = ''
  for (var key in attributes) {
    if (key === 'innerHTML') continue
    if (events[key]) continue
    str += attr(key, attributes[key])
  }
  return str
}

/**
 * HTML attribute to string.
 *
 * @param {String} key
 * @param {String} val
 * @return {String}
 * @api private
 */

function attr (key, val) {
  return ' ' + key + '="' + val + '"'
}
