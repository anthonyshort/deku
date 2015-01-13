
/**
 * Component Helpers
 */

window.HelloWorld = component({
  render: function(dom, state, props){
    return dom('span', null, ['Hello World']);
  }
});

window.Span = component(function(dom, state, props){
  return dom('span', null, [props.text]);
});

window.TwoWords = component({
  render: function(dom, state, props){
    return dom('span', null, [props.one + ' ' + props.two]);
  }
});

window.StateChangeOnMount = component({
  initialState: function(){
    return { text: 'foo' };
  },
  afterMount: function(){
    this.setState({ text: 'bar' });
  },
  render: function(n, state, props){
    return Span({ text: state.text });
  }
});