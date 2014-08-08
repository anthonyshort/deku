
// function PatchRemove(oldNode, newNode, patch) {
//   this.oldNode = oldNode;
//   this.newNode = newNode;
// };

// PatchRemove.prototype.apply = function(el) {
//   patch.emit('remove', el);
//   el.parentNode.removeChild(el);
// };


module.exports = function(patch){
  return function(el) {
    patch.emit('remove', el);
    el.parentNode.removeChild(el);
  };
};