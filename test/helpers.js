
var deku = require('../');
var render = deku.render;
var scene = deku.scene;
var dom = deku.dom;

/**
 * Mount a scene, execute a function and then
 * remove the scene. This is used for testing.
 *
 * @param {Scene} app
 * @param {Function} fn
 */

exports.mount = function(app, fn) {
  var el = document.createElement('div');
  document.body.appendChild(el);
  var renderer = render(app, el);
  fn(el, renderer);
  renderer.remove();
  document.body.removeChild(el);
};

/**
 * Basic component for testing
 */

exports.HelloWorld = function(props, state){
  return dom('span', null, ['Hello World']);
};

/**
 * Create a span
 */

exports.Span = function(props, state){
  return dom('span', null, [props.text]);
};

/**
 * Create a span with two words
 */

exports.TwoWords = function(props, state){
  return dom('span', null, [props.one + ' ' + props.two]);
};