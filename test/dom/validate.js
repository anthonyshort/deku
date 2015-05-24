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
      assert.equal(e.message, 'Missing property: text');
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
      assert.equal(e.message, 'Invalid property type: text');
      done();
    })
  })

  it('should validate props types when type is validate function', function(done){
    var Component = {
      render: div,
      propTypes: {
        'text': { type: function (value) { return value === 'value'; } }
      }
    }

    var app = deku()
    app.option('validateProps', true)
    app.mount(<Component text="not-value" />);

    mount(app, null, function(e){
      assert.equal(e.message, 'Invalid property type: text');
      done();
    })
  })

  it('should validate props types when type is array of possible types', function(done){
    var Component = {
      render: div,
      propTypes: {
        'text': { type: ['boolean', 'number'] }
      }
    }

    var app = deku()
    app.option('validateProps', true)
    app.mount(<Component text="string" />);

    mount(app, null, function(e){
      assert.equal(e.message, 'Invalid property type: text');
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
      assert.equal(e.message, 'Invalid property value: text');
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
      assert.equal(e.message, 'Unexpected property: text');
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

  it('should validate nested types', function (done) {
    var Component = {
      render: div,
      propTypes: {
        'data': {
          type: {
            'text': { type: 'string' }
          }
        }
      }
    }
    var app = deku()
    app.option('validateProps', true)
    app.mount(<Component data={{ text: true }} />);
    mount(app, null, function(e){
      assert.equal(e.message, 'Invalid property type: data.text');
      done();
    })
  });

  it('should validate missing nested types', function (done) {
    var Component = {
      render: div,
      propTypes: {
        'data': {
          type: {
            'text': { type: 'string' }
          }
        }
      }
    }
    var app = deku()
    app.option('validateProps', true)
    app.mount(<Component />);
    mount(app, null, function(e){
      assert.equal(e.message, 'Missing property: data');
      done();
    })
  });

  it('should allow optional nested types', function () {
    var Component = {
      render: div,
      propTypes: {
        'data': {
          type: {
            'text': { type: 'string', optional: true }
          }
        }
      }
    }
    var app = deku()
    app.option('validateProps', true)
    app.mount(<Component data={{}} />);
    mount(app)
  });

});
