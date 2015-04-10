
/**
 * Module dependencies.
 */

var Emitter = require('component-emitter');
var rendering = require('./renderer/dom');
var dataflow = require('./io/data');

/**
 * Expose `Application`.
 */

module.exports = Application;

/**
 * Create a new `Application`.
 */

function Application() {
  if (!(this instanceof Application)) return new Application;
  this.options = {};
  this.debug = false;

  if (typeof window !== 'undefined') {
    this.use(rendering);
    this.use(dataflow);
  }
}

/**
 * Mixin `Emitter`.
 */

Emitter(Application.prototype);

/**
 * Add a plugin
 *
 * @param {Function} plugin
 */

Application.prototype.use = function(plugin){
  plugin(this);
  return this;
};

/**
 * Set global app options.
 */

Application.prototype.set = function(key, val){
  this.options[key] = val;
  return this;
};

/**
 * Register data source name.
 *
 * @param {String} name
 */

Application.prototype.source = function(name, fn){
  this.send('subscribe', { name: name, fn: fn });
  return this;
};

/**
 * Set value used somewhere in the IO network.
 */

Application.prototype.value = function(source, data){
  this.send('update value', {
    type: source,
    data: data
  });
  return this;
};

/**
 * Specify a layer.
 */

Application.prototype.layer = function(name, el){
  this.send('register layer', { name: name, el: el });
  return this;
};

/**
 * Mount component into app.
 */

Application.prototype.mount = function(component, props){
  props = props || {};
  this.send('mount', {
    component: component,
    props: props,
  });
};

/**
 * Remove the app. Unmount everything.
 */

Application.prototype.remove =
Application.prototype.unmount = function(){
  this.send('unmount');
};

/**
 * Easy way to test updating properties on components.
 *
 * @param {String|Integer} path Defaults to 0 for api sugar.
 */

Application.prototype.setProps =
Application.prototype.update = function(path, props){
  var data = 1 == arguments.length
    ? { path: '0', props: path }
    : { path: String(path), props: props };
  this.send('update component', data);
};

/**
 * Send message to the app.
 *
 * @param {String} type
 * @param {Object} data
 */

Application.prototype.send = function(type, data){
  this.emit(type, data);
};
