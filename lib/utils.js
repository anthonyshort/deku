
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