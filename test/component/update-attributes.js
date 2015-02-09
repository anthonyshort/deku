
describe('Patching Attributes', function(){
  var scene;

  var AttrComponent = component(function(props, state){
    var attrs = {};
    if (props.name) attrs.name = props.name;
    return dom('span', attrs);
  });

  beforeEach(function () {
    scene = AttrComponent.render(window.el);
    scene.update();
  });

  afterEach(function () {
    scene.remove();
  });

  it('should have default state', function () {
    assert.equal(el.innerHTML, '<span></span>');
  });

  it('should add attributes', function(){
    scene.setProps({ name: 'Bob' });
    scene.update();
    assert.equal(el.innerHTML, '<span name="Bob"></span>');
  })

  it('should update attributes', function(){
    scene.setProps({ name: 'Bob' });
    scene.update();
    scene.setProps({ name: 'Tom' });
    scene.update();
    assert.equal(el.innerHTML, '<span name="Tom"></span>');
  })

  it('should remove attributes', function(){
    scene.setProps({ name: 'Bob' });
    scene.update();
    scene.setProps({ name: null });
    scene.update();
    assert.equal(el.innerHTML, '<span></span>');
  })

  it('should not update attributes that have not changed', function(){
    var pass = true;
    var Page = component({
      afterMount: function(el){
        el.setAttribute = function(){
          pass = false;
        }
      },
      render: function(props, state){
        return dom('div', { name: props.name })
      }
    });
    var page = Page.render(el, { name: 'Bob' });
    page.setProps({ name: 'Bob' });
    page.update();
    assert(pass);
    page.remove();
  })

  it('should update the value of input fields', function () {
    var Input = component({
      render: function(props, state){
        return dom('input', { value: props.value })
      }
    });
    var page = Input.render(el, { value: 'Bob' });
    page.update();
    assert(el.querySelector('input').value === 'Bob');
    assert(el.querySelector('input').getAttribute('value') === 'Bob');
    page.setProps({ value: 'Tom' });
    page.update();
    assert(el.querySelector('input').value === 'Tom');
    assert(el.querySelector('input').getAttribute('value') === 'Bob');
    page.remove();
  })

  describe('innerHTML', function () {

    beforeEach(function(){
      el.innerHTML = "";
    })

    it('should render innerHTML', function () {
      var Test = component(function(){
        return dom('div', { innerHTML: 'Hello <strong>World</strong>' });
      });
      var page = Test.render(el);
      page.update();
      assert.equal(el.innerHTML,'<div>Hello <strong>World</strong></div>');
      page.remove();
    })

    it('should update innerHTML', function () {
      var Test = component(function(props){
        return dom('div', { innerHTML: props.content });
      });
      var page = Test.render(el, { content: 'Hello <strong>World</strong>' });
      page.update();
      page.setProps({ content: 'Hello <strong>Pluto</strong>' });
      page.update();
      assert.equal(el.innerHTML,'<div>Hello <strong>Pluto</strong></div>');
      page.remove();
    })

  });

});
