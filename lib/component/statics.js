
/**
 * Module dependencies.
 */

var assign = require('sindresorhus/object-assign');

/**
 * Use plugin.
 *
 * @param {Function|Object} plugin Passing an object will extend the prototype.
 * @return {Component}
 * @api public
 */

exports.use = function(plugin){
  if ('function' === typeof plugin) {
    plugin(this);
  } else {
    assign(this.prototype, plugin);
  }
  return this;
};

/**
 * Mount this component to a node. Only available
 * in the browser as it requires the DOM.
 *
 * @param {HTMLElement} container
 * @param {Object} props
 */

if (typeof window !== 'undefined') {
  var Mount = require('../renderer/mount');

  exports.render =
  exports.appendTo =
  exports.mount = function(container, props){
    var mount = new Mount(this, props);
    mount.appendTo(container);
    return mount;
  };
}

/**
 * Render this component to a string.
 *
 * @param {Object} props
 */

exports.renderToString = function(props){

};
