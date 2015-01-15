var raf = require('component/raf');

describe('Updating Props', function () {

  var Test = component(TwoWords);

  afterEach(function () {
    if (this.scene) this.scene.remove();
  });

  it('should replace props on the scene', function(){
    this.scene = Test.render(el, { one: 'Hello', two: 'World' });
    this.scene.setProps({ one: 'Hello' });
    this.scene.update();
    assert.equal(el.innerHTML, '<span>Hello undefined</span>');
  });

  it('should update on the next frame', function(){
    this.scene = Test.render(el, { one: 'Hello', two: 'World' });
    this.scene.setProps({ one: 'Hello', two: 'Pluto' });
    assert.equal(el.innerHTML, '<span>Hello World</span>');
  });

  it('should not update props if the scene is removed', function (done) {
    var Test = component(Span);
    var mount = Test.render(el, { text: 'foo' });
    try {
      mount.setProps({ text: 'bar' });
      mount.remove();
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
    this.scene.setProps({ one: 'Hello', two: 'Pluto' }, function(){
      assert.equal(el.innerHTML, '<span>Hello Pluto</span>');
      done();
    });
  });

  it.skip('should return a promise when changing the props', function(done){
    this.scene = Test.render(el, { one: 'Hello', two: 'World' });
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
    this.scene.setProps({ text: 'two' });
    this.scene.setProps({ text: 'three' });
    this.scene.update();
    assert.equal(i, 1);
  });

  it('shouldn\'t update child when the props haven\'t changed', function (done) {
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
    var mount = ComponentB.render(el, {
      character: 'Link'
    });
    mount.setProps({ character: 'Zelda' }, function(){
      assert.equal(calls, 1);
      done();
    });
  });

});
