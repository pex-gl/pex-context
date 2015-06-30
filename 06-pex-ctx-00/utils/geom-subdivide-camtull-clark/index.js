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

var centroid = require('../centroid');
var he = require('../geom-half-edge');
var computeHalfEdges = he.computeHalfEdges;
var vertexEdgeLoop = he.vertexEdgeLoop;
var edgeLoop = he.edgeLoop
var next = he.next;

var add = require('../../math/Vec3').add;
var scale = require('../../math/Vec3').scale;
var set = require('../../math/Vec3').set;

function subdivide(geometry) {
    var faces = geometry.cells;
    var vertices = geometry.positions;
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
    var scaledEdgesCentroid = [0, 0, 0];

    halfEdges.map(function(edge) {
        var vertexIndex = faces[edge.faceIndex][edge.slot];
        var vertex = vertices[vertexIndex];
        if (vertexPoints[vertexIndex]) return;
        var neighborFacePoints = [];

        var neighborEdgeMidPoints = [];
        vertexEdgeLoop(edge, function(edge) {
          neighborFacePoints.push(facePoints[edge.faceIndex]);
          neighborEdgeMidPoints.push(centroid([vertices[edge.v0], vertices[edge.v1]]));
        });
        var facesCentroid = centroid(neighborFacePoints);
        var edgesCentroid = centroid(neighborEdgeMidPoints);

        //mip point
        var n = neighborFacePoints.length;
        var v = [0, 0, 0];
        add(v, facesCentroid);

        set(scaledEdgesCentroid, edgesCentroid);
        scale(scaledEdgesCentroid, 2);
        add(v, scaledEdgesCentroid);

        set(scaledVertex, vertex);
        scale(scaledVertex, n - 3);
        add(v, scaledVertex);
        scale(v, 1/n)

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
        positions: newVertices,
        cells: newFaces
    }
}

module.exports = subdivide;
