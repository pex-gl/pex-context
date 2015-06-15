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

var computeHalfEdges = require('./compute-half-edges');
var centroid = require('../utils/centroid');
var vertexEdgeLoop = require('./he/vertex-edge-loop')
var edgeLoop = require('./he/edge-loop')
var next = require('./he/next');
var add = require('gl-vec3/add');
var scale = require('gl-vec3/scale');

function subdivide(vertices, faces) {
  var halfEdges = computeHalfEdges(faces);

  function vertexAt(i) {
    return vertices[i];
  }

  function faceToVertices(f) {
    return f.map(vertexAt);
  }

  //face points are an average of all face points
  var facePoints = faces.map(faceToVertices).map(centroid);

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
  var scaledVertex = [0, 0, 0];
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

    //var edgeMidPoint = [0, 0, 0];
    //v.add(facesCentroid);
    //v.add(edgesCentroid.dup().scale(2));
    //v.add(vertex.dup().scale(n - 3));
    //v.scale(1/n);
    var n = neighborFacePoints.length;
    var v = [0, 0, 0];
    add(v, v, facesCentroid);

    scale(edgesCentroid, edgesCentroid, 2);
    add(v, v, edgesCentroid);

    scale(scaledVertex, vertex, n - 3);
    add(v, v, scaledVertex);
    scale(v, v, 1/n)

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

  return {
    position: newVertices,
    indices: newFaces
  }
}

module.exports = subdivide;
