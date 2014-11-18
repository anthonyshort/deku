var assert = require('component/assert@0.4.0');
var dom = require('/lib/node');
var Tree = require('/lib/mount/tree');
var equal = require('/lib/mount/equal');

describe('matching trees', function(){

  it('should match trees', function () {
    var node = dom();
    var tree = new Tree(node);
    var node2 = dom();
    var tree2 = new Tree(node2);
    assert(equal(tree, tree2));
  })

  it('should match even if the text content is different', function () {
    var node = dom('div', null, ['Hello World']);
    var tree = new Tree(node);
    var node2 = dom('div', null, ['Hello Pluto']);
    var tree2 = new Tree(node2);
    assert(equal(tree, tree2));
  })

  it('should not match if a child is added', function () {
    var node = dom('div', null, []);
    var tree = new Tree(node);
    var node2 = dom('div', null, ['Hello World']);
    var tree2 = new Tree(node2);
    assert(equal(tree, tree2) === false);
  })

  it('should not match if a child is removed', function () {
    var node = dom('div', null, ['Hello World']);
    var tree = new Tree(node);
    var node2 = dom('div', null, []);
    var tree2 = new Tree(node2);
    assert(equal(tree, tree2) === false);
  })

  it('should not match if a child type changes', function () {
    var node = dom('div', null, ['Hello World']);
    var tree = new Tree(node);
    var node2 = dom('div', null, [dom()]);
    var tree2 = new Tree(node2);
    assert(equal(tree, tree2) === false);
  })


})
