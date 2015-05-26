//A collection of vertices, vertex attributes and faces or edges defining a 3d shape.
//(area for 2D or volume for 3D) for a given geometry or a set of points
//
//## Example use
//      var vertices = [
//        new Vec3(0, 1, 0),
//        new Vec3(0, 0, 0),
//        new Vec3(1, 1, 0)
//      ];
//      var faces = [
//        [ 0, 1, 2 ]
//      ];
//
//      var geom = new Geometry({
//        vertices: vertices,
//        faces: faces
//      });
//      geom.computeNormals();
//
//      var material = new SolidColor();
//      var mesh = new Mesh(geom, material);
//
//Geometry can't be rendered by itself. First it has to be convertet to a Vbo. The Mesh from pex-glu class does it for us automaticaly.

//## Reference

var Vec3 = require('./Vec3');
var Ray = require('./Ray');
var BoundingBox = require('./BoundingBox');

//### Geometry(o)  
//`o` - options *{ Object }*  
//Available options  
//`vertices` - *{ Array of Vec3 }* or *{ Boolean }* = false  
//`normals` - *{ Array of Vec3 }* or *{ Boolean }* = false  
//`texCoords` - *{ Array of Vec2 }* or *{ Boolean }* = false  
//`tangents` - *{ Array of Vec3 }* or *{ Boolean }* = false  
//`colors` - *{ Array of Color }* or *{ Boolean }* = false  
//`indices` - *{ Array of Int }* = []  
//`edges` - *{ Array of [Int, Int] }* = []  
//`faces` - *{ Array of [Int, Int, ...] }* = []

function Geometry(o) {
  o = o || {};
  this.attribs = {};

  if (o.vertices) this.addAttrib('vertices', 'position', o.vertices, false);
  if (o.normals) this.addAttrib('normals', 'normal', o.normals, false);
  if (o.texCoords) this.addAttrib('texCoords', 'texCoord', o.texCoords, false);
  if (o.tangents) this.addAttrib('tangents', 'tangent', o.tangents, false);
  if (o.colors) this.addAttrib('colors', 'color', o.colors, false);
  if (o.indices) this.addIndices(o.indices);
  if (o.edges) this.addEdges(o.edges);
  if (o.faces) this.addFaces(o.faces);
}

//### generateVolumePoints(numPoints)  
//`numPoints` - number of points to generate *{ Int }* = 5000  
//Generates poins inside of the geometry
Geometry.prototype.generateVolumePoints = function(numPoints) {
  numPoints = numPoints || 5000;

  var bbox = BoundingBox.fromPoints(this.vertices);
  var xMulti = -bbox.min.x + bbox.max.x;
  var yMulti = -bbox.min.y + bbox.max.y;
  var zMulti = -bbox.min.z + bbox.max.z;

  var pointsCounter = 0;
  var hits = [];
  var generatedPoints = [];

  for (var i=0; ; i++) {

    if (pointsCounter >= numPoints) break;

    var boxFace = (Math.floor(Math.random() * 6) + 1);

    var topX = bottomX = (Math.random() - 0.5) * xMulti;
    var topY = (Math.random() + 0.5) * yMulti;
    var topZ = bottomZ= (Math.random() - 0.5) * zMulti;
    var bottomY = -topY;

    var leftX =  -(Math.random() + 0.5) * xMulti;
    var leftY = rightY = (Math.random() - 0.5) * yMulti;
    var leftZ = rightZ = (Math.random() - 0.5) * zMulti;
    var rightX = -leftX;

    var backX = frontX = (Math.random() - 0.5) * xMulti;
    var backY = frontY = (Math.random() - 0.5) * yMulti;
    var backZ = -(Math.random() + 0.5) * zMulti;
    var frontZ = -backZ;

    switch (boxFace) {
      case 1:
        // left to right
        var A = new Vec3(leftX, leftY, leftZ);
      var B = new Vec3(rightX, rightY, rightZ);
      break;

      case 2:
        // right to left
        var A = new Vec3(rightX, rightY, rightZ);
      var B = new Vec3(leftX, leftY, leftZ);
      break;

      case 3:
        // top to bottom
        var A = new Vec3(topX, topY, topZ);
      var B = new Vec3(bottomX, bottomY, bottomY);
      break;

      case 4:
        // bottom to top
        var A = new Vec3(bottomX, bottomY, bottomZ);
      var B = new Vec3(topX, topY, topZ);
      break;

      case 5:
        // back to front
        var A = new Vec3(backX, backY, backZ);
      var B = new Vec3(frontX, frontY, frontZ);
      break;

      case 6:
        // front to back
        var A = new Vec3(frontX, frontY, frontZ);
      var B = new Vec3(backX, backY, backZ);
      break;

      default:
        break;
    }

    var rayOrigin = A.dup();
    var rayDirection = B.dup().sub(A).normalize();

    var triangulatedGeom = this.clone().triangulate();
    var counter = 0;
    var pointsForRay = [];

    triangulatedGeom.faces.forEach(function(face) {

      var triangle = {};
      triangle.a = triangulatedGeom.vertices[face[0]];
      triangle.b = triangulatedGeom.vertices[face[1]];
      triangle.c = triangulatedGeom.vertices[face[2]];

      var ray = new Ray(rayOrigin, rayDirection);
      var point = ray.hitTestTriangle(triangle);
      if (isNaN(point)) {
        pointsCounter++;
        counter++;
        pointsForRay.push(point);
      }

    });

    pointsForRay.forEach(function(point) {
      if (counter % 2 !== 0) return;
      hits.push(point);
   });

    if (hits.length < 2) continue;
    var pointA = hits[hits.length - 2];
    var pointB = hits[hits.length - 1];
    var direction = pointB.dup().sub(pointA);

    var randomPoint = pointA.dup().addScaled(direction, Math.random());
    generatedPoints.push(randomPoint);
  }

  return generatedPoints;

}

//### generateSurfacePoints(numPoints)  
//`numPoints` - number of points to generate *{ Int }* = 5000  
//Generates poins on the surface of the geometry
Geometry.prototype.generateSurfacePoints = function(numPoints) {
  numPoints = numPoints || 5000;

  var faceAreas = [];
  var triangles = [];

  for (var k=0, length=this.faces.length; k<length; k++) {

    var triangle = {};

    var AVertIndex = this.faces[k][0];
    var BVertIndex = this.faces[k][1];
    var CVertIndex = this.faces[k][2];

    var A = this.vertices[AVertIndex];
    var B = this.vertices[BVertIndex];
    var C = this.vertices[CVertIndex];

    var AB = B.dup().sub(A);
    var AC = C.dup().sub(A);

    var cross = AB.cross(AC);
    var area = 0.5 * Math.sqrt(cross.x * cross.x + cross.y * cross.y + cross.z * cross.z);

    triangle.A = A;
    triangle.B = B;
    triangle.C = C;
    triangles.push(triangle);

    faceAreas.push(area);

  }

  var min = Math.min.apply( Math, faceAreas );
  var ratios = faceAreas.map(function(area) {
    return Math.ceil(area / min);
  });

  var chanceIndexes = [];
  ratios.forEach(function(ratio, i) {
    for (var k=0;k<ratio;k++) {
      chanceIndexes.push(i);
    }
  });

  var generatedPoints = [];
  for (var i=0; i<numPoints; i++) {

    var randomIndex = Math.ceil(Math.random() * chanceIndexes.length) - 1;
    var triangle = triangles[chanceIndexes[randomIndex]];
    var A = triangle.A.clone();
    var B = triangle.B.clone();
    var C = triangle.C.clone();

    var u = Math.random();
    var v = Math.random();

    if ((u + v) > 1) {
      u = 1 - u;
      v = 1 - v;
    }

    var w = 1 - (u + v);

    var newA = A.dup().scale(u);
    var newB = B.dup().scale(v);
    var newC = C.dup().scale(w);

    var s = newA.add(newB).add(newC);

    generatedPoints.push(s);

  }

  return generatedPoints;
}

//### addAttribute(propertyName, attributeName, data, dynamic)  
//`propertyName` - geometry object property name *{ String }*  
//`attributeName` - shader attribute name *{ String }*  
//`data` - *{ Array of Vec2/Vec3/Vec4/Color }*  
//`dynamic` - is data static or updated every frame (dynamic) *{ Boolean }* = false  
//`instanced` - is the attribute instanced *{ Boolean }* = false  
//Adds addtribute
Geometry.prototype.addAttrib = function(propertyName, attributeName, data, dynamic, instanced) {
  if (data == undefined) {
    data = null;
  }
  if (dynamic == undefined) {
    dynamic = false;
  }
  if (instanced == undefined) {
    instanced = false;
  }
  this[propertyName] = data && data.length ? data : [];
  this[propertyName].name = attributeName;
  this[propertyName].dirty = true;
  this[propertyName].dynamic = dynamic;
  this[propertyName].instanced = instanced;
  this.attribs[propertyName] = this[propertyName];
  return this;
};

//### addFaces(data, dynamic)  
//`data` - *{ Array of [Int, Int, .. ] }*  
//`dynamic` - is data static or updated every frame (dynamic) *{ Boolean }* = false  
//Adds faces index array
Geometry.prototype.addFaces = function(data, dynamic) {
  if (data == null) {
    data = null;
  }
  if (dynamic == null) {
    dynamic = false;
  }
  this.faces = data && data.length ? data : [];
  this.faces.dirty = true;
  this.faces.dynamic = false;
  return this;
};

//### addEdges(data, dynamic)  
//`data` - *{ Array of [Int, Int] }*  
//`dynamic` - is data static or updated every frame (dynamic) *{ Boolean }* = false  
//Adds edges index array
Geometry.prototype.addEdges = function(data, dynamic) {
  if (data == null) {
    data = null;
  }
  if (dynamic == null) {
    dynamic = false;
  }
  this.edges = data && data.length ? data : [];
  this.edges.dirty = true;
  this.edges.dynamic = false;
  return this;
};

//### addIndices(data, dynamic)  
//`data` - *{ Array of Int }*  
//`dynamic` - is data static or updated every frame (dynamic) *{ Boolean }* = false  
//Adds index array
Geometry.prototype.addIndices = function(data, dynamic) {
  if (data == null) {
    data = null;
  }
  if (dynamic == null) {
    dynamic = false;
  }
  this.indices = data && data.length ? data : [];
  this.indices.dirty = true;
  this.indices.dynamic = false;
  return this;
};

Geometry.prototype.isDirty = function(attibs) {
  var dirty = false;
  dirty || (dirty = this.faces && this.faces.dirty);
  dirty || (dirty = this.edges && this.edges.dirty);
  for (attribAlias in this.attribs) {
    var attrib = this.attribs[attribAlias];
    dirty || (dirty = attrib.dirty);
  }
  return dirty;
};

//### addEdge(a, b)  
//`a` - stating edge index *{ Int }*  
//`b` - ending edge index *{ Int }*  
//Computes unique edges from existing faces.
Geometry.prototype.addEdge = function(a, b) {
  if (!this.edges) {
    this.addEdges();
  }
  if (!this.edgeHash) {
    this.edgeHash = {};
  }
  var ab = a + '_' + b;
  var ba = b + '_' + a;
  if (!this.edgeHash[ab] && !this.edgeHash[ba]) {
    this.edges.push([a, b]);
    return this.edgeHash[ab] = this.edgeHash[ba] = true;
  }
};

//### computeEdges()
//Computes unique edges from existing faces.
Geometry.prototype.computeEdges = function() {
  if (!this.edges) {
    this.addEdges();
  }
  else {
    this.edgeHash = null;
    this.edges.length = 0;
  }

  if (this.faces && this.faces.length) {
    this.faces.forEach(function(face) {
      for(var i=0; i<face.length; i++) {
        this.addEdge(face[i], face[(i+1)%face.length]);
      }
    }.bind(this));
  }
  else {
    for (var i=0; i<this.vertices.length-1; i++) {
      this.addEdge(i, i+1);
    }
  }
};

//### computeNormals()
//Computes per vertex normal by averaging the normals of faces connected with that vertex.
Geometry.prototype.computeNormals = function() {
  if (!this.faces) {
    throw 'Geometry[2]omputeSmoothNormals no faces found';
  }
  if (!this.normals) {
    this.addAttrib('normals', 'normal', null, false);
  }

  if (this.normals.length > this.vertices.length) {
    this.normals.length = this.vertices.length;
  }
  else {
    while (this.normals.length < this.vertices.length) {
      this.normals.push(new Vec3(0, 0, 0));
    }
  }

  
  var vertices = this.vertices;
  var faces = this.faces;
  var normals = this.normals;

  var count = [];
  for(var i=0; i<vertices.length; i++) {
    count[i] = 0;
  }

  var ab = new Vec3();
  var ac = new Vec3();
  var n = new Vec3();

  for(var fi=0; fi<faces.length; fi++) {
    var f = faces[fi];
    var a = vertices[f[0]];
    var b = vertices[f[1]];
    var c = vertices[f[2]];
    ab.asSub(b, a).normalize();
    ac.asSub(c, a).normalize();
    n.asCross(ab, ac);
    for(var i=0; i<f.length; i++) {
      normals[f[i]].add(n);
      count[f[i]]++;
    }
  }

  for(var i=0; i<normals.length; i++) {
    normals[i].normalize();
  }
  this.normals.dirty = true;
};

//### toFlatGeometry
//Builds a copy of this geomety with all faces separated. Useful for flat shading.
//returns new *{ Geometry }*  
Geometry.prototype.toFlatGeometry = function() {
  var g = new Geometry({ vertices: true, faces: true });

  var vertices = this.vertices;

  this.faces.forEach(function(face) {
    var newFace = [];
    face.forEach(function(vi) {
      newFace.push(g.vertices.length);
      g.vertices.push(vertices[vi]);
    });
    g.faces.push(newFace);
  });

  return g;
}

//### clone()
//Builds a copy of this geometry.  
//Currenlty only vertices, texCoords, faces and edges are copied.  
//returns new *{ Geometry }*
Geometry.prototype.clone = function() {
  var edges = null;
  var clonedAttribs = {};
  Object.keys(this.attribs).forEach(function(attribName) {
    var attrib = this.attribs[attribName];
    clonedAttribs[attribName] = attrib.map(function(v) {
      return v.dup ? v.dup() : v;
    })
  }.bind(this));
  clonedAttribs.faces = this.faces.map(function(f) { return f.slice(0); });
  clonedAttribs.edges = this.edges ? this.edges.map(function(e) { return e.slice(0); }) : null;
  return new Geometry(clonedAttribs);
}

///### merge(g)
//Returns new combined geometry. This is not a boolean operation, faces and vertices inside the mesh will be kept.
//`g` - another geometry to merge with *{ Geometry }*
Geometry.prototype.merge = function(g) {
  var edges = null;
  var mergedAttribs = {};
  Object.keys(this.attribs).forEach(function(attribName) {
    var myAttrib = this.attribs[attribName];
    var anotherAttrib = g.attribs[attribName];
    if (anotherAttrib) {
      mergedAttribs[attribName] = [];
      myAttrib.forEach(function(v) {
        mergedAttribs[attribName].push(v.dup ? v.dup() : v);
      })
      anotherAttrib.forEach(function(v) {
        mergedAttribs[attribName].push(v.dup ? v.dup() : v);
      })
    }
  }.bind(this));
  var myVerticesLength = this.vertices.length;
  if (this.faces && g.faces) {
    mergedAttribs.faces = [];
    this.faces.forEach(function(f) {
      mergedAttribs.faces.push(f.slice(0));
    });
    g.faces.forEach(function(f) {
      var newFace = f.map(function(fi) { return fi + myVerticesLength; })
      mergedAttribs.faces.push(newFace);
    })
  }
  if (this.edges && g.edges) {
    mergedAttribs.edges = [];
    this.edges.forEach(function(f) {
      mergedAttribs.edges.push(f.slice(0));
    });
    g.edges.forEach(function(e) {
      var newEdge = e.map(function(ei) { return ei + myVerticesLength; })
      mergedAttribs.edges.push(newEdge);
    })
  }
  return new Geometry(mergedAttribs);
}

//### triangulate()
//Splits all the faces into triangles. Non destructive operation.  
//returns new *{ Geometry }*
Geometry.prototype.triangulate = function() {
  var g = this.clone();
  g.faces = [];
  this.faces.forEach(function(face) {
    g.faces.push([face[0],face[1],face[2]]);
    for(var i=2; i<face.length-1; i++) {
      g.faces.push([face[0],face[i],face[i+1]]);
    }

  });
  return g;
}

//computeHalfEdges()
//Computes half edges used for efficient geometry operations.  
//returns new *{ Array of half edge objects }*  
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

//### subdivideEdges()
//Non destructive operation edge subdivision.  
//Subdivides geometry by adding new point in the middle of each edge.  
//returns new *{ Geometry }*
Geometry.prototype.subdivideEdges = function() {
  var vertices = this.vertices;
  var faces = this.faces;

  var halfEdges = this.computeHalfEdges();

  var newVertices = vertices.map(function(v) { return v; });
  var newFaces = [];

  //edge points are an average of both edge vertices
  var edgePoints = [];
  //console.log('halfEdges', halfEdges.length, halfEdges.map(function(e) { return '' + (e.v0) + '-' + (e.v1); }));
  halfEdges.forEach(function(e) {
    if (!edgePoints[e.edgeIndex]) {
      var midPoint = centroid([
        vertices[e.face[e.slot]],
        vertices[next(e).face[next(e).slot]]
      ]);
      edgePoints[e.edgeIndex] = midPoint;
      edgePoints[e.opposite.edgeIndex] = midPoint;
      newVertices.push(midPoint);
    }
  });

  faces.forEach(function(face) {
    var newFace = [];
    edgeLoop(face.halfEdges[0], function(edge) {
      newFace.push(newVertices.indexOf(edgePoints[edge.edgeIndex]));
    });
    newFaces.push(newFace);
  });

  var visitedVertices = [];
  var verts = 0;
  halfEdges.forEach(function(e) {
    if (visitedVertices.indexOf(e.face[e.slot]) !== -1) return;
    visitedVertices.push(e.face[e.slot]);
    var neighborPoints = [];
    vertexEdgeLoop(e, function(edge) {
      neighborPoints.push(newVertices.indexOf(edgePoints[edge.edgeIndex]));
    });
    neighborPoints.forEach(function(point, i) {
      var nextPoint = neighborPoints[(i+1)%neighborPoints.length];
      newFaces.push([e.face[e.slot], point, nextPoint]);
    });
  });

  var g = new Geometry({ vertices: newVertices, faces: newFaces });
  g.computeEdges();

  return g;
}

//### getFaceVertices()
//Returns vertices for that face
//`face` - *{ Array of Int }*
//returns new *{ Array of Vec3 }*
Geometry.prototype.getFaceVertices = function(face) {
  return face.map(function(i) { return this.vertices[i]; }.bind(this));
}

//### catmullClark()
//Non destructive Catmull-Clark subdivision
//returns new *{ Geometry }*
//
//Catmull-Clark subdivision for half-edge meshes
//Based on http://en.wikipedia.org/wiki/Catmull–Clark_subdivision_surface
//TODO: Study Doo-Sabin scheme for new vertices 1/n*F + 1/n*R + (n-2)/n*v
//http://www.cse.ohio-state.edu/~tamaldey/course/784/note20.pdf
//
//The shady part at the moment is that we put all vertices together at the end and have to manually
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

//### catmullClark()
//Non destructive Doo-Sabin subdivision  
//`depth` - edge inset depth *{ Number }*  
//returns new *{ Geometry }*  
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

//### catmullClark(edgeDepth, insetDepth)
//Non destructive wire modelling.
//`edgeDepth` - how thick should be the edge *{ Number }*
//`insetDepth` - how deeply inside should be the edge *{ Number }*
//returns new *{ Geometry }*
//Mesh wire modelling as described in where each edge is replaced by a column
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

//### extrude(height, faceIndices, shrink)
//Non destructive face extrusion.
//, faceIndices, shrink
//`height` - how much to extrude along the normal *{ Number }*  
//`faceIndices` - indices of faces to extrude *{ Array of Int }*  
//`shrink` - how much to shring new extruded face, 0 - at all, 1 - will create point *{ Number }*  
//returns new *{ Geometry }*
Geometry.prototype.extrude = function(height, faceIndices, shrink) {
  height = height || 0.1;
  shrink = shrink || 0;
  if (!faceIndices) faceIndices = this.faces.map(function(face, faceIndex) { return faceIndex; });
  var g = this.clone();
  var halfEdges = g.computeHalfEdges();

  var ab = new Vec3();
  var ac = new Vec3();
  var faceNormal = new Vec3();
  var tmp = new Vec3();

  faceIndices.forEach(function(faceIndex) {
    var face = g.faces[faceIndex];
    var faceVerts = elements(g.vertices, face);
    var faceTexCoords = g.texCoords ? elements(g.texCoords, face) : null;

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

    if (faceTexCoords) {
      var newTexCoords = faceTexCoords.map(function(tc) {
        return tc.dup();
      });

      newTexCoords.forEach(function(tc) {
        g.texCoords.push(tc);
      });
    }

    if (shrink) {
      var c = centroid(newVerts);
      newVerts.forEach(function(nv) {
        tmp.asSub(c, nv);
        tmp.scale(shrink);
        nv.add(tmp);
      })
    }

    //add new face for each extruded edge
    edgeLoop(face.halfEdges[0], function(e) {
      g.faces.push([
        face[e.slot],
        face[next(e).slot],
        newVertsIndices[next(e).slot],
        newVertsIndices[e.slot]
      ]);
    });

    //add edges
    if (g.edges) {
      newVertsIndices.forEach(function(i, index) {
        g.edges.push([i, face[index]]);
      });
      newVertsIndices.forEach(function(i, index) {
        g.edges.push([i, newVertsIndices[(index+1)%newVertsIndices.length]]);
      });
    }

    //push the old face outside
    newVertsIndices.forEach(function(nvi, i) {
      face[i] = nvi;
    });
  });

  return g;
}

///### transform(m)
//Returns new geometry with all vertices transform with the given matrix
//`m` - transformation matrix *{ Mat4 }*
Geometry.prototype.transform = function(m) {
  var g = this.clone();
  for(var i=0; i<g.vertices.length; i++) {
    g.vertices[i].transformMat4(m);
  }
  if (g.normals) {
    g.computeNormals();
  }
  return g;
}

//## Private utility functions

//where does this should go? geom.Utils expanded to geom?
function centroid(points) {
  var n = points.length;
  var center = points.reduce(function(center, p) {
    return center.add(p);
  }, new Vec3(0, 0, 0));
  center.scale(1 / points.length);
  return center;
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

function vertexEdgeLoop(edge, cb) {
  var curr = edge;

  do {
    cb(curr);
    curr = prev(curr).opposite;
  }
  while(curr != edge);
}

function next(edge) {
  return edge.face.halfEdges[(edge.slot + 1) % edge.face.length]
}

function prev(edge) {
  return edge.face.halfEdges[(edge.slot - 1 + edge.face.length) % edge.face.length]
}

function elements(list, indices) {
  return indices.map(function(i) { return list[i]; })
}

function move(a, b, t) {
  return b.dup().sub(a).normalize().scale(t).add(a);
}

module.exports = Geometry;
