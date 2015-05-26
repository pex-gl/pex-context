define(["pex/core/Core", "hem/HEMesh", "pex/lib/underscore"], function(Core, HEMesh, _) {
  
  function HESmooth() {
  }

  HEMesh.prototype.smooth = function(amount) {
    var cache = [];
    this.vertices.forEach(function(vertex, i) {
      var avg = new Core.Vec3(vertex.x, vertex.y, vertex.z);
      var vertCount = 1;
      vertex.forEachEdge(function(e) {
        ++vertCount
        avg.add(e.next.vert);
      })
      avg.scale(1/vertCount);
      cache[i] = avg;
    })    
    this.vertices.map(function(vertex, i) {
      vertex.x = cache[i].x;
      vertex.y = cache[i].y;
      vertex.z = cache[i].z;            
      return vertex;
    });
    return this;
  }

  return HESmooth;
});
