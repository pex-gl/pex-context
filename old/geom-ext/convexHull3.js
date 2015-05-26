//http://www.jasondavies.com/maps/voronoi/
//Copyright 2014 Jason Davies, http://www.jasondavies.com/
//Ported to pex in 2015 by Marcin Ignac, http://www.marcinignac.com/
/*
References:

Robert J. Renka / Algorithm 772: STRIPACK: Delaunay triangulation and Voronoi diagram on the surface of a sphere / http://dx.doi.org/10.1145/275323.275329
Kevin Q. Brown / Geometric Transforms for Fast Geometric Algorithms / http://reports-archive.adm.cs.cmu.edu/anon/scan/CMU-CS-80-101.pdf
Convex Hulls in 3-space / http://www.cs.arizona.edu/classes/cs437/fall11/ch3d.prn.pdf
Voronoi Diagrams on the Sphere / http://www.cs.uu.nl/research/techreps/repo/CS-2001/2001-47.pdf
Loren Petrich / Spherical Delaunay triangulation, convex hull, Voronoi diagram / http://lpetrich.org/Science/GeometryDemo/GeometryDemo_GMap.html

Sweeping the Sphere / http://dx.doi.org/10.1109/ISVD.2010.32

Convex Hull Algorithms / http://www.cse.unsw.edu.au/~lambert/java/3d/hull.html

QuickHull:
Thomas Diewald / Convex Hull 3D – Quickhull Algorithm / http://thomasdiewald.com/blog/?p=1888
Barber, Dobkin, Huhdanpaa / http://www.cise.ufl.edu/~ungor/courses/fall06/papers/QuickHull.pdf

Other:
Veronica G. Vergara Larrea / Construction of Delaunay Triangulations on the Sphere: A Parallel Approach / http://diginole.lib.fsu.edu/cgi/viewcontent.cgi?article=5571&context=etd
Zhang Bei / Spherical Voronoi Diagram (PhiloGL) / http://www.senchalabs.org/philogl/PhiloGL/examples/voronoi/

Idea: show spherical convex hull (this is the boundary of the Delaunay triangulation in the case where we have < hemisphere, otherwise it's the whole sphere, {type: "Sphere"}
*/
var R = require('ramda');
var Vec3 = require('pex-geom').Vec3;
var Vec2 = require('pex-geom').Vec2;

var EPSILON = 1e-15;
var _;

var radians = Math.PI / 180;
var degrees = 180 / Math.PI;

function Triangle(a, b, c, index) {
  this.visible = [];
  this.marked = false;
  this.n = normalise(cross(subtract(c, a), subtract(b, a)));
  (((this.a = new Edge(this, a)).next = this.b = new Edge(this, b)).next = this.c = new Edge(this, c)).next = this.a;
  this.index = index;
}

function Edge(triangle, p) {
  this.triangle = triangle;
  this.p = p;
  this.neighbor = this.next = null;
}

function Arc(t, v, i) {
  var head;
  this.t = t;
  this.v = v;
  this.i = i;
  this.prevF = null;
  if (head = this.nextF = v.visible) head.prevF = this;
  v.visible = this;
}

Arc.prototype.remove = function() {
  if (this.prevF) this.prevF.nextF = this.nextF;
  else this.v.visible = this.nextF;
  if (this.nextF) this.nextF.prevF = this.prevF;
};

function spherical(cartesian) {
  return new Vec2(
    Math.atan2(cartesian.y, cartesian.x) * degrees,
    Math.asin(cartesian.z) * degrees
  );
}


function norm2(p) { return dot(p, p); }
function norm(p) { return Math.sqrt(norm2(p)); }

function cross(a, b) {
  return new Vec3(a.y * b.z - a.z * b.y,
          a.z * b.x - a.x * b.z,
          a.x * b.y - a.y * b.x);
}

function subtract(a, b) {
  return new Vec3(a.x - b.x, a.y - b.y, a.z - b.z);
}

function dot(a, b) {
  return a.x * b.x + a.y * b.y + a.z * b.z;
}

function coplanar(t, p) {
  return Math.abs(dot(t.n, p) - dot(t.n, t.a)) <= EPSILON;
}

function visible(t, p) {
  return dot(t.n, p) - dot(t.n, t.a.p) > EPSILON;
}

function addConflict(t, p, i) {
  if (visible(t, p)) t.visible.push(new Arc(t, p, i));
}

function neighbors(a, b) {
  (a.neighbor = b).neighbor = a;
}

function normalise(d) {
  var m = 1 / norm(d);
  d.x *= m, d.y *= m, d.z *= m;
  return d;
}

function visible(t, p) {
  return dot(t.n, p) - dot(t.n, t.a.p) > EPSILON;
}

function onHorizon(e) {
  return !e.triangle.marked && e.neighbor.triangle.marked;
}

// Maintain order of vertices in facet conflict lists when merging.
function addConflicts(t, a, b) {
  var av = a.visible,
      bv = b.visible,
      an = av.length,
      bn = bv.length,
      ai = 0,
      bi = 0;
  while (ai < an || bi < bn) {
    if (ai < an) {
      var ax = av[ai];
      if (bi < bn) {
        var bx = bv[bi];
        if (ax.i > bx.i) {
          addConflict(t, bx.v, bx.i), ++bi;
          continue;
        }
        if (ax.i === bx.i) ++bi;
      }
      addConflict(t, ax.v, ax.i), ++ai;
    } else {
      var bx = bv[bi];
      addConflict(t, bx.v, bx.i), ++bi;
    }
  }
}

function removeElement(array, i) {
  var x = array.pop();
  if (i < array.length) (array[i] = x).index = i;
}

// Assume e is marked.
function findHorizon(e) {
  if ((e = e.neighbor).triangle.marked) return;
  var horizon = [e], h0 = e;
  do {
    if (onHorizon(e = e.next)) {
      if (e === h0) return horizon;
      horizon.push(e);
    } else {
      e = e.neighbor;
    }
  } while (1);
}


function convexHull3(points) {
  var n = points.length;

  if (n < 4) return []; // coplanar points

  for (var i = 0; i < n; ++i) points[i].i = i;
  //d3.shuffle(points);

  var a = points[0],
      b = points[1],
      c = points[2],
      t = new Triangle(a, b, c);

  // Find non-coplanar fourth point.
  for (var i = 3; i < n && coplanar(t, points[i]); ++i);

  if (i === n) return []; // coplanar points

  // Create a tetrahedron.
  var d = points[i];
  points[i] = points[3], points[3] = d;

  if (visible(t, d)) {
    var tmp = b; b = c; c = tmp;
  }

  var ta = new Triangle(a, b, c, 0),
      tb = new Triangle(d, b, a, 1),
      tc = new Triangle(c, d, a, 2),
      td = new Triangle(b, d, c, 3),
      triangles = [ta, tb, tc, td];

  neighbors(ta.a, tb.b);
  neighbors(ta.b, td.c);
  neighbors(ta.c, tc.c);

  neighbors(tb.a, td.a);
  neighbors(td.b, tc.a);
  neighbors(tc.b, tb.c);

  // Initialise conflict graph.
  for (var i = 4; i < n; ++i) {
    var p = points[i];
    addConflict(ta, p, i);
    addConflict(tb, p, i);
    addConflict(tc, p, i);
    addConflict(td, p, i);
  }

  for (var i = 4; i < n; ++i) {
    var p = points[i], h = p.visible;
    if (!h) continue;

    // Find horizon.
    var horizon = null, a = h;
    do a.t.marked = true; while (a = a.nextF);

    a = h; do {
      var t = a.t;
      if (horizon = findHorizon(t.a) || findHorizon(t.b) || findHorizon(t.c)) break;
    } while (a = a.nextF);

    if (!horizon) continue;

    for (var j = 0, m = horizon.length, prev = null, first = null; j < m; ++j) {
      var e = horizon[j],
          f1 = e.triangle, f2 = e.neighbor.triangle,
          t = new Triangle(p, e.neighbor.p, e.p, triangles.length);
      neighbors(t.b, e);
      if (prev) neighbors(prev.a, t.c);
      else first = t;
      addConflicts(t, f1, f2);
      triangles.push(prev = t);
    }
    neighbors(prev.a, first.c);

    a = h; do {
      var t = a.t;
      for (var j = 0, m = t.visible.length; j < m; ++j) t.visible[j].remove();
      t.visible.length = 0;
      removeElement(triangles, t.index);
    } while (a = a.nextF);
  }
  return triangles;
}

function delaunay3(points) {
  var p = points,//points.map(cartesian),
      n = points.length,
      triangles = convexHull3(p);

  if (triangles.length) return triangles.forEach(function(t) {
    t.coordinates = [points[t.a.p.i], points[t.b.p.i], points[t.c.p.i]];
    t.centre = circumcentre(t);
  }), triangles;
};

function hemispheres(a, b) {
  var c = a.dup().lerp(b, .5),
      n = cross(cross(cartesian(a), cartesian(b)), cartesian(c)),
      m = 1 / norm(n);
  n.x *= m, n.y *= m, n.z *= m;
  //var ring = circle.origin(spherical(n))().coordinates[0];
  //return [
  //  {type: "Polygon", coordinates: [ring]},
  //  {type: "Polygon", coordinates: [ring.slice().reverse()]}
  //];
}

function cartesian(spherical) {
  var a = spherical.x * radians,
      b = spherical.y * radians,
      cosb = Math.cos(b);
  return new Vec3(
    cosb * Math.cos(a),
    cosb * Math.sin(a),
    Math.sin(b)
  );
}

module.exports.cartesian = cartesian;

function voronoi3(points, triangles) {
  if (arguments.length < 2) triangles = delaunay3(points);
  if (!triangles) triangles = [];

  var n = points.length;

  var edgeByStart = [];
  triangles.forEach(function(t) {
    edgeByStart[t.a.p.i] = t.a;
    edgeByStart[t.b.p.i] = t.b;
  });

  return {
    type: "GeometryCollection",
    geometries: n === 1 ? [{type: "Sphere"}]
      : n === 2 ? hemispheres(points[0], points[1])
      : points.map(function(_, i) {
        var cell = [],
            neighbors = [],
            o = {type: "Polygon", coordinates: [cell], neighbors: neighbors},
            e00 = edgeByStart[i],
            e0 = e00,
            e = e0;
        if (!e) return null;
        var centre0 = e.triangle.centre;
        do {
          var centre = e.triangle.centre;
          if (dot(centre, centre0) < EPSILON - 1) {
            var a = cartesian(points[e.neighbor.p.i]), b = cartesian(points[e.p.i]),
                c = normalise(new Vec3(a.x + b.x, a.y + b.y, a.z + b.z));
            if (dot(centre, cross(a, b)) > 0) c.x = -c.x, c.y = -c.y, c.z = -c.z;
            cell.push(spherical(c));
          }
          cell.push(spherical(centre));
          neighbors.push(e.neighbor.p.i);
          centre0 = centre;
          if (e === e00 && e0 !== e00) break;
          e = (e0 = e).next.next.neighbor;
        } while (1);
        return o;
      })
  };
};

function circumcentre(t) {
  var p0 = t.a.p;
  var p1 = t.b.p;
  var p2 = t.c.p;
  var n = cross(subtract(t.c.p, t.a.p), subtract(t.b.p, t.a.p));
  var m2 = 1 / norm2(n);
  var m = Math.sqrt(m2);
  var radius = Math.asin(.5 * m * norm(subtract(p0, p1)) * norm(subtract(p1, p2)) * norm(subtract(p2, p0)));
  var i1 = 0.5 * m2 * norm2(subtract(p1, p2)) * dot(subtract(p0, p1), subtract(p0, p2));
  var i2 = 0.5 * m2 * norm2(subtract(p0, p2)) * dot(subtract(p1, p0), subtract(p1, p2));
  var i3 = 0.5 * m2 * norm2(subtract(p0, p1)) * dot(subtract(p2, p0), subtract(p2, p1));
  var centre = new Vec3(
    i1 * p0.x + i2 * p1.x + i3 * p2.x,
    i1 * p0.y + i2 * p1.y + i3 * p2.y,
    i1 * p0.z + i2 * p1.z + i3 * p2.z
  );
  var k = norm2(centre);
  if (k > EPSILON) {
    centre.x *= (k = 1 / Math.sqrt(k));
    centre.y *= k;
    centre.z *= k;
  }
  else centre = t.n;
  if (!visible(t, centre)) {
    centre.x *= -1;
    centre.y *= -1;
    centre.z *= -1;
    radius = Math.PI - radius;
    centre.negative = true;
  }
  centre.radius = radius;
  return centre;
}

module.exports.convexHull3 = convexHull3;
module.exports.delaunay = delaunay3;
module.exports.voronoi = voronoi3;