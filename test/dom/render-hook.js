import {component,scene,render} from '../../';
import {mount} from '../helpers';

it('should not allow setting the state during render', function (done) {
  var Impure = component(function(){
    this.setState({ foo: 'bar' });
    return dom();
  });
  try {
    var app = scene(Impure)
    mount(app)
  } catch(e) {
    return done();
  }
});

