
/**
 * Properties.
 *
 * @return {Component}
 * @api public
 */

exports.prop = function(key, val){
  this.props[key] = val;
  return this;
};

/**
 * State.
 *
 * @return {Component}
 * @api public
 */

exports.state = function(key, val){
  this.states[key] = val;
  return this;
};

/**
 * Use plugin.
 *
 * @param {Function} plugin
 * @return {Component}
 * @api public
 */

exports.use = function(plugin){
  plugin(this);
  return this;
};

/**
 * Append to an actual DOM element.
 *
 * @param {DOMElement} el
 */

exports.mountTo = function(el){
  var id = el.getAttribute('id');

  var html = this.create(id);
  el.innerHTML = html;
};
