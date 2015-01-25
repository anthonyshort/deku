
/**
 * Module dependecies
 */

var raf = require('component-raf');
var Emitter = require('component-emitter');

/**
 * Singleton emitter
 */

var frames = new Emitter();

/**
 * Emit an event on each frame
 */

function tick(timestamp){
  frames.emit('tick', timestamp);
  raf(tick);
}

/**
 * Start the loop
 */

raf(tick);

/**
 * Export `Loop`
 */

module.exports = frames;