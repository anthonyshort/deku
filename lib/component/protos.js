
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
    this.state[arguments[0]] = arguments[1];
  } else {
    merge(this.state, state);
  }
  this.invalidate();
}

