var glu  = require('pex-glu');
var geom = require('pex-geom');
var fn   = require('../utils/fn');

var Mesh = glu.Mesh;
var Vec2 = geom.Vec2;

Mesh.prototype.oldDraw = Mesh.prototype.draw;
Mesh.prototype.oldDrawInstances = Mesh.prototype.drawInstances;

Mesh.prototype.update = function() {
  if (this.skeleton) {
    this.skeleton.applyToMesh(this);
  }
  if (this.skinnedBoundingBox) {
    this.skinnedBoundingBox.update(this);
  }
  if (this.morphs) {
    this.morphs.update(this);
  }
}

//Mesh.prototype.draw = function(camera) {
//  this.update();
//  this.oldDraw(camera);
//}
//
//Mesh.prototype.drawInstances = function(camera, instances) {
//  this.update();
//  this.oldDrawInstances(camera, instances);
//}

Mesh.prototype.bindToOtherMeshSkeleton = function(mesh) {
  this.skeleton = mesh.skeleton;

  var skinIndices = [];
  var skinWeights = [];
  var numBones = 0;
  var otherGeometry = mesh.geometry;
  var bestVertexCache = [];

  for(var vi=0; vi<this.geometry.vertices.length; vi++) {
    var currVertex = this.geometry.vertices[vi];
    var currentVertexHash = -1;
    if (this.geometry.instancePositions) {
      currVertex = this.geometry.instancePositions[vi];
      currentVertexHash = currVertex.toString();
    }

    var bestVertex = null;
    if (currentVertexHash != -1) {
      bestVertex = bestVertexCache[currentVertexHash];
    }

    if (!bestVertex) {
      bestVertex = otherGeometry.vertices.reduce(function(bestVertex, vertex, vertexIndex) {
        var dist = currVertex.squareDistance(vertex);
        if (dist < bestVertex.dist) {
          return {
            position: vertex,
            index: vertexIndex,
            dist: dist
          }
        }
        else {
          return bestVertex;
        }
      }, { index: -1, dist: Infinity });
      bestVertexCache[currentVertexHash] = bestVertex;
    }
    skinIndices.push(otherGeometry.skinIndices[bestVertex.index]);
    skinWeights.push(otherGeometry.skinWeights[bestVertex.index]);
  }

  this.geometry.addAttrib('skinIndices', 'skinIndices', skinIndices);
  this.geometry.addAttrib('skinWeights', 'skinWeights', skinWeights);
}