/** @jsx dom */

import assert from 'assert'
import {dom,deku} from '../../'
import {mount} from '../helpers'

function div() {
  return <div></div>;
}

describe('validation', function () {

  it('should validate missing props when first rendered', function(done){
    var Component = {
      render: div,
      propTypes: {
        'text': { type: 'string' }
      }
    }

    var app = deku()
    app.option('validateProps', true)
    app.mount(<Component />);

    mount(app, null, function(e){
      assert.equal(e.message, 'Missing prop named: text');
      done();
    })
  })

  it('should validate props types when first rendered', function(done){
    var Component = {
      render: div,
      propTypes: {
        'text': { type: 'string' }
      }
    }

    var app = deku()
    app.option('validateProps', true)
    app.mount(<Component text={true} />);

    mount(app, null, function(e){
      assert.equal(e.message, 'Invalid type for prop named: text');
      done();
    })
  })

  it('should validate unexpected prop values when first rendered', function (done) {
    var Component = {
      render: div,
      propTypes: {
        'text': { type: 'string', expects: ['foo', 'bar', 'baz'] }
      }
    }
    var app = deku()
    app.option('validateProps', true)
    app.mount(<Component text="raz" />);
    mount(app, null, function(e){
      assert.equal(e.message, 'Invalid value for prop named: text. Must be one of foo,bar,baz');
      done();
    })
  });

  it('should validate expected prop values when first rendered', function () {
    var Component = {
      render: div,
      propTypes: {
        'text': { type: 'string', expects: ['foo', 'bar', 'baz'] }
      }
    }
    var app = deku()
    app.option('validateProps', true)
    app.mount(<Component text="foo" />);
    mount(app)
  });

  it('should skip optional props when first rendered', function(){
    var Component = {
      render: div,
      propTypes: {
        'text': { type: 'string', optional: true }
      }
    }
    var app = deku()
    app.option('validateProps', true)
    app.mount(<Component />);
    mount(app)
  })

  it('should validate unknown properties', function(done){
    var Component = {
      render: div
    }
    var app = deku()
      .option('validateProps', true)
      .mount(<Component text="foo" />);
    mount(app, null, function(e){
      assert.equal(e.message, 'Unexpected prop named: text');
      done();
    })
  })

  it('should not validate if the option is not set', function () {
    var Component = {
      render: div
    }
    var app = deku()
      .option('validateProps', false)
      .mount(<Component text="foo" />);
    mount(app)
  });

});
