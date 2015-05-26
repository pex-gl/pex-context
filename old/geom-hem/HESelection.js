define(["hem/HEMesh", "ext/ArrayExt", "pex/lib/underscore", "pex/lib/underscore"], function(HEMesh, ArrayExt, _) {

  function selected(o) { return o.selected; }

  function HESelection() {
  }

  HEMesh.prototype.clearVerticesSelection = function() {
    for(var i=0; i<this.vertices.length; i++) {
      this.vertices[i].selected = false;
    }
  };

  HEMesh.prototype.clearEdgeSelection = function() {
    for(var i=0; i<this.edges.length; i++) {
      this.edges[i].selected = false;
    }
  };

  HEMesh.prototype.clearFaceSelection = function() {
    for(var i=0; i<this.faces.length; i++) {
      this.faces[i].selected = false;
    }
  };

  HEMesh.prototype.clearSelection = function() {
    this.clearVerticesSelection();
    this.clearEdgeSelection();
    this.clearFaceSelection();
    return this;
  };

  HEMesh.prototype.clearMarking = function() {
    function removeMark(o) { o.marked = false; }
    this.vertices.forEach(removeMark);
    this.edges.forEach(removeMark);
    this.faces.forEach(removeMark);
  };

  //repeat until number is satified or there is no vertices left...
  HEMesh.prototype.selectRandomVertices = function(count) {
    count = (count === undefined) ? this.vertices.length/2 : count;
    count = Math.min(count, this.vertices.length);
    if (count <= 1) count = Math.floor(count * this.vertices.length);

    var vertices = this.vertices;
    this.clearSelection();

    function selectVertex(i) { vertices[i].selected = true; }

    var indexList = _.range(0, this.vertices.length);
    indexList = _.shuffle(indexList);
    indexList = _.first(indexList, count);
    _.each(indexList, selectVertex);

    return this;
  };

  //repeat until number is satified or there is no vertices left...
  HEMesh.prototype.selectRandomFaces = function(count) {
    count = (count === undefined) ? this.faces.length/2 : count;
    count = Math.min(count, this.faces.length);
    if (count < 1) count = Math.floor(count * this.faces.length);

    var faces = this.faces;
    this.clearSelection();

    function selectFace(i) { faces[i].selected = true; }

    var indexList = _.range(0, this.faces.length);
    indexList = _.shuffle(indexList);
    indexList = _.first(indexList, count);
    _.each(indexList, selectFace);

    return this;
  };

  HEMesh.prototype.selectAllFaces = function() {
    function selectFace(f) { f.selected = true; }
    _.each(this.faces, selectFace);
    return this;
  };

  HEMesh.prototype.saveSelection = function(name) {
    var selection = {
      vertices: this.vertices.filter(selected),
      edges: this.edges.filter(selected),
      faces: this.faces.filter(selected)
    };
    if (!this.savedSelections) this.savedSelections = {};
    this.savedSelections[name] = selection;
    return this;
  };

  HEMesh.prototype.loadSelection = function(name) {
    if (this.savedSelections && this.savedSelections[name]) {
      var selection = this.savedSelections[name];
      this.clearSelection();
    }
  };

  HEMesh.prototype.expandSelection = function() {
    this.vertices.filter(selected).forEach(function(vertex) {
      vertex.forEachFace(function(face) {
        face.selected = true;
      });
    });
    return this;
  };

  HEMesh.prototype.expandFaceSelection = function() {
    var neighborsToSelect = [];
    this.getSelectedFaces().forEach(function(face) {
      face.getNeighborFaces().forEach(function(neighborFace) {
        if (neighborsToSelect.indexOf(neighborFace) == -1) neighborsToSelect.push(neighborFace);
      });
    });
    function selectFace(face) { face.selected = true; }
    _.each(neighborsToSelect, selectFace);
    return this;
  };

  HEMesh.prototype.getSelectedVertices = function() {
    return this.vertices.filter(selected);
  };

  HEMesh.prototype.getSelectedFaces = function() {
    return this.faces.filter(selected);
  };

  HEMesh.prototype.hasSelection = function() {
    var selection = {
      vertices: this.vertices.filter(selected),
      edges: this.edges.filter(selected),
      faces: this.faces.filter(selected)
    };

    return (selection.vertices.length + selection.edges.length + selection.faces.length > 0)
  };

  return HESelection;
});
