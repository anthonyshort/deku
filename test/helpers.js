import {render,scene,dom} from '../'

/**
 * Mount a scene, execute a function and then
 * remove the scene. This is used for testing.
 *
 * @param {World} app
 * @param {Function} fn
 */

exports.mount = function(world, fn) {
  var el = exports.div();
  var renderer = render(world, el);
  try {
    if (fn) fn(el, renderer);
  }
  catch(e) {
    throw e;
  }
  finally {
    renderer.remove();
    document.body.removeChild(el);
  }
  return el;
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

/**
 * Create a div
 */

exports.div = function(){
  var el = document.createElement('div');
  document.body.appendChild(el);
  return el;
};
