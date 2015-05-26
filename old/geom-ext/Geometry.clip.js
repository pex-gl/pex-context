var geom = require('pex-geom');
var Line3D = require('./Line3D')
var Geometry = geom.Geometry;
var Vec3 = geom.Vec3;
var Triangle3D = geom.Triangle3D;

var EPSYLON = 0.0001;

function next(edge) {
  return edge.face.halfEdges[(edge.slot + 1) % edge.face.length]
}

function prev(edge) {
  return edge.face.halfEdges[(edge.slot - 1 + edge.face.length) % edge.face.length]
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

function edgePairLoop(edge, cb) {
  var curr = edge;

  var i = 0;
  do {
    cb(curr, next(curr));
    curr = next(curr);
  }
  while(curr != edge);
}

function validateFace(f) {
  var valid = true;
  f.halfEdges.forEach(function(e) {
    if (e.face != f) {
      valid = false;
    }
  });
  return valid;
}


//where does this should go? geom.Utils expanded to geom?
function centroid(points) {
  var n = points.length;
  var center = points.reduce(function(center, p) {
    return center.add(p);
  }, new Vec3(0, 0, 0));
  center.scale(1 / points.length);
  return center;
}

function elements(list, indices) {
  return indices.map(function(i) { return list[i]; })
}

function verifyEdges(edges) {
  var invalidMsg = null;
  edges.forEach(function(e) {
    if (!e.opposite) invalidMsg = 'Invalid mesh: No opposite edge';
    else if (e.opposite && e.opposite.opposite != e) invalidMsg = 'Invalid mesh: No opposite doesn\'t poitn back';
  });
  return invalidMsg;
}

//
//   x                    x
//  /|                   /|
//   |       newHalfEdge  |  o
//   |                    |/
// e | o                  x
//   |                   /|
//   |                 e  |  newHalfEdgeOposite
//   |/                   |/
//   x                    x
//
Geometry.prototype.splitEdge = function(e, ratio) {
  var ne = next(e);
  var a = this.vertices[e.face[e.slot]];
  var b = this.vertices[ne.face[ne.slot]];

  var wasErr = verifyEdges(this.halfEdges);

  //add new vertex to the geometry
  var newVertex = b.dup().sub(a).scale(ratio).add(a);
  this.vertices.push(newVertex);
  var newVertexIndex = this.vertices.length - 1;

  var o = e.opposite;

  if (!o) {
    throw new Error('no opposite edge');
  }

  var newHalfEdge = {
    face: e.face,
    slot: e.slot + 1
  };

  //insert new edge after the split one
  e.face.halfEdges.splice(e.slot + 1, 0, newHalfEdge);

  //add new vertext ot the face
  e.face.splice(e.slot + 1, 0, newVertexIndex);

  //increase slot index of all edges after the old one
  for(var i=e.slot+2; i<e.face.halfEdges.length; i++) {
    e.face.halfEdges[i].slot++;
  }

  var newHalfEdgeOposite = {
    face: o.face,
    slot: o.slot + 1
  }

  //insert new edge after the split one
  o.face.halfEdges.splice(o.slot + 1, 0, newHalfEdgeOposite);
  o.face.splice(o.slot + 1, 0, newVertexIndex);

  //increase slot index of all edges after the old one
  for(var i=o.slot+2; i<o.face.halfEdges.length; i++) {
    o.face.halfEdges[i].slot++;
  }

  newHalfEdge.opposite = o;
  o.opposite = newHalfEdge;
  newHalfEdgeOposite.opposite = e;
  e.opposite = newHalfEdgeOposite;

  this.halfEdges.push(newHalfEdge);
  this.halfEdges.push(newHalfEdgeOposite);

  //var err = verifyEdges(this.halfEdges);
  //if (err) {
  //  console.log('Was err ?', wasErr != null, wasErr)
  //  throw new Error(err);
  //}
}

//   / ve2                    / ve2
//  x------x------x          x------x------x
//  |             |          |     /|      |
//  |             |          |  se2 |      |
//  |             |    ->    |      |      |
//  |             |          |      | se1  |
//  |             |          |      |/     |
//  x------x------x          x------x------x
//           ve1 /                    ve1 /

//   / ve2                    / ve2
//  x-------------x          x-------------x
//  |             |          |          __^|
//  |             |          |   se2 __/   |
//  |             |    ->    |    __/      |
//  |             |          | __/  se1    |
//  |             |          |v            |
//  x-------------x          x-------------x
//           ve1 /                    ve1 /

Geometry.prototype.splitFace = function(vert1Edge, vert2Edge) {
  var oldFace = vert1Edge.face;
  var splitEdge1 = { };
  var splitEdge2 = { };
  this.halfEdges.push(splitEdge1);
  this.halfEdges.push(splitEdge2);
  splitEdge1.opposite = splitEdge2;
  splitEdge2.opposite = splitEdge1;

  var oldFaceUpdated = [];
  var newFace = [];
  oldFaceUpdated.halfEdges = [];
  newFace.halfEdges = [];

  //loop from first split vertex to the second and collect vertices
  var tmpEdge = vert1Edge;
  do {
    oldFaceUpdated.push(tmpEdge.face[tmpEdge.slot]);
    oldFaceUpdated.halfEdges.push(tmpEdge);
    tmpEdge = next(tmpEdge);
  } while(tmpEdge != vert2Edge);
  oldFaceUpdated.push(tmpEdge.face[tmpEdge.slot]);
  oldFaceUpdated.halfEdges.push(splitEdge1);

  //loop from second split vertex to the first and collect vertices
  var tmpEdge = vert2Edge;
  do {
    newFace.push(tmpEdge.face[tmpEdge.slot]);
    newFace.halfEdges.push(tmpEdge);
    tmpEdge = next(tmpEdge);
  } while(tmpEdge != vert1Edge);
  newFace.push(tmpEdge.face[tmpEdge.slot]);
  newFace.halfEdges.push(splitEdge2);

  //rebuild old face only with remaining vertices
  oldFace.length = 0;
  oldFaceUpdated.forEach(function(i) {
    oldFace.push(i);
  });
  oldFace.halfEdges = oldFaceUpdated.halfEdges;

  //add new face
  this.faces.push(newFace);

  //fix slots
  oldFace.halfEdges.forEach(function(e, i) { e.face = oldFace; e.slot = i; });
  newFace.halfEdges.forEach(function(e, i) { e.face = newFace; e.slot = i; });
}

Geometry.prototype.clip = function(plane, remove, debug) {
  try {
  if (typeof(remove) == 'undefined') remove = true;
  if (debug) console.log('  Clip');

  var g = this.clone();
  var numFaces = g.faces.length;

  g.computeHalfEdges();

  if (debug) {
    var err = verifyEdges(g.halfEdges);
    console.log('  Clip before:', err ? err : 'valid')
  }

  if (debug) console.log('  For each face', g.faces.length)

  //got through all face's edges and see if they are cut throug with the plane
  g.faces.forEach(function(face, faceIndex) {
    var hits = [];
    edgePairLoop(face.halfEdges[0], function(e, ne) {
      if (!g.vertices[ne.face[ne.slot]]) {
        console.log('uuu', ne.face[ne.slot], g.vertices.length);
      }
      var edgeLine = new Line3D(g.vertices[e.face[e.slot]], g.vertices[ne.face[ne.slot]]);
      var p = plane.intersectSegment(edgeLine);
      if (p && p.ratio >= -EPSYLON && p.ratio <= 1 + EPSYLON) {
        var found = false;
        hits.forEach(function(hit) {
          if (hit.point.equals(p)) found = true;
        });
        if (!found) {
          hits.push({edge:e, point:p, ratio: p.ratio});
        }
      }
    });

    if (debug) console.log('  hits', hits.length)

    //if face has two hits, we cut it through
    if (hits.length == 2) {
      var splitEdge0 = hits[0].edge;
      var splitEdge1 = hits[1].edge;
      var newEdge;

      if (debug) console.log('  Cutting')

      //if the hit ratio is between two points  (not touching any of them) then we split the edge
      if (hits[0].ratio > 0 + EPSYLON && hits[0].ratio < 1 - EPSYLON) {
        if (debug) console.log('  split1');
        g.splitEdge(splitEdge0, hits[0].ratio);
        splitEdge0 = next(splitEdge0);
      }
      //if we super close to the second corner move the the next edge
      else if (hits[0].ratio > 1 - EPSYLON) {
        splitEdge0 = next(splitEdge0);
      }

      //if the hit ratio is between two points (not touching any of them) then we split the edge
      if (hits[1].ratio > 0 + EPSYLON && hits[1].ratio < 1 - EPSYLON) {
        if (debug) console.log('  split2')
        g.splitEdge(splitEdge1, hits[1].ratio);
        splitEdge1 = next(splitEdge1);
      }
      //if we super close to the second corner move the the next edge
      else if (hits[1].ratio > 1 - EPSYLON) {
        splitEdge1 = next(splitEdge1);
      }

      var edgeSplit = next(splitEdge0) == splitEdge1 || prev(splitEdge0) == splitEdge1;
      if (!edgeSplit) {
        g.splitFace(splitEdge0, splitEdge1);
      }
    }
  });

  if (debug) console.log('  Done splitting');

  var facesToRemove = [];

  g.halfEdges.forEach(function(e) { e.onThePlane = false; });

  g.faces.map(function(face, faceIndex) {
    var center = centroid(elements(g.vertices, face));
    var above = face.above = plane.isPointAbove(center);
    if (above) {
      facesToRemove.push(face);
      face.remove = true;
    }
    else face.remove = false;
  });

  if (debug) console.log('  facesToRemove', facesToRemove.length);

  var newFaceEdges = [];

  facesToRemove.forEach(function(face) {
    edgePairLoop(face.halfEdges[0], function(e, ne) {
      if (plane.contains(g.vertices[e.face[e.slot]]) && plane.contains(g.vertices[ne.face[ne.slot]])) {
        e.onThePlane = true;
        e.opposite.onThePlane = true;
        newFaceEdges.push(e);
      }
    });
  });

  g.vertices.forEach(function(v, vi) { v.index = vi; });

  if (debug) console.log('  newFaceEdges', newFaceEdges.length);

  if (newFaceEdges.length == 0) {
    return g;
  }

  if (debug) console.log('  newEdges', newFaceEdges.map(function(e) { return e.face[e.slot]; }));

  var newFaceEdgesSorted = [];
  newFaceEdgesSorted.push(newFaceEdges.shift());

  var guard = 0;
  while (newFaceEdges.length > 0 && ++guard < 1000) {
    var ne = next(newFaceEdgesSorted[newFaceEdgesSorted.length-1]);
    var endVert = ne.face[ne.slot]
    newFaceEdges.forEach(function(edge, edgeIndex) {
      var vert = edge.face[edge.slot]
      if (endVert == vert) {
        newFaceEdgesSorted.push(edge);
        newFaceEdges.splice(edgeIndex, 1);
      }
    });
  }

  if (!remove) return g;

  var newFace = newFaceEdgesSorted.map(function(e) {
    return e.face[e.slot];
  });

  if (guard > 999) console.log('  guard 1000')
  if (debug) console.log('  newFace', newFace);

  //new created face would be invalid
  //not clear why these degenerated faces happen (accuracy issues?)
  //should switch to CSG for that instead of halfEdges
  if (newFace.length < 3) {
    if (debug) {
      console.log('Invalid face, nothing to cut');
    }
    return g;
  }

  newFace.halfEdges = newFaceEdgesSorted;
  newFace.halfEdges.forEach(function(e, ei) {
    e.face = newFace;
    e.slot = ei;
  });

  //if (debug) {
  //  console.log('  ' + g.faces.map(function(f) {
  //    var valid = true;
  //    f.forEach(function(v) {
  //      if (v > g.vertices.length - 1) {
  //        valid = false;
  //        console.log(v, f.map(function(i) { return i; }), g.vertices.length)
  //      }
  //    });
  //    return valid ? '+' : '-';
  //  }).join(''))
  //}

  var verticesToRemove = [];
  var verticesToKeep = [];
  facesToRemove.forEach(function(face) {
    g.faces.splice(g.faces.indexOf(face), 1);
    face.halfEdges.forEach(function(e) {
      if (!e.onThePlane) {
        var v = g.vertices[e.face[e.slot]];
        if (verticesToRemove.indexOf(v) == -1) {
          verticesToRemove.push(v);
        }
        g.halfEdges.splice(g.halfEdges.indexOf(e), 1);
      }
      else {
        var v = g.vertices[e.face[e.slot]];
        if (verticesToKeep.indexOf(v) == -1) {
          verticesToKeep.push(v);
        }
      }
    });
  });

  verticesToKeep.forEach(function(v) {
    var vi = verticesToRemove.indexOf(v);
    if (vi !== -1) {
      verticesToRemove.splice(vi, 1);
    }
  });

  g.faces.push(newFace);

  verticesToRemove.forEach(function(v) {
    var vi = g.vertices.indexOf(v);
    if (vi > -1) {
      g.vertices.splice(vi, 1);
      g.faces.forEach(function(face) {
        for(var i=0; i<face.length; i++) {
          if (face[i] > vi) {
            face[i]--;
          }
        }
      })
    }
  });

  if (debug) {
    g.computeHalfEdges();
    var err = verifyEdges(g.halfEdges);
    console.log('  Clip after:', err ? err : 'valid');
    if (err) throw new Error(err);
  }

  //if (debug) {
  //  console.log('  ' + g.faces.map(function(f) {
  //    var valid = true;
  //    f.forEach(function(v) {
  //      if (v > g.vertices.length - 1) {
  //        valid = false;
  //        console.log(v, f.map(function(i) { return i; }), g.vertices.length)
  //      }
  //    });
  //    return valid ? '+' : '-';
  //  }).join(''))
  //}

  if (debug) {
    console.log('  done');
  }

  return g;
  }
  catch(e) {
    console.log(e.stack);
    return this.clone();
  }
}
