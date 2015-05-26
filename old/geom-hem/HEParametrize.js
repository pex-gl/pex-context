define(["hem/HEMesh", "pex/util/RandUtils", "pex/core/Vec3", "pex/util/Time"], function(HEMesh, RandUtils, Vec3, Time) {
  function HEParametrize() {
  }

  HEMesh.prototype.computeTangentsByRandom = function() {
    this.vertices.forEach(function(vert) {
      vert.tangent = RandUtils.randomVec3();
    });
    return this;
  }
  
  HEMesh.prototype.computeTangentsByRandomOne = function() {
    var target = Math.floor(Math.random() * this.vertices.length);
    this.vertices.forEach(function(vert, i) {
      vert.tangent = RandUtils.randomVec3();
      if (i != target) vert.tangent.scale(0);
    });
    return this;
  }
  

  HEMesh.prototype.computeTangentsByEdgeSlope = function() {
    this.vertices.forEach(function(vert) {
      var n = vert.getNormal();
      var maxDotProduct = -1;
      var maxEdgeVec = null;
      vert.forEachEdge(function(edge) {
        var nextVert = edge.next.vert;
        var edgeVec = nextVert.subbed(vert).normalize();
        var dotProduct = n.dot(edgeVec);
        if (dotProduct > maxDotProduct) {
          maxDotProduct = dotProduct;
          maxEdgeVec = edgeVec;
        }
      })

      vert.tangent = maxEdgeVec;
    })
    return this;
  }

  HEMesh.prototype.computeTangentsBySmoothing = function() {
    var numIterations = 30;
    
    function projectVec3OnPlane(v, planeNormal) {
      //substract from v it's projection on normal u
      //w = v - (v dot u) u
      return v.subbed(planeNormal.scaled(v.dot(planeNormal)));
    }

    function gaussianCoeff(p, p1, h) {
      return Math.exp(-p.distanceSquared(p1) / (h*h));
    }

    function calcDirection(vert, h) {
      var avgDirection = new Vec3(0, 0, 0);
      //vert.forEachEdge(function(edge) {
      vert.forEachEdgeWithin(h, function(edge) {
        var p = vert;
        var p1 = edge.next.vert;
        var w = gaussianCoeff(p, p1, h);
        avgDirection.add(p1.tangent.scaled(w));
      })
      var projectedDirection = projectVec3OnPlane(avgDirection, vert.getNormal());
      return projectedDirection;
    }

    var h = 0.175;

    for(var i=0; i<numIterations; i++) {
      var newTangents = this.vertices.map(function(v) {
        return calcDirection(v, h);
      });

      this.vertices.forEach(function(v, i) {
        if (newTangents[i].length() == 0) return;
        v.tangent = newTangents[i].normalize();
      });
    }
    
    this.vertices.forEach(function(v) {
      v.clearCaches();
    })
    
    return this;
  }
  
  HEMesh.prototype.computeTangentsBySmoothingDeffered = function(progressCallback, endCallback) {
    var numIterations = 30;
    
    var edgeLen = 0;
    var edgeCount = 0;
    this.vertices.forEach(function(v) {
      edgeLen += (v.edge.next.vert.distance(v));
      edgeCount++;
    })
    var avgEdgeLength = edgeLen / edgeCount;
    
    function projectVec3OnPlane(v, planeNormal) {
      //substract from v it's projection on normal u
      //w = v - (v dot u) u
      return v.subbed(planeNormal.scaled(v.dot(planeNormal)));
    }

    function gaussianCoeff(p, p1, h) {
      return Math.exp(-p.distanceSquared(p1) / (h*h));
    }

    function calcDirection(vert, h) {
      var avgDirection = new Vec3(0, 0, 0);
      //vert.forEachEdge(function(edge) {
      vert.forEachEdgeWithin(h, function(edge) {
        var p = vert;
        var p1 = edge.next.vert;
        var w = gaussianCoeff(p, p1, h);
        avgDirection.add(p1.tangent.scaled(w));
      })
      var projectedDirection = projectVec3OnPlane(avgDirection, vert.getNormal());
      return projectedDirection;
    }

    var h = avgEdgeLength * 2;
    
    var iteration = 0;
    var iterationInterval;
    var self = this;
    var numSteps = 10;
    var step = 0;
    var newTangents = [];
    
    function iterate() {      
      if (iteration > numIterations) {
        if (endCallback) endCallback();
        clearInterval(iterationInterval);
        return;
      }
      
      if (step < numSteps) {
        for(var i= Math.floor(step/numSteps * self.vertices.length); i<Math.floor((step+1)/numSteps * self.vertices.length); i++) {
          newTangents.push(calcDirection(self.vertices[i], h));
        }
      }
      
      //console.log("Iteration", iteration, "Step", step);
      step++;
      if (step >= numSteps) {
        step = 0;
        self.vertices.forEach(function(v, i) {
          if (newTangents[i].length() == 0) return;
          v.tangent = newTangents[i].normalize();
        }); 
        newTangents = [];        
      
        iteration++;
        if (progressCallback) progressCallback(iteration / numIterations);          
      }
      
      setTimeout(iterate, 1);
    }
    
    //iterate once to initalize caches
    iterate();
    
    var startTime = (new Date()).getTime();
    iterate();
    var endTime = (new Date()).getTime();
    var iterationDuration = (endTime - startTime);
    console.log("iterationDuration", iterationDuration/1000, "vs", 1/30);
    iterationInterval = setInterval(function() {
    //  iterate();
    }, 1000/30)

    //for(var i=0; i<numIterations; i++) {
    
    //}
    //
    //this.vertices.forEach(function(v) {
    //  v.clearCaches();
    //})
    
    return this;
  }
  

  //HEMesh.prototype.computeTangents = function() {
  //  this.computeTangentsByRandom();
  //
  //  Time.startMeasuringTime();
  //
  //  for(var i=0; i<60; i++) {
  //    console.log("Smoothing " + i);
  //    this.computeTangentsBySmoothing();
  //  }
  //
  //  this.vertices.forEach(function(v) {
  //    v.clearCaches();
  //  })
  //
  //  Time.stopMeasuringTime("Smoothing ");
  //  //return this.computeTangentsByEdgeSlope();
  //}

  return HEParametrize;
});
