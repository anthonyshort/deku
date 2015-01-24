
describe('Channels', function () {

  it('should define channels using the functional API', function (done) {
    var Test = component()
      .channel('test');
    Test.prototype.beforeMount = function(props){
      assert(props.channels.test);
      done();
    };
    var scene = Test.render(el);
    scene.update();
    scene.remove();
  });

  it('should camel-case channel names', function (done) {
    var Test = component()
      .channel('test thing');
    Test.prototype.beforeMount = function(props){
      assert(props.channels.testThing);
      done();
    };
    var scene = Test.render(el);
    scene.update();
    scene.remove();
  });

  it('should define channels using the classic API', function (done) {
    var Test = component({
      channels: ['test'],
      beforeMount: function(props){
        assert(props.channels.test);
        done();
      }
    });
    var scene = Test.render(el);
    scene.update();
    scene.remove();
  });

  it('should send messages to the channel', function (done) {
    var Test = component({
      channels: ['events'],
      beforeMount: function(props){
        var socket = props.channels.events;
        socket.emit('test', true);
      }
    });
    var scene = Test.render(el);
    var channel = scene.channel('events');
    channel.on('connection', function(socket){
      socket.on('test', function(payload){
        assert(payload);
        done();
      })
    });
    scene.update();
    scene.remove();
  });

  it('should send messages to the scene on update', function (done) {
    var Test = component({
      channels: ['events'],
      afterUpdate: function(props){
        props.channels.events.emit('test', true);
      }
    });
    var scene = Test.render(el, { count: 1 });
    var channel = scene.channel('events');
    channel.on('connection', function(socket){
      socket.on('test', function(payload){
        assert(payload);
        done();
      })
    });
    scene.update();
    scene.setProps({ count: 2 });
    scene.update();
    scene.remove();
  });

  it('should have access to the channel in render', function (done) {
    var Test = component({
      channels: ['events'],
      render: function(props){
        assert(props.channels.events);
        done();
        return dom();
      }
    });
    var scene = Test.render(el, { count: 1 });
    scene.update();
    scene.remove();
  });

  it('should disconnect from channels when the scene is removed', function () {
    var count = 0;
    var Test = component({
      channels: ['events'],
      afterUnmount: function(props){
        assert(props.channels == null);
      }
    });
    var scene = Test.render(el);
    var channel = scene.channel('events');
    channel.on('connection', function(socket){
      socket.on('disconnect', function(payload){
        count += 1;
      })
    });
    scene.update();
    assert.equal(channel.sockets.length, 1);
    scene.remove();
    assert.equal(channel.sockets.length, 0);
    assert.equal(count, 1);
  });

  it('should disconnect from channels when the component is unmounted', function () {
    var count = 0;
    var Test = component({
      channels: ['events'],
      afterUnmount: function(props){
        assert(props.channels == null);
      }
    });
    var Parent = component(function(props, state){
      return dom('div', [
        props.showComponent ? dom(Test) : dom()
      ]);
    });
    var scene = Parent.render(el, { showComponent: true });
    var channel = scene.channel('events');
    channel.on('connection', function(socket){
      socket.on('disconnect', function(payload){
        count += 1;
      })
    });
    scene.update();
    assert.equal(channel.sockets.length, 1);
    scene.setProps({ showComponent: false });
    scene.update();
    assert.equal(channel.sockets.length, 0);
    assert.equal(count, 1);
    scene.remove();
  });

});