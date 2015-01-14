
/**
 * Component Helpers
 */

window.HelloWorld = function(props, state){
  return dom('span', null, ['Hello World']);
};

window.Span = function(props, state){
  return dom('span', null, [props.text]);
};

window.TwoWords = function(props, state){
  return dom('span', null, [props.one + ' ' + props.two]);
};