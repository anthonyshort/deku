
/**
 * Module dependencies.
 */

var Emitter = require('component-emitter');
var Value = require('../value');
var uid = require('get-uid');

/**
 * Expose `data`.
 */

module.exports = data;

/**
 * Define dataflow IO for app.
 *
 * @param {Application} app
 * @return {Function} teardown Unsubscribe from this datasource.
 */

function data(app) {
  setup();

  /**
   * Subscribe to data source.
   */

  function setup() {
    app.subscriptions = {};
    app.network = {};
    app.sources = {};
    app.on('unsubscribe', unsubscribe);
    app.on('subscribe', subscribe);
    app.on('insert value', insert);
    app.on('update value', update);
    app.on('remove value', remove);
  }

  /**
   * Unsubscribe from data source.
   */

  function teardown() {
    app.subscriptions = {};
    app.network = {};
    app.sources = {};
    app.off('unsubscribe', unsubscribe);
    app.off('subscribe', subscribe);
    app.off('insert value', insert);
    app.off('update value', update);
    app.off('remove value', remove);
  }

  /**
   * Subscribe to a data source defined in app.
   */

  function subscribe(data) {
    var name = data.name;
    var fn = data.fn;
    var subscriptions = app.subscriptions;
    var sources = app.sources;
    sources[name] = fn;
    insert(Value(name)); // insert top-level value.
    subscriptions[name] = fn(app);
  }

  /**
   * Unsubscribe from a data source defined in app.
   */

  function unsubscribe(name) {
    var subscriptions = app.subscriptions;
    var fn = subscriptions[name];
    fn();
    delete subscriptions[name];
  }

  /**
   * Add a value to the dataflow network.
   *
   * TODO: This should be a simple, though complex, algorithm to figure out.
   * Once this is done, then the data is wired up!
   *
   * TODO: merge these in an optimal way to the `app.network`.
   * 1. create `IO` node from this `value`.
   * 2. pipe io change to value
   * 3. also, somehow insert IO node in proper place in existing IO graph.
   *
   * @param {Value} value
   */

  function insert(value) {
    var network = app.network;
    var sources = app.sources;
    // build list of them from parent to child for iterating.
    var child = value;
    var chain = [ child ];
    while (child.parent) {
      child = child.parent;
      chain.unshift(child);
    }

    var parentPath;
    var parentIO;
    var parent;
    var path;
    var io;

    // pipe parents to children when they change.
    // this builds the whole IO graph.
    chain.forEach(function(child){
      if (!parent) {
        path = child.type;
        // it's a root child
        if (!sources[path]) throw new Error('Source "' + path + '" doesnt exist.');
        io = network[path] = network[path] || IO(path);
        parentPath = path;
        parent = child;
        parentIO = io;
        return;
      }

      // can't be a source after this point (it seems, at least gonna try)
      path = parentPath + '.' + child.type; // interval.map, interval.filter.convert..., etc.
      io = network[path];
      // TODO: somehow create function inside `IO` for actually
      // doing the map/filter/etc.
      if (!io) {
        io = network[path] = IO();
        // pipe parentIO to childIO, but only first time around.
        parentIO.pipe(io);
      }
    });

    // then when the last value changes, emit an event on the value.
    // this will cause components to update!
    // that happens in ./dom.js
    io.pipe(value); // `io` is the last one.
  }

  /**
   * Begin processing a top-level "source" event.
   *
   * This starts at the "root" of the graph. And then,
   * by following the value chains, sends/transforms
   * the values to the end nodes. The end result is that it
   * sets some property on a component, which triggers re-rendering.
   * Or it could send a request too, stuff like that.
   *
   * @param {Object} message
   */

  function update(message) {
    var type = message.type;
    var data = message.data;
    var io = app.network[type]; // network['interval'] == value('interval')
    io.send(data);
  }

  /**
   * Remove values from dataflow network.
   */

  function remove(value) {
    throw new Error('not implemented yet');
  }

  return teardown;
}

/**
 * Data flow IO.
 */

function IO(name, fn) {
  if (!(this instanceof IO)) return new IO(name);
  this.property = name || 'input'; // TODO: figure out single/multiple inputs
  this.id = uid();
  this.fn = fn; // transducer function
}

/**
 * Mixin `Emitter`.
 */

Emitter(IO.prototype);

/**
 * Send input values to this `IO` node.
 *
 * Once all inputs are satisfied, the
 * dataflow / io engine will notify the world.
 * The world will then find all the other IO nodes
 * that receive this IO node as input. It does this
 * by looking up output connections by its `id`.
 */

IO.prototype.send = function(data){
  this.value = data; // cache so it passes it to anything that gets piped to later.
  // TODO: apply transformation somehow.
  this.emit('update', data);
};

/**
 * Pipe changes to another node.
 */

IO.prototype.pipe = function(next){
  this.on('update', function(data){
    next.send(data);
  });
  // pipe initial value if there is one.
  if (null != this.value) next.send(this.value);
};
