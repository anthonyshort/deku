import {render,deku,dom} from '../'
import assert from 'assert'

/**
 * Mount a scene, execute a function and then
 * remove the scene. This is used for testing.
 *
 * @param {Application} app
 * @param {Function} fn
 */

exports.mount = function(app, fn) {
  var el = document.createElement('div');
  var renderer = render(app, el, { batching: false });
  try {
    if (fn) fn(el, renderer);
  }
  catch(e) {
    throw e;
  }
  finally {
    renderer.remove();
    assert.equal(el.innerHTML, '');
    if (el.parentNode) el.parentNode.removeChild(el);
  }
  return el;
};

/**
 * Basic component for testing
 */

exports.HelloWorld = {
  render: function(props, state){
    return dom('span', null, ['Hello World']);
  }
};

/**
 * Create a span
 */

exports.Span = {
  render: function(props, state){
    return dom('span', null, [props.text]);
  }
};

/**
 * Create a span with two words
 */

exports.TwoWords = {
  render: function(props, state){
    return dom('span', null, [props.one + ' ' + props.two]);
  }
};

/**
 * Create a div
 */

exports.div = function(){
  var el = document.createElement('div');
  document.body.appendChild(el);
  return el;
};
