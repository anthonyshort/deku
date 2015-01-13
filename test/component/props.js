
describe('Updating Props', function () {

  it('should replace props on the scene', function(){
    this.scene = TwoWords.render(el, { one: 'Hello', two: 'World' });
    this.scene.setProps({ one: 'Hello' });
    this.scene.update();
    assert.equal(el.innerHTML, '<span>Hello undefined</span>');
  });

  it('should update on the next frame', function(){
    this.scene = TwoWords.render(el, { one: 'Hello', two: 'World' });
    this.scene.setProps({ one: 'Hello', two: 'Pluto' });
    assert.equal(el.innerHTML, '<span>Hello World</span>');
  });

  it('should setProps and call the callback', function(done){
    this.scene = TwoWords.render(el, { one: 'Hello', two: 'World' });
    this.scene.setProps({ one: 'Hello', two: 'Pluto' }, function(){
      assert.equal(el.innerHTML, '<span>Hello Pluto</span>');
      done();
    });
  });

  it('should return a promise when changing the props', function(done){
    this.scene = TwoWords.render(el, { one: 'Hello', two: 'World' });
    this.scene.setProps({ one: 'Hello', two: 'Pluto' })
      .then(function(){
        assert.equal(el.innerHTML, '<span>Hello Pluto</span>');
        done();
      });
  });

  it('should still call all callbacks even if it doesn\'t change', function(done){
    this.scene = Span.render(el, { text: 'foo' });
    this.scene.setProps({ text: 'foo' }, function(){
      done();
    });
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
      render: function(n, state, props){
        calls++;
        return n('span', null, [props.text]);
      }
    });
    var ComponentB = component({
      render: function(n, state, props){
        return n('div', { name: props.character }, [
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
