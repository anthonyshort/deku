/** @jsx dom */

var deku = require('../');
var component = deku.component;

var App = component(renderApp)
  .prop('dialog', { source: 'dialog' });

function renderApp(props) {
  return props.dialog
    ? props.dialog
    : <Button/>;
}

var Button = component(renderButton)
  .prop('setDialog', { source: 'setDialog' });

function renderButton(props) {
  var setDialog = props.setDialog;
  return <button onClick={onClick}>Click me</button>;

  function onClick() {
    setDialog(<Dialog></Dialog>);
  }
}

var Dialog = component(renderDialog)
  .prop('hide', { source: 'setDialog' });

function renderDialog() {
  return <h1 onClick={onClick}>Hello from a dialog</h1>;

  function onClick() {
    setDialog(null);
  }
}

var app = deku();
app.use(layer('dialog'));
app.mount(document.body, App);

/**
 * App plugin to show/hide "layers".
 *
 *   app.use(show('dialog'))
 *
 * @param {Array} names
 */

function layer(name, initial) {
  return function(app){
    app.source(name, initial);
    app.source(`set${name}`, show);

    /**
     * Show some data.
     *
     * @param {Mixed} data Can be a virtual node(!) or just plain data. Or set it to null to remove
     */

    function show(data) {
      app.value(name, data);
    }
  };
}
