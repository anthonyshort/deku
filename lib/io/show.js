
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
