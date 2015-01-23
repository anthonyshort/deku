
describe('Render Hook', function () {

  it.skip('should throw an error if the render method does not return a node', function(done){
    var InvalidRender = component(function(){
      return false;
    });
    try {
      var scene = InvalidRender.render(el);
      scene.update();
      done(false);
    } catch (e) {
      done();
    }
  });

  it('should not allow setting the state during render', function (done) {
    var Impure = component(function(){
      this.setState({ foo: 'bar' });
      return dom();
    });
    try {
      var scene = Impure.render(el);
      scene.update();
    } catch(e) {
      return done();
    }
    throw new Error('Did not prevent set state during render');
  });

});