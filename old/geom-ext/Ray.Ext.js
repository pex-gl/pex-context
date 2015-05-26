var geom = require('pex-geom');
var Vec3 = geom.Vec3;

//http://geomalgorithms.com/a06-_intersect-2.html#intersect3D_RayTriangle()
geom.Ray.prototype.hitTestTriangle = function(triangle) {
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

  if (n.length() < 0.0001) return -1;

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
  if (Math.abs(b) < 0.0001) {
    if (a == 0) return -2;
    else return -3;
  }

  //// get intersect point of ray with triangle plane
  //r = a / b;
  //if (r < 0.0)                    // ray goes away from triangle
  //    return 0;                   // => no intersect
  //// for a segment, also test if (r > 1.0) => no intersect
  var r = a / b;
  if (r < 0.0) {
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
  if (s < 0.0 || s > 1.0) return -5;

  //t = (uv * wu - uu * wv) / D;
  var t = (uv * wu - uu * wv) / D;

  //if (t < 0.0 || (s + t) > 1.0)  // I is outside T
  //    return 0;
  if (t < 0.0 || (s + t) > 1.0) return -6;

  return { s: s, t : t};                       // I is in T
}