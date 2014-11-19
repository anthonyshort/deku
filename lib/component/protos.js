
/**
 * Module dependencies.
 */

var assign = require('sindresorhus/object-assign');

/**
 * Set properties on `this.state`.
 *
 * @param {Object} state State to merge with existing state.
 * @api public
 */

exports.set = function(state){
  if (2 == arguments.length) {
    this._pendingState[arguments[0]] = arguments[1];
  } else {
    assign(this._pendingState, state);
  }
  this.emit('change');
};

/**
 * Default render. Renders a noscript tag by
 * default so nothing shows up in the DOM.
 *
 * @param {node} dom
 * @return {Node}
 */

exports.render = function(dom){
  return dom('noscript');
};

/**
 * Return the initial state of the component.
 * This should be overriden.
 *
 * @return {Object}
 */

exports.initialState = function(){
  return {};
};
