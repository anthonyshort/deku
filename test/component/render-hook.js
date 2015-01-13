
describe('Render Hook', function () {

  it('should throw an error if the render method does not return a node', function(done){
    var InvalidRender = component(function(){
      return false;
    });
    try {
      InvalidRender.render(el);
      done(false);
    } catch (e) {
      done();
    }
  });

  it('should not allow setting the state during render', function (done) {
    var Impure = component(function(dom){
      this.setState({ foo: 'bar' });
      return dom();
    });
    try {
      Impure.render(el);
    } catch(e) {
      return done();
    }
    throw new Error('Did not prevent set state during render');
  });

});