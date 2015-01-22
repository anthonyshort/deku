
/**
 * Module dependencies.
 */

var assign = require('sindresorhus/object-assign');

/**
 * Set properties on `this.state`.
 *
 * @param {Object} state State to merge with existing state.
 * @param {Function} done
 */

exports.setState = function(state, done){
  this.emit('change', state, done);
};

/**
 * Invalidate the component so that it is updated on the next
 * frame regardless of whether or not the state has changed.
 *
 * This sets a temporary state value that is checked and trigger
 * an update. This special property is removed after the component is
 * updated.
 *
 * @return {void}
 */

exports.invalidate = function(){
  this.emit('change', { __force__: true });
};

/**
 * Send a message
 *
 * @param {String} name
 * @param {Mixed} data
 *
 * @return {void}
 */

exports.send = function(name, data){
  this.emit('send', name, data);
};

/**
 * Default render. Renders a noscript tag by
 * default so nothing shows up in the DOM.
 *
 * @param {node} dom
 * @return {Node}
 */

exports.render = function(){
  return null;
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

/**
 * Called after the props have been updated.
 *
 * @param {Object} nextProps
 */

exports.propsChanged = function(nextProps){

};