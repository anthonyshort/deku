var assert = require('component/assert@0.4.0');
var dom = require('/lib/node');
var Tree = require('/lib/mount/tree');

describe('tree', function(){

  it('parse a single node', function(){
    var node = dom();
    var tree = new Tree(node);
    assert(tree.get('0') === node);
  })

  it('parse a node with one level of children', function(){
    var node = dom('div', null, [
      dom('span'),
      dom('hr'),
      'Hello World'
    ]);
    var tree = new Tree(node);
    assert(tree.get('0') === node);
    assert(tree.get('0.0') === node.children[0]);
    assert(tree.get('0.1') === node.children[1]);
    assert(tree.get('0.2') === node.children[2]);
  })

  it('parse nodes with keys', function(){
    var node = dom('div', null, [
      dom('span', { key: 'foo' }, [
        dom()
      ])
    ]);
    var tree = new Tree(node);
    assert(tree.get('0.foo.0') === node.children[0].children[0]);
  })

  it('parse a node with two levels of children', function(){
    var node = dom('div', null, [
      dom('span'),
      dom('div', null, [
        dom(),
        'Second'
      ]),
      'Hello World'
    ]);
    var tree = new Tree(node);
    assert(tree.get('0') === node);
    assert(tree.get('0.0') === node.children[0]);
    assert(tree.get('0.1') === node.children[1]);
    assert(tree.get('0.1.0') === node.children[1].children[0]);
    assert(tree.get('0.1.1') === node.children[1].children[1]);
    assert(tree.get('0.2') === node.children[2]);
  })

  it('should get nodes using a string path', function () {
    var child = dom();
    var node = dom('div', null, [
      dom(),
      dom('div', null, [child])
    ]);
    var tree = new Tree(node);
    assert(tree.get('0.1.0') === child);
  })

})
