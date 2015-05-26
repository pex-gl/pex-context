var Geometry = require('pex-geom').Geometry;
var random = require('pex-random');
var R = require('ramda');
var Vec3 = require('pex-geom').Vec3;

Geometry.prototype.computeTangentsByRandom = function() {
  var target = Math.floor(Math.random() * this.vertices.length);
  this.vertices.forEach(function(vert, i) {
    vert.tangent = random.vec3().normalize();
  });
  return this;
}

Geometry.prototype.computeTangentsByRandomOne = function() {
  var target = Math.floor(Math.random() * this.vertices.length);
  this.vertices.forEach(function(vert, i) {
    vert.tangent = random.vec3().normalize();
    if (i != target) vert.tangent.scale(0);
  });
  return this;
}

function faceToEdges(f) {
  return [ [f[0], f[1]], [f[1], f[2]], [f[2], f[0]] ];
}

function compareEdges(a, b) {
  return (a[0] == b[0] && a[1] == b[1]) || (a[0] == b[1] && a[1] == b[0])
}

function projectVec3OnPlane(v, planeNormal) {
  //substract from v it's projection on normal u
  //w = v - (v dot u) u
  return v.dup().sub(planeNormal.dup().scale(v.dot(planeNormal)));
}

function gaussianCoeff(p, p1, h) {
  return Math.exp(-p.squareDistance(p1) / (h*h));
}

function forEachEdgeWithin(vertices, vertexEdges, vertexIndex, h, cb) {
  var visited = [];
  var toVisit = [vertexIndex];
  var v = vertices[vertexIndex];
  while(toVisit.length > 0) {
    var curr = toVisit.shift();
    if (visited.indexOf(curr) != -1) continue;
    visited.push(curr);
    if (vertices[curr].distance(v) <= h) {
      vertexEdges[curr].forEach(function(edge) {
        cb(edge);
        if (edge[0] == curr) toVisit.push(edge[1]);
        if (edge[1] == curr) toVisit.push(edge[0]);
      });
    }
  }
}

function calcDirection(vertices, nearEdges, normals, vertexIndex, h) {
  var avgDirection = new Vec3(0, 0, 0);
  nearEdges[vertexIndex].forEach(function(edge) {
    var p = vertices[edge[0]];
    var p1 = vertices[edge[1]];
    var w = gaussianCoeff(p, p1, h);
    avgDirection.add(p1.tangent.dup().scale(w));
  })
  var projectedDirection = projectVec3OnPlane(avgDirection, normals[vertexIndex]);
  projectedDirection.normalize();
  return projectedDirection;
}

Geometry.prototype.computeTangentsBySmoothingDeffered = function(progressCallback, endCallback, numIterations) {
  numIterations = numIterations || 30;

  var faces = this.faces;
  var vertices = this.vertices;
  var normals = this.normals;
  var edges = R.uniqWith(compareEdges, R.unnest(faces.map(faceToEdges)));
  var vertexEdges = [];
  edges.forEach(function(e) {
    if (!vertexEdges[e[0]]) vertexEdges[e[0]] = [];
    if (!vertexEdges[e[1]]) vertexEdges[e[1]] = [];
    vertexEdges[e[0]].push(e);
    vertexEdges[e[1]].push(e);
  })

  var edgeLen = 0;
  var edgeCount = 0;

  edges.forEach(function(e) {
    edgeLen += vertices[e[0]].distance(vertices[e[1]]);
  })

  var avgEdgeLength = edgeLen / edges.length;

  var h = avgEdgeLength * 2;

  var nearEdges = [];
  for(var i=0; i<vertices.length; i++) {
    nearEdges[i] = [];
    forEachEdgeWithin(vertices, vertexEdges, i, h, function(e){
      nearEdges[i].push(e);
    })
  }

  var iteration = 0;
  var iterationInterval;
  var numSteps = 10;
  var step = 0;
  var newTangents = [];
  var start = Date.now();

  function iterate() {
    if (iteration > numIterations) {
      if (endCallback) endCallback();
      return;
    }

    if (step < numSteps) {
      for(var i=Math.floor(step/numSteps * vertices.length); i<Math.floor((step+1)/numSteps * vertices.length); i++) {
        if (vertices[i].tangent.lengthSquared() == 0)
          newTangents.push(calcDirection(vertices, nearEdges, normals, i, h));
        else
          newTangents.push(null);
      }
    }

    var numTangents = 0;
    step++;
    if (step >= numSteps) {
      step = 0;
      vertices.forEach(function(v, i) {
        if (!newTangents[i] || newTangents[i].lengthSquared() == 0) return;
        if (v.tangent.lengthSquared() == 0) v.tangent = newTangents[i];
        numTangents++;
      });
      newTangents = [];

      iteration++;
      if (progressCallback) progressCallback(iteration / numIterations);

      var end = Date.now();
      console.log('iteration', iteration, step, numTangents, (end - start)/1000 + 's');
      start = end;
    }

    setTimeout(iterate, 1);
  }

  //iterate once to initalize caches
  iterate();

  return this;
}