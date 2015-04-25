import {render,deku,dom} from '../'
import assert from 'assert'

/**
 * Mount a scene, execute a function and then
 * remove the scene. This is used for testing.
 *
 * @param {Application} app
 * @param {Function} fn
 */

exports.mount = function(app, fn, errorHandler) {
  var el = document.createElement('div');

  try {
    var renderer = render(app, el, { batching: false });
    if (fn) fn(el, renderer);
  }
  catch(e) {
    if (errorHandler) {
      errorHandler(e);
    } else {
      throw e;
    }
  }
  finally {
    if (renderer) renderer.remove();
    assert.equal(el.innerHTML, '');
    if (el.parentNode) el.parentNode.removeChild(el);
  }
  return renderer;
};

/**
 * Basic component for testing
 */

exports.HelloWorld = {
  render: function(component){
    let {props, state} = component
    return dom('span', null, ['Hello World']);
  }
};

/**
 * Create a span
 */

exports.Span = {
  render: function(component){
    let {props, state} = component
    return dom('span', null, [props.text]);
  }
};

/**
 * Create a span with two words
 */

exports.TwoWords = {
  render: function(component){
    let {props, state} = component
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
