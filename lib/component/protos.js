
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
  this._pendingState = this._pendingState || {};
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
  if (!nextProps && !nextState) return false;
  if (equal(nextProps, props) && equal(nextState, state)) return false;
  return true;
};

/**
 * Called before the component is mounted in the DOM. This is
 * also called when rendering the component to a string
 *
 * @param {HTMLElement} el The root element for the component
 * @param {Object} state
 * @param {Object} props
 *
 * @return {void}
 */

exports.beforeMount = function(el, state, props){

};

/**
 * Called after the component is mounted in the DOM. This is use
 * for any setup that needs to happen, like starting timers.
 *
 * @param {HTMLElement} el The root element for the component
 * @param {Object} state
 * @param {Object} props
 *
 * @return {void}
 */

exports.afterMount = function(el, state, props){

};

/**
 * Called before the component is re-rendered
 *
 * @param {Object} state
 * @param {Object} props
 * @param {Object} nextState
 * @param {Object} nextProps
 *
 * @return {void}
 */

exports.beforeUpdate = function(state, props, nextState, nextProps){

};

/**
 * Called after the component is mounted in the DOM. This is use
 * for any setup that needs to happen, like starting timers.
 *
 * @param {Object} state
 * @param {Object} props
 * @param {Object} prevState
 * @param {Object} prevProps
 *
 * @return {void}
 */

exports.afterUpdate = function(state, props, prevState, prevProps){

};

/**
 * Called before the component is unmounted from the DOM
 *
 * @param {HTMLElement} el The root element for the component
 * @param {Object} state
 * @param {Object} props
 *
 * @return {void}
 */

exports.beforeUnmount = function(el, state, props){

};

/**
 * Called after the component is unmounted in the DOM
 *
 * @param {HTMLElement} el The root element for the component
 * @param {Object} state
 * @param {Object} props
 *
 * @return {void}
 */

exports.afterUnmount = function(el, state, props){

};