
describe('Patching Attributes', function(){
  var scene;

  var AttrComponent = component(function(dom, state, props){
    var attrs = {};
    if (props.name) attrs.name = props.name;
    return dom('span', attrs);
  });

  beforeEach(function () {
    scene = AttrComponent.render(window.el);
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
      render: function(dom, state, props){
        return dom('div', { name: props.name })
      }
    });
    var page = Page.render(el, { name: 'Bob' });
    page.setProps({ name: 'Bob' });
    page.update();
    assert(pass);
    page.remove();
  })
});
