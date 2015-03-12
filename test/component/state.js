
describe('Updating State', function () {

  var StateChangeOnMount = component({
    afterMount: function(){
      this.setState({ text: 'bar' });
    },
    render: function(props, state){
      state.text = state.text || 'foo';
      var Test = component(Span);
      return Test({ text: state.text });
    }
  });

  it('should update components when state changes', function(){
    this.scene = StateChangeOnMount.render(el);
    this.scene.update();
    assert.equal(el.innerHTML, '<span>foo</span>');
    this.scene.update();
    assert.equal(el.innerHTML, '<span>bar</span>');
  });

  it('should update composed components when state changes', function(){
    var Composed = component({
      afterUpdate: function(){
        throw new Error('Parent should not be updated');
      },
      render: function(props, state){
        return dom('div', null, [
          dom(StateChangeOnMount)
        ]);
      }
    });
    this.scene = Composed.render(el);
    this.scene.update();
    assert.equal(el.innerHTML, '<div><span>foo</span></div>');
    this.scene.update();
    assert.equal(el.innerHTML, '<div><span>bar</span></div>');
  });

});
