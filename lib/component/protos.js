
/**
 * Module dependencies.
 */

var merge = require('yields/merge');

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
    merge(this._pendingState, state);
  }
}

/**
 * Does this component have pending state changes?
 *
 * @return {Boolean}
 */

exports.hasPendingState = function(){
  return Object.keys(this._pendingState).length > 0;
}