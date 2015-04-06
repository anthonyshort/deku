
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
