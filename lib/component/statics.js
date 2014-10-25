
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
