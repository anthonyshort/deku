
describe('Sending Messages', function () {

  it('should send messages to the scene', function (done) {
    var Test = component({
      afterMount: function(){
        this.send('test', true);
      }
    });
    var scene = Test.render(el);
    scene.onMessage('test', function(payload){
      assert(payload);
      done();
      scene.remove();
    });
  });

  it('should send messages to the scene on update', function (done) {
    var Test = component({
      afterUpdate: function(){
        this.send('test', true);
      }
    });
    var scene = Test.render(el, { count: 1 });
    scene.onMessage('test', function(payload){
      assert(payload);
      done();
      scene.remove();
    });
    scene.setProps({ count: 2 });
  });

  it('should clean up messages when the scene is removed', function (done) {
    var Test = component({
      afterMount: function(){
        this.send('test', true);
      }
    });
    var scene = Test.render(el);
    scene.onMessage('test', function(payload){
      throw new Error('Events should not be sent');
    });
    scene.remove();
    scene.flush();
    done();
  });

});