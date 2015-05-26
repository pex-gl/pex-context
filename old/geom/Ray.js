//A ray.
//
//Consists of the starting point *origin* and the *direction* vector.  

//## Example use
//     var ray = new Ray(new Vec3(0, 0, 0), new Vec3(0, 0, -1));
//     ray.hitTestSphere(new Vec3(0, 0, -10), 0.5)

//## Reference

var Vec3 = require('./Vec3');

var EPSILON = 0.0001;

//### Ray()
//Constructor  
//`origin` - *{ Vec3 }*  
//`direction` - *{ Vec3 }*
function Ray(origin, direction) {
  this.origin = origin || new Vec3(0, 0, 0);
  this.direction = direction || new Vec3(0, 0, 1);
}

//### hitTestSphere(pos, r)
//Ray - Sphere intersection test  
//`pos` - sphere center *{ Vec3 }*  
//`r` - sphere radius *{ Number }*  
//returns *{ Array of Vec3 }* with the intersection points:  
//0 points if there is no intersection  
//1 point if the ray lays a line tangent to the sphere  
//2 points if the ray lays on a line crossing the sphere  
//http://wiki.cgsociety.org/index.php/Ray_Sphere_Intersection  
Ray.prototype.hitTestSphere = function (pos, r) {
  var hits = [];
  var d = this.direction;
  var o = this.origin;
  var osp = o.dup().sub(pos);
  var A = d.dot(d);
  if (A == 0) {
    return hits;
  }
  var B = 2 * osp.dot(d);
  var C = osp.dot(osp) - r * r;
  var sq = Math.sqrt(B * B - 4 * A * C);
  if (isNaN(sq)) {
    return hits;
  }
  var t0 = (-B - sq) / (2 * A);
  var t1 = (-B + sq) / (2 * A);
  hits.push(o.dup().add(d.dup().scale(t0)));
  if (t0 != t1) {
    hits.push(o.dup().add(d.dup().scale(t1)));
  }
  return hits;
};

//### hitTestPlane(pos, normal)
//Ray - Plane intersection test  
//`pos` - point on the plane *{ Vec3 }*  
//`normal` - plane normal *{ Number }*  
//returns *{ Array of Vec3 }* with the intersection points:  
//0 points if there is no intersection, ray lays on a line parallel to the plane   
//1 point if the ray lays on a line crossing the plane  
//http://www.cs.princeton.edu/courses/archive/fall00/cs426/lectures/raycast/sld017.htm  
//http://cgafaq.info/wiki/Ray_Plane_Intersection  
Ray.prototype.hitTestPlane = function (pos, normal) {
  if (this.direction.dot(normal) == 0) {
    return [];
  }
  var t = normal.dup().scale(-1).dot(this.origin.dup().sub(pos)) / this.direction.dot(normal);
  return [this.origin.dup().add(this.direction.dup().scale(t))];
};

//### hitTestBoundingBox(bbox)
//Ray - Plane intersection test  
//`bbox` - *{ BoundingBox }*  
//returns *{ Array of Vec3 }* with the intersection points:  
//0 points if there is no intersection   
//1 point if the ray lays on a line touching the boundig box corner  
//2 points if the ray lays on a line crossing the bounding box  
Ray.prototype.hitTestBoundingBox = function (bbox) {
  var hits = [];
  var self = this;
  function testFace(pos, size, normal, u, v) {
    var faceHits = self.hitTestPlane(pos, normal);
    if (faceHits.length > 0) {
      var hit = faceHits[0];
      if (hit[u] > pos[u] - size[u] / 2 && hit[u] < pos[u] + size[u] / 2 && hit[v] > pos[v] - size[v] / 2 && hit[v] < pos[v] + size[v] / 2) {
        hits.push(hit);
      }
    }
  }
  var bboxCenter = bbox.getCenter();
  var bboxSize = bbox.getSize();
  testFace(bboxCenter.dup().add(new Vec3(0, 0, bboxSize.z / 2)), bboxSize, new Vec3(0, 0, 1), 'x', 'y');
  testFace(bboxCenter.dup().add(new Vec3(0, 0, -bboxSize.z / 2)), bboxSize, new Vec3(0, 0, -1), 'x', 'y');
  testFace(bboxCenter.dup().add(new Vec3(bboxSize.x / 2, 0, 0)), bboxSize, new Vec3(1, 0, 0), 'y', 'z');
  testFace(bboxCenter.dup().add(new Vec3(-bboxSize.x / 2, 0, 0)), bboxSize, new Vec3(-1, 0, 0), 'y', 'z');
  testFace(bboxCenter.dup().add(new Vec3(0, bboxSize.y / 2, 0)), bboxSize, new Vec3(0, 1, 0), 'x', 'z');
  testFace(bboxCenter.dup().add(new Vec3(0, -bboxSize.y / 2, 0)), bboxSize, new Vec3(0, -1, 0), 'x', 'z');

  hits.forEach(function (hit) {
    hit._distance = hit.distance(self.origin);
  });

  hits.sort(function (a, b) {
    return a._distance - b._distance;
  });

  hits.forEach(function (hit) {
    delete hit._distance;
  });

  if (hits.length > 0) {
    hits = [hits[0]];
  }

  return hits;
};

//### hitTestTriangle(triangle)
//Ray - Plane intersection test  
//`triangle` - *{ Triangle3D }*  
//returns *{ Vec3 }* if there is intersection or a negatie *{ Number }* error code otherwise  
//http://geomalgorithms.com/a06-_intersect-2.html#intersect3D_RayTriangle()
Ray.prototype.hitTestTriangle = function(triangle) {
  //Vector    u, v, n;              // triangle vectors
  //Vector    dir, w0, w;           // ray vectors
  //float     r, a, b;              // params to calc ray-plane intersect

  var ray = this;

  //// get triangle edge vectors and plane normal
  //u = T.V1 - T.V0;
  //v = T.V2 - T.V0;
  var u = triangle.b.dup().sub(triangle.a);
  var v = triangle.c.dup().sub(triangle.a);
  //n = u * v;              // cross product
  var n = Vec3.create().asCross(u, v);
  //if (n == (Vector)0)             // triangle is degenerate
  //    return -1;                  // do not deal with this case

  if (n.length() < EPSILON) return -1;

  //dir = R.P1 - R.P0;              // ray direction vector
  //w0 = R.P0 - T.V0;
  var w0 = ray.origin.dup().sub(triangle.a);

  //a = -dot(n,w0);
  //b = dot(n,dir);
  var a = -n.dot(w0);
  var b = n.dot(ray.direction);

  //if (fabs(b) < SMALL_NUM) {     // ray is  parallel to triangle plane
  //    if (a == 0)                 // ray lies in triangle plane
  //        return 2;
  //    else return 0;              // ray disjoint from plane
  //}
  if (Math.abs(b) < EPSILON) {
    if (a == 0) return -2;
    else return -3;
  }

  //// get intersect point of ray with triangle plane
  //r = a / b;
  //if (r < 0.0)                    // ray goes away from triangle
  //    return 0;                   // => no intersect
  //// for a segment, also test if (r > 1.0) => no intersect
  var r = a / b;
  if (r < -EPSILON) {
    return -4;
  }

  //*I = R.P0 + r * dir;            // intersect point of ray and plane
  var I = ray.origin.dup().add(ray.direction.dup().scale(r));

  //// is I inside T?
  //float    uu, uv, vv, wu, wv, D;
  //uu = dot(u,u);
  //uv = dot(u,v);
  //vv = dot(v,v);
  var uu = u.dot(u);
  var uv = u.dot(v);
  var vv = v.dot(v);

  //w = *I - T.V0;
  var w = I.dup().sub(triangle.a);

  //wu = dot(w,u);
  //wv = dot(w,v);
  var wu = w.dot(u);
  var wv = w.dot(v);

  //D = uv * uv - uu * vv;
  var D = uv * uv - uu * vv;

  //// get and test parametric coords
  //float s, t;
  //s = (uv * wv - vv * wu) / D;
  var s = (uv * wv - vv * wu) / D;

  //if (s < 0.0 || s > 1.0)         // I is outside T
  //    return 0;
  if (s < -EPSILON || s > 1.0 + EPSILON) return -5;

  //t = (uv * wu - uu * wv) / D;
  var t = (uv * wu - uu * wv) / D;

  //if (t < 0.0 || (s + t) > 1.0)  // I is outside T
  //    return 0;
  if (t < -EPSILON || (s + t) > 1.0 + EPSILON) {
    return -6;
  }

  //return { s: s, t : t};                       // I is in T

  return u.scale(s).add(v.scale(t)).add(triangle.a);
}

module.exports = Ray;
