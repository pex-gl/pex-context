define (require) ->
  HEMesh = require('pex/geom/hem/HEMesh')
  HEVertex = require('pex/geom/hem/HEVertex')
  HEFace = require('pex/geom/hem/HEFace')
  HEEdge = require('pex/geom/hem/HEEdge')

  HEMesh.prototype.dup = () ->
    copy = new HEMesh()
    copy.vertices = @vertices.map (v) -> new HEVertex(v.position.x, v.position.y, v.position.z)
    copy.faces = @faces.map () -> new HEFace()
    copy.edges = @edges.map () -> new HEEdge()

    @vertices.forEach (v, i) =>
      copy.vertices[i].edge = copy.edges[@edges.indexOf(v.edge)]

    @edges.forEach (e, i) =>
      copy.edges[i].vert = copy.vertices[@vertices.indexOf(e.vert)]
      copy.edges[i].pair = copy.edges[@edges.indexOf(e.pair)]
      copy.edges[i].next = copy.edges[@edges.indexOf(e.next)]
      copy.edges[i].face = copy.faces[@faces.indexOf(e.face)]
      copy.edges[i].face.edge = copy.edges[i]

    copy

  HEMesh