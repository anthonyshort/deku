
/**
 * Component Helpers
 */

window.HelloWorld = function(dom, state, props){
  return dom('span', null, ['Hello World']);
};

window.Span = function(dom, state, props){
  return dom('span', null, [props.text]);
};

window.TwoWords = function(dom, state, props){
  return dom('span', null, [props.one + ' ' + props.two]);
};