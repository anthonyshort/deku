/**
 * This test is based on https://github.com/petehunt/petes-vdom-benchmark
 */

var component = deku.component;
var dom = deku.dom;
var N = 4667; // document.querySelectorAll('*').length on Facebook.com, simulating single-page app transition

/**
 * Create N virtual DOM elements of a certain type.
 */

function createElements(type) {
  var items = [];
  for (var i = 0; i < N; i++) {
    items.push(dom(type, {key: i}, 'element ' + i));
  }
  return items;
}

/**
 * This will render a list of N elements with a tagName.
 * We can switch the tagName of all of the children at once
 * by changing the prop.
 */

var SwitcherTest = component({
  render: function(props, state) {
    return dom('div', null, createElements(dom, props.tagName));
  }
});

var DivTest = component({
  render: function(props, state) {
    return dom('div', null, createElements(dom, 'div'));
  }
});

var SpanTest = component({
  render: function(props, state) {
    return dom('div', null, createElements(dom, 'span'));
  }
});

/**
 * Run the tests...
 */

suite('Petes', function () {
  var container = document.body;

  /**
   * We'll replace one large component on the scene
   * with another large component.
   */

  // bench('replace root', function(next) {
  //   var scene1 = DivTest.render(document.body);
  //   scene1.update();
  //   scene1.remove();
  //   var scene2 = SpanTest.render(document.body);
  //   scene2.update();
  //   scene2.remove();
  // });

  /**
   * This time we'll update all 4000+ child elements
   * by switching their tagNames. This will create brand new elements
   * and replace all of them in the DOM.
   */

  bench('update all child element tagNames (no requestAnimationFrame)', function() {
    var scene = SwitcherTest.render(document.body, {tagName: 'span'});
    scene.update();
    scene.setProps({tagName: 'div'});
    scene.update();
    scene.remove();
  });

});