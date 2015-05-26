define([
  "hem/HEMesh",
  "hem/HEVertex",
  "hem/HEEdge",
  "hem/HEFace",
  "pex/core/Vec3"
  ],
  function(HEMesh, HEVertex, HEEdge, HEFace, Vec3) {

  function HESubdivideFaceCenter() {
  }

  HEMesh.prototype.subdivideFaceCenter = function() {
    var numFaces = this.faces.length;
    var edgesToSelect = [];

    for(var i=0; i<numFaces; i++) {
      var face = this.faces[i];
      var newEdge = this.splitFaceAtPoint(face, face.getCenter());
      edgesToSelect.push(newEdge);
    }

    this.clearSelection();
    edgesToSelect.forEach(function(edge) {
      edge.vert.selected = true;
    })

    return this;
  };

  return HESubdivideFaceCenter;
});
