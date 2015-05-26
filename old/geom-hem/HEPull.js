define(["hem/HEMesh"], function(HEMesh, _) {

  function HEPull() {
  }

  HEMesh.prototype.pull = function(amount, radius, variation) {
    variation = variation || 0;
    var cache = [];
    this.getSelectedVertices().forEach(function(vertex, i) {
      var a = amount - amount * (Math.random() * variation);
      var n = vertex.getNormal();
      cache[i] = vertex.added(n.scaled(a));
      //cache[i] = vertex.add(n.scaled(a));
    })
    this.getSelectedVertices().map(function(vertex, i) {
      vertex.x = cache[i].x;
      vertex.y = cache[i].y;
      vertex.z = cache[i].z;
      return cache[i];
    });
    return this;
  }

  return HEPull;
});
