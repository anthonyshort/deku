
describe('Updating State', function () {

  var StateChangeOnMount = component({
    initialState: function(){
      return { text: 'foo' };
    },
    afterMount: function(){
      this.setState({ text: 'bar' });
    },
    render: function(n, state, props){
      var Test = component(Span);
      return Test({ text: state.text });
    }
  });

  it('should update components when state changes', function(){
    this.scene = StateChangeOnMount.render(el);
    assert.equal(el.innerHTML, '<span>foo</span>');
    this.scene.update();
    assert.equal(el.innerHTML, '<span>bar</span>');
  });

  it('should update composed components when state changes', function(){
    var Composed = component({
      afterUpdate: function(){
        throw new Error('Parent should not be updated');
      },
      render: function(n, state, props){
        return n('div', null, [
          n(StateChangeOnMount)
        ]);
      }
    });
    this.scene = Composed.render(el);
    assert.equal(el.innerHTML, '<div><span>foo</span></div>');
    this.scene.update();
    assert.equal(el.innerHTML, '<div><span>bar</span></div>');
  });

  it('should have initial state', function(){
    var DefaultState = component({
      initialState: function(){
        return {
          text: 'Hello World'
        };
      },
      render: function(dom, state){
        return dom('span', null, state.text);
      }
    });
    var scene = DefaultState.render(el);
    assert.equal(el.innerHTML, '<span>Hello World</span>');
  });

});