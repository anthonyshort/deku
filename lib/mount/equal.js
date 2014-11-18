
/**
 * Dependencies
 */

var sha = require('apily/sha1').hex;

/**
 * Determine if two trees have the same structure
 *
 * @param {Tree} left
 * @param {Tree} right
 *
 * @return {Boolean}
 */

module.exports = function(left, right) {
  return sha(toString(left)) === sha(toString(right));
}

/**
 * Stringify a tree
 *
 * @param {Tree} tree
 *
 * @return {String}
 */

function toString(tree) {
  var id = '';
  tree.walk(function(path, node){
    id += path + '[' + node.type + ']'
  });
  return id;
}