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
  this.emit('invalidate');
};

/**
 * Default render. Renders a noscript tag by
 * default so nothing shows up in the DOM.
 *
 * @param {node} dom
 * @return {Node}
 */

exports.render = function(){

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
 * Check if this component should be re-rendered given new props
 *
 * @param {Object} props
 * @param {Object} state
 * @param {Object} nextProps
 * @param {Object} nextState
 *
 * @return {Boolean}
 */

exports.shouldUpdate = function(props, state, nextProps, nextState){
  return true;
};