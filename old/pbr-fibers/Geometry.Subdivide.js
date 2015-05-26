var geom = require('pex-geom');
var Geometry = geom.Geometry;
var Vec3 = geom.Vec3;

function centroid(points) {
  var n = points.length;
  var center = points.reduce(function(center, p) {
    return center.add(p);
  }, new Vec3(0, 0, 0));
  center.scale(1 / points.length);
  return center;
}

function next(edge) {
  return edge.face.halfEdges[(edge.slot + 1) % edge.face.length]
}

function prev(edge) {
  return edge.face.halfEdges[(edge.slot - 1 + edge.face.length) % edge.face.length]
}

function vertexEdgeLoop(edge, cb) {
  var curr = edge;

  do {
    cb(curr);
    curr = prev(curr).opposite;
  }
  while(curr != edge);
}

function edgeLoop(edge, cb) {
  var curr = edge;

  var i = 0;
  do {
    cb(curr, i++);
    curr = next(curr);
  }
  while(curr != edge);
}

function elements(list, indices) {
  return indices.map(function(i) { return list[i]; })
}

function props(properties) {
  return function(o) {
    return properties.map(function(prop) {
      return o[prop];
    });
  }
}

function move(a, b, t) {
  return b.dup().sub(a).normalize().scale(t).add(a);
}

//Based on ideas from
//http://fgiesen.wordpress.com/2012/04/03/half-edges-redux/
Geometry.prototype.computeHalfEdges = function() {
  var halfEdges = this.halfEdges = [];
  var faces = this.faces;

  faces.forEach(function(face, faceIndex) {
    face.halfEdges = [];
    face.forEach(function(vertexIndex, i) {
      var v0 = vertexIndex;
      var v1 = face[(i + 1) % face.length];
      var halfEdge = {
        edgeIndex: halfEdges.length,
        face: face,
        faceIndex: faceIndex,
        //vertexIndex: vertexIndex,
        slot: i,
        opposite: null,
        v0: Math.min(v0, v1),
        v1: Math.max(v0, v1)
      };
      face.halfEdges.push(halfEdge);
      halfEdges.push(halfEdge);
    });
  });

  halfEdges.sort(function(a, b) {
    if (a.v0 > b.v0) return 1;
    else if (a.v0 < b.v0) return -1;
    else if (a.v1 > b.v1) return 1;
    else if (a.v1 < b.v1) return -1;
    else return 0;
  });

  for(var i=1; i<halfEdges.length; i++) {
    var prev = halfEdges[i-1];
    var curr = halfEdges[i];
    if (prev.v0 == curr.v0 && prev.v1 == curr.v1) {
      prev.opposite = curr;
      curr.opposite = prev;
    }
  }

  return halfEdges;
}

Geometry.prototype.getFaceVertices = function(face) {
  return face.map(function(i) { return this.vertices[i]; }.bind(this));
}

//Non destructive Catmull-Clark subdivision
//Catmull-Clark subdivision for half-edge meshes
//Based on http://en.wikipedia.org/wiki/Catmull–Clark_subdivision_surface
//TODO: Study Doo-Sabin scheme for new vertices 1/n*F + 1/n*R + (n-2)/n*v
//http://www.cse.ohio-state.edu/~tamaldey/course/784/note20.pdf
//
//The shading part at the moment is that we put all vertices together at the end and have to manually
//calculate offsets at which each vertex, face and edge point end up
Geometry.prototype.catmullClark = function() {
  var vertices = this.vertices;
  var faces = this.faces;
  var halfEdges = this.computeHalfEdges();

  //face points are an average of all face points
  var facePoints = faces.map(this.getFaceVertices.bind(this)).map(centroid);

  //edge points are an average of both edge vertices and center points of two neighbor faces
  var edgePoints = [];
  halfEdges.forEach(function(e) {
    if (!edgePoints[e.edgeIndex]) {
      var midPoint = centroid([
        vertices[e.v0],
        vertices[e.v1],
        facePoints[e.faceIndex],
        facePoints[e.opposite.faceIndex]
      ]);
      edgePoints[e.edgeIndex] = midPoint;
      edgePoints[e.opposite.edgeIndex] = midPoint;
    }
  });

  //vertex points are and average of neighbor edges' edge points and neighbor faces' face points
  var vertexPoints = [];
  halfEdges.map(function(edge) {
    var vertexIndex = faces[edge.faceIndex][edge.slot];
    var vertex = vertices[vertexIndex];
    if (vertexPoints[vertexIndex]) return;
    var neighborFacePoints = [];
    //vertexEdgeLoop(edge).map(function(edge) { return facePoints[edge.faceIndex] } )
    //vertexEdgeLoop(edge).map(function(edge) { return edge.face.facePoint } )
    //extract(facePoints, vertexEdgeLoop(edge).map(prop('faceIndex'))
    var neighborEdgeMidPoints = [];
    vertexEdgeLoop(edge, function(edge) {
      neighborFacePoints.push(facePoints[edge.faceIndex]);
      neighborEdgeMidPoints.push(centroid([vertices[edge.v0], vertices[edge.v1]]));
    });
    var facesCentroid = centroid(neighborFacePoints);
    var edgesCentroid = centroid(neighborEdgeMidPoints);

    var n = neighborFacePoints.length;
    var v = new Vec3(0, 0, 0);
    v.add(facesCentroid);
    v.add(edgesCentroid.dup().scale(2));
    v.add(vertex.dup().scale(n - 3));
    v.scale(1/n);

    vertexPoints[vertexIndex] = v;
  });

  //create list of points for the new mesh
  //vertx poitns and face points are unique
  var newVertices = vertexPoints.concat(facePoints);

  //halfEdge mid points are not (each one is doubled)
  halfEdges.forEach(function(e) {
    if (e.added > -1) return;
    e.added = newVertices.length;
    e.opposite.added = newVertices.length;
    newVertices.push(edgePoints[e.edgeIndex]);
  })

  var newFaces = [];
  var newEdges = [];

  //construct new faces from face point, two edges mid points and a vertex between them
  faces.forEach(function(face, faceIndex) {
    var facePointIndex = faceIndex + vertexPoints.length;
    edgeLoop(face.halfEdges[0], function(edge) {
      var edgeMidPointsIndex = edge.added;
      var nextEdge = next(edge);
      var nextEdgeVertexIndex = face[nextEdge.slot];
      var nextEdgeMidPointIndex = nextEdge.added;
      newEdges.push([facePointIndex, edgeMidPointsIndex]);
      newEdges.push([edgeMidPointsIndex, nextEdgeVertexIndex]);
      newFaces.push([facePointIndex, edgeMidPointsIndex, nextEdgeVertexIndex, nextEdgeMidPointIndex])
    });
  });

  return new Geometry({ vertices: newVertices, faces: newFaces, edges: newEdges });
}

//Doo-Sabin subdivision as desribed in WIRE AND COLUMN MODELING
//http://repository.tamu.edu/bitstream/handle/1969.1/548/etd-tamu-2004A-VIZA-mandal-1.pdf  
Geometry.prototype.dooSabin = function(depth) {
  var vertices = this.vertices;
  var faces = this.faces;
  var halfEdges = this.computeHalfEdges();

  var newVertices = [];
  var newFaces = [];
  var newEdges = [];

  depth = depth || 0.1;

  var facePointsByFace = [];

  var self = this;

  faces.forEach(function(face, faceIndex) {
    var facePoints = facePointsByFace[faceIndex] = [];
    edgeLoop(face.halfEdges[0], function(edge) {
      var v = vertices[edge.face[edge.slot]];
      var p = centroid([
        v,
        centroid(elements(vertices, edge.face)),
        centroid(elements(vertices, [edge.v0, edge.v1])),
        centroid(elements(vertices, [prev(edge).v0, prev(edge).v1]))
      ]);
      facePoints.push(newVertices.length);
      newVertices.push(move(v, p, depth));
      //newVertices.push(p);
    });
    return facePoints;
  });

  //face face
  faces.forEach(function(face, faceIndex) {
    newFaces.push(facePointsByFace[faceIndex]);
  });

  halfEdges.forEach(function(edge, edgeIndex) {
    if (edge.edgeVisited) return;

    edge.edgeVisited = true;
    edge.opposite.edgeVisited = true;

    //edge face
    var e0 = edge;
    var e1 = next(e0.opposite);
    var e2 = e0.opposite;
    var e3 = next(e0);
    var newFace = [
      facePointsByFace[e0.faceIndex][e0.slot],
      facePointsByFace[e1.faceIndex][e1.slot],
      facePointsByFace[e2.faceIndex][e2.slot],
      facePointsByFace[e3.faceIndex][e3.slot]
    ];
    newFaces.push(newFace);
    newEdges.push([newFace[0], newFace[3]]);
    newEdges.push([newFace[1], newFace[2]]);
  });

  halfEdges.forEach(function(edge, edgeIndex) {
    if (edge.vertexVisited) return;

    //vertex face
    var vertexFace = [];
    vertexEdgeLoop(edge, function(e) {
      e.vertexVisited = true;
      vertexFace.push(facePointsByFace[e.faceIndex][e.slot])
    });
    newFaces.push(vertexFace)
    vertexFace.forEach(function(i, index) {
      newEdges.push([i, vertexFace[(index+1)%vertexFace.length]]);
    });
  });

  return new Geometry({ vertices: newVertices, faces: newFaces, edges: newEdges });
}

//Mesh wire modelling as described in
//http://repository.tamu.edu/bitstream/handle/1969.1/548/etd-tamu-2004A-VIZA-mandal-1.pdf  
Geometry.prototype.wire = function(edgeDepth, insetDepth) {
  insetDepth = (insetDepth != null) ? insetDepth : (edgeDepth || 0.1);
  edgeDepth = edgeDepth || 0.1;
  var newGeom = this.dooSabin(edgeDepth);
  newGeom.computeNormals();
  var halfEdges = newGeom.computeHalfEdges();
  var innerGeom = this.dooSabin(edgeDepth);
  innerGeom.computeNormals();

  //shrink the inner geometry
  innerGeom.vertices.forEach(function(v, vi) {
    v.sub(innerGeom.normals[vi].dup().scale(insetDepth));
  });

  //remove middle faces
  var cutFaces = newGeom.faces.splice(0, this.faces.length);
  innerGeom.faces.splice(0, this.faces.length);

  var vertexOffset = newGeom.vertices.length;

  //add inner vertices to new geom
  innerGeom.vertices.forEach(function(v, vi) {
    newGeom.vertices.push(v);
  });

  //add inner faces to new geom
  innerGeom.faces.forEach(function(f) {
    newGeom.faces.push(f.map(function(vi) {
      return vi + vertexOffset;
    }).reverse());
  });

  //add inner edges to new geom
  innerGeom.edges.forEach(function(e) {
    newGeom.edges.push(e.map(function(vi) {
      return vi + vertexOffset;
    }));
  });

  cutFaces.forEach(function(face) {
    edgeLoop(face.halfEdges[0], function(e) {
      var pe = prev(e);
      
      newGeom.faces.push([
        pe.face[pe.slot],
        e.face[e.slot],
        e.face[e.slot] + vertexOffset,
        pe.face[pe.slot] + vertexOffset
      ]);

      newGeom.edges.push([
        pe.face[pe.slot],
        pe.face[pe.slot] + vertexOffset
      ]);

      newGeom.edges.push([
        e.face[e.slot],
        e.face[e.slot] + vertexOffset
      ]);
    });
  });

  return newGeom;
}

Geometry.prototype.clone = function() {
  var edges = null;
  var vertices = this.vertices.map(function(v) { return v.dup(); });
  var faces = this.faces.map(function(f) { return f.slice(0); });
  var edges = this.edges ? this.edges.map(function(e) { return e.slice(0); }) : null;
  return new Geometry({ vertices: vertices, faces: faces, edges: edges });
}

Geometry.prototype.extrude = function(height, faceIndices) {
  height = height || 0.1;
  if (!faceIndices) faceIndices = this.faces.map(function(face, faceIndex) { return faceIndex; });
  var g = this.clone();
  var halfEdges = g.computeHalfEdges();

  var ab = new Vec3();
  var ac = new Vec3();
  var faceNormal = new Vec3();

  faceIndices.forEach(function(faceIndex) {
    var face = g.faces[faceIndex];
    var faceVerts = elements(g.vertices, face);

    var a = faceVerts[0];
    var b = faceVerts[1];
    var c = faceVerts[2];
    ab.asSub(b, a).normalize();
    ac.asSub(c, a).normalize();
    faceNormal.asCross(ab, ac).normalize();
    faceNormal.scale(height);

    var newVerts = faceVerts.map(function(v) {
      return v.dup().add(faceNormal);
    });

    var newVertsIndices = [];

    newVerts.forEach(function(nv) {
      newVertsIndices.push(g.vertices.length);
      g.vertices.push(nv);
    });

    //add new face for each extruded edge
    edgeLoop(face.halfEdges[0], function(e) {
      g.faces.push([
        face[e.slot],
        face[next(e).slot],
        newVertsIndices[next(e).slot],
        newVertsIndices[e.slot]
      ]);
    });

    //push the old face outside
    newVertsIndices.forEach(function(nvi, i) {
      face[i] = nvi;
    });
  });

  return g;
}