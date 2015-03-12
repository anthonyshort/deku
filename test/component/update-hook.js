
describe('Update Hooks', function () {

  var updateMixin = {
    render: function(props, state){
      state.count = state.count || 1;
      return dom('span', null, props.count);
    },
    afterMount: function(){
      this.setState({ count: 2 });
    }
  };

  it('should fire beforeUpdate', function () {
    var fired = false;
    var Test = component({
      beforeUpdate: function(props, state, nextProps, nextState){
        assert.equal(nextProps.count, 2);
        assert.equal(props.count, 1);
        assert.equal(nextState.count, 2);
        assert.equal(state.count, 1);
        assert.equal(el.innerHTML, '<span>1</span>');
        fired = true;
      }
    });
    Test.use(updateMixin);
    var scene = Test.render(el, {count: 1});
    scene.update();
    scene.setProps({count:2});
    scene.update();
    assert(fired);
  });

  it('should fire afterUpdate', function () {
    var fired = false;
    var Test = component({
      afterUpdate: function(props, state, prevProps, prevState){
        assert.equal(props.count, 2);
        assert.equal(prevProps.count, 1);
        assert.equal(state.count, 2);
        assert.equal(prevState.count, 1);
        assert.equal(el.innerHTML, '<span>2</span>');
        fired = true;
      }
    });
    Test.use(updateMixin);
    var scene = Test.render(el, {count: 1});
    scene.update();
    scene.setProps({count:2});
    scene.update();
    assert(fired);
  });

  it('should not allow setting the state during beforeUpdate', function (done) {
    var Impure = component({
      beforeUpdate: function(){
        this.setState({ foo: 'bar' });
      }
    });
    var scene = Impure.render(el, {count: 1});
    scene.update();
    scene.setProps({count:2});
    try {
      scene.update();
    } catch(e) {
      return done();
    }
    throw new Error('Did not prevent set state during beforeUpdate');
  });

  it('should only call `beforeUpdate` once', function(){
    var i = 0;
    var Component = component({
      beforeUpdate: function(props, state, nextProps, nextState){
        i++;
        assert(props.text === 'one');
        assert(nextProps.text === 'three');
      },
      render: function(props, state){
        return dom('div', null, [props.text]);
      }
    });
    var scene = Component.render(el, {
      text: 'one'
    });
    scene.update();
    scene.setProps({ text: 'two' });
    scene.setProps({ text: 'three' });
    scene.update();
    assert(i === 1);
    scene.remove();
  });

});
