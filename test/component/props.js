var raf = require('component-raf');

describe('Updating Props', function () {

  var Test = component(TwoWords);

  afterEach(function () {
    if (this.scene) this.scene.remove();
  });

  it('should replace props on the scene', function(){
    this.scene = Test.render(el, { one: 'Hello', two: 'World' });
    this.scene.update();
    this.scene.replaceProps({ one: 'Hello' });
    this.scene.update();
    assert.equal(el.innerHTML, '<span>Hello undefined</span>');
  });

  it('should merge props on the scene', function(){
    this.scene = Test.render(el, { one: 'Hello', two: 'World' });
    this.scene.update();
    this.scene.setProps({ two: 'Pluto' });
    this.scene.update();
    assert.equal(el.innerHTML, '<span>Hello Pluto</span>');
  });

  it('should replace then set props on the scene', function(){
    this.scene = Test.render(el, { one: 'Hello', two: 'World' });
    this.scene.update();
    this.scene.replaceProps({ one: 'Hello' });
    this.scene.setProps({ two: 'Pluto' });
    this.scene.update();
    assert.equal(el.innerHTML, '<span>Hello Pluto</span>');
  });

  it('should update on the next frame', function(){
    this.scene = Test.render(el, { one: 'Hello', two: 'World' });
    this.scene.update();
    this.scene.setProps({ one: 'Hello', two: 'Pluto' });
    assert.equal(el.innerHTML, '<span>Hello World</span>');
  });

  it('should not update props if the scene is removed', function (done) {
    var Test = component(Span);
    var scene = Test.render(el, { text: 'foo' });
    scene.update();
    try {
      scene.setProps({ text: 'bar' });
      scene.remove();
      raf(function(){
        done();
      });
    }
    catch (e) {
      done(false);
    }
  });

  it('should setProps and call the callback', function(done){
    this.scene = Test.render(el, { one: 'Hello', two: 'World' });
    this.scene.update();
    this.scene.setProps({ one: 'Hello', two: 'Pluto' }, function(){
      assert.equal(el.innerHTML, '<span>Hello Pluto</span>');
      done();
    });
  });

  it.skip('should return a promise when changing the props', function(done){
    this.scene = Test.render(el, { one: 'Hello', two: 'World' });
    this.scene.update();
    this.scene.setProps({ one: 'Hello', two: 'Pluto' })
      .then(function(){
        assert.equal(el.innerHTML, '<span>Hello Pluto</span>');
        done();
      });
  });

  it('should still call all callbacks even if it doesn\'t change', function(){
    var called = false;
    var Test = component(Span);
    this.scene = Test.render(el, { text: 'foo' });
    this.scene.update();
    this.scene.setProps({ text: 'foo' }, function(){
      called = true;
    });
    this.scene.update();
    assert(called);
  });

  it('should not update twice when setting props', function(){
    var i = 0;
    var IncrementAfterUpdate = component({
      afterUpdate: function(){
        i++;
      }
    });
    this.scene = IncrementAfterUpdate.render(el, {
      text: 'one'
    });
    this.scene.update();
    this.scene.setProps({ text: 'two' });
    this.scene.setProps({ text: 'three' });
    this.scene.update();
    assert.equal(i, 1);
  });

  it.skip('shouldn\'t update child when the props haven\'t changed', function () {
    var calls = 0;
    var ComponentA = component({
      render: function(props, state){
        calls++;
        return dom('span', null, [props.text]);
      }
    });
    var ComponentB = component({
      render: function(props, state){
        return dom('div', { name: props.character }, [
          ComponentA({ text: 'foo' })
        ]);
      }
    });
    this.scene = ComponentB.render(el, { character: 'Link' });
    this.scene.update();
    this.scene.setProps({ character: 'Zelda' });
    this.scene.update();
    assert.equal(calls, 1);
  });

  it('should call propsChanged when props are changed', function (done) {
    var Test = component({
      propsChanged: function(nextProps){
        assert(nextProps.foo);
        done();
      }
    });
    this.scene = Test.render(el, { foo: false });
    this.scene.update();
    this.scene.setProps({ foo: true });
    this.scene.update();
    this.scene.remove();
  });

  it('should call propsChanged on child components', function (done) {
    var Child = component({
      propsChanged: function(nextProps){
        assert(nextProps.count === 1);
        done();
      }
    });
    var Parent = component({
      render: function(props){
        return dom(Child, { count: props.count });
      }
    });
    this.scene = Parent.render(el, { count: 0 });
    this.scene.update();
    this.scene.setProps({ count: 1 });
    this.scene.update();
    this.scene.remove();
  });

  it.skip('should not call propsChanged on child components when they props don\'t change', function () {
    var Child = component({
      propsChanged: function(nextProps){
        throw new Error('Child should not be called');
      }
    });
    var Parent = component({
      render: function(props){
        return dom(Child);
      }
    });
    var scene = Parent.render(el, { count: 0 });
    scene.update();
    scene.setProps({ count: 1 });
    scene.update();
    scene.remove();
  });

  it('should define properties using the functional API', function () {
    var Test = component()
      .prop('test', { foo: 'bar' });
    assert(Test.props.test);
    assert(Test.props.test.foo === 'bar');
  });

  it('should define properties using the classic API', function () {
    var Test = component({
      props: {
        test: { foo: 'bar' }
      }
    });
    assert(Test.props.test);
    assert(Test.props.test.foo === 'bar');
  });

  it('should remove the .props property', function () {
    var Test = component({
      props: {
        test: { foo: 'bar' }
      },
      afterUnmount: function(){
        assert(this.props.channels == null);
      }
    });
    var scene = Test.render(el);
    scene.update();
    scene.remove();
  });

});
