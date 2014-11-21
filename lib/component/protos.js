
/**
 * Module dependencies.
 */

var assign = require('sindresorhus/object-assign');
var equal = require('jkroso/equals');

/**
 * Set properties on `this.state`.
 *
 * @param {Object} state State to merge with existing state.
 * @param {Function} done
 */

exports.setState = function(state, done){
  assign(this._pendingState, state);
  this.emit('change', done);
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

/**
 * Before an update occurs we'll check to see if this component
 * actually needs re-render. This method can be overwritten by the
 * consumer to speed up rendering.
 *
 * @param {Object} state
 * @param {Object} props
 * @param {Object} nextState
 * @param {Object} nextProps
 *
 * @return {Boolean}
 */

exports.shouldUpdate = function(state, props, nextState, nextProps){
  return !equal(nextProps, this.props) || !equal(nextState, this.state);
};