
/**
 * Expose `Component`.
 */

module.exports = Component;

/**
 * A component is a stateful virtual dom element.
 *
 * @api public
 */

function Component(opts) {
  if (!(this instanceof Component)) return new Component(opts);
  this.options = {};
  this.layers = {};
  this.props = {};
  if ('function' == typeof opts) {
    this.layers.main = opts;
  } else if ('string' == typeof opts) {
    this.name = opts;
  } else if (opts) {
    // TODO: come back to multiple layers
    this.layers.main = opts.render;
    if (opts.props) this.props = opts.props;
    // TODO: cleanup or potentially deprecate
    if (opts.beforeMount) this.beforeMount = opts.beforeMount;
    if (opts.afterMount) this.afterMount = opts.afterMount;
    if (opts.beforeUpdate) this.beforeUpdate = opts.beforeUpdate;
    if (opts.afterUpdate) this.afterUpdate = opts.afterUpdate;
    if (opts.beforeUnmount) this.beforeUnmount = opts.beforeUnmount;
    if (opts.afterUnmount) this.afterUnmount = opts.afterUnmount;
    if (opts.initialState) this.initialState = opts.initialState;
    if (opts.shouldUpdate) this.shouldUpdate = opts.shouldUpdate;
    if (opts.propsChanged) this.propsChanged = opts.propsChanged;
  }
}

/**
 * Use plugin.
 *
 * @param {Function|Object} plugin Passing an object will extend the prototype.
 * @return {Component}
 * @api public
 */

Component.prototype.use = function(plugin){
  if ('function' === typeof plugin) {
    plugin(this);
  } else {
    for (var k in plugin) this[k] = plugin[k];
  }
  return this;
};

/**
 * Define a property
 *
 * @param {String} name
 * @param {Object} options
 */

Component.prototype.prop = function(name, options){
  this.props[name] = options;
  return this;
};

/**
 * Set an option
 *
 * @param {String} name
 * @param {*} value
 */

Component.prototype.set = function(name, value){
  this.options[name] = value;
  return this;
};

/**
 * Render template.
 */

Component.prototype.render = function(state, props, send){
  return this.layers.main
    ? this.layers.main.call(null, state, props, send)
    : null;
};

/**
 * Return the initial state of the component.
 * This should be overriden.
 *
 * @return {Object}
 */

Component.prototype.initialState = function(){
  return {};
};

/**
 * Check if this component should be re-rendered given new props
 *
 * @param {Object} props
 * @param {Object} state
 * @param {Object} nextProps
 * @param {Object} nextState
 *
 * @return {Boolean}
 */

Component.prototype.shouldUpdate = function(props, state, nextProps, nextState){
  return true;
};
