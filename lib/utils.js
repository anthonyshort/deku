
/**
 * Zip multiple arrays together into one array
 *
 * @return {Array}
 */

exports.zip = function () {
  var args = Array.prototype.slice.call(arguments, 0);
  return args.reduce(function (a, b) {
    return a.length > b.length ? a : b;
  }, []).map(function (_, i) {
    return args.map(function (arr) {
      return arr[i];
    });
  });
};

/**
 * HTML attribute string
 * @param  {String} key
 * @param  {String} value
 * @return {String}
 */

exports.attr = function(key, value) {
  return key + '="' + value + '"';
};

/**
 * Convert an object into attributes
 *
 * eg. { name: 'foo' } => name="foo"
 *
 * @param {Object} obj
 * @return {String}
 */

exports.objectToAttributes = function(obj) {
  return Object.keys(obj)
    .filter(function(key){
      var value = obj[key];
      if (Array.isArray(value) && value.length === 0) {
        return false;
      }
      return value !== false;
    })
    .map(function(key){
      var value = obj[key];

      if (Object(value) === value) {
        var data = [];
        for (var name in value) {
          data.push(attr(key + '-' + name, value[name]));
        }
        return data.join(' ');
      }

      if (Array.isArray(value)) {
        return exports.attr(value.join(' '));
      }

      return exports.attr(value);
    })
    .join(' ');
};