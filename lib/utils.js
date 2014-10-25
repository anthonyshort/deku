
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
