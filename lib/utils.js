/**
 * Dependencies
 */

var slice = require('sliced')
var assign = require('fast.js/object/assign')

/**
 * The npm 'defaults' module but without cloning and with
 * support for multiple sources of `defaults`.
 *
 * @param {Object} options
 * @param {Object} defaults
 *
 * @return {Object}
 */

exports.defaults = function(options, defaults) {
  if (arguments.length > 2) {
    var sources = slice(arguments, 1).reverse()
    defaults = assign.apply(null, [{}].concat(sources))
  }

  Object.keys(defaults).forEach(function(key) {
    if (typeof options[key] === 'undefined') {
      options[key] = defaults[key]
    }
  })
  return options
}

/**
 * Create a new object composed of picked `src` properties,
 * mapped to new propertie names using `map`.
 *
 * @param  {Object} map Property map
 * @param  {Object} src Source object
 * @return {Object}
 */

exports.pickMap = function(map, src) {
  var dest = {}
  for (var key in map) {
    dest[key] = src[map[key]]
  }
  return dest
}
