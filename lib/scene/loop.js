
/**
 * Module dependecies
 */

var raf = require('component/raf');
var Emitter = require('component/emitter');

/**
 * Export `Loop`
 */

module.exports = function(){
  return new Loop();
};

/**
 * The loop calls a function every animation frame
 *
 * @param {Function} fn
 */

function Loop() {
  this.start();
}

/**
 * Mixins
 */

Emitter(Loop.prototype);

/**
 * Start the loop
 */

Loop.prototype.start = function() {
  var self = this;
  if (this.running) return;
  this.running = true;
  this.frame = raf(function tick(timestamp){
    self.emit('tick', timestamp);
    self.frame = raf(tick);
  });
};

/**
 * Stop the loop.
 */

Loop.prototype.pause = function() {
  if (this.frame) raf.cancel(this.frame);
  this.frame = null;
  this.running = false;
};