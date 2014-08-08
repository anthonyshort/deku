
function Patch(diffs) {
  this.diffs = diffs;
}

emitter(Patch);


Patch.prototype.apply = function(node) {
  this.diffs.forEach(function(diff){
    diff.patch(node);
  });
};