define(["pex/core/Context", "pex/core/Vec2", "pex/core/Vec3", "pex/core/Mat4", "pex/core/Geometry", "pex/core/Mesh", "pex/core/Edge", "pex/core/Color", "pex/materials/SolidColorMaterial", "geom/Line3D", "geom/Mat3"],
  function(Context, Vec2, Vec3, Mat4, Geometry, Mesh, Edge, Color, SolidColorMaterial, Line3D, Mat3) {
  function Plane(point, normal, color) {
    this.color = color || Color.Red;
    this.point = point;
    this.normal = normal;
    this.buildMesh();
  }

  Plane.prototype.getBaseVectors = function() {
    var invLength;
    var N = this.normal.normalized();
    var U = new Vec3();
    if (Math.abs(N.x) > Math.abs(N.y)) {
      U.x = N.z;
      U.y = 0;
      U.z = -N.x;
    }
    else {
      U.x = 0;
      U.y = N.z;
      U.z = -N.y;
    }
    U.normalize();

    var V = N.crossed(U);

    return {
      up: U,
      right: V,
      front : this.normal
    };
  };

  Plane.prototype.vec3ToVec2 = function(v) {
    var baseVectors = this.getBaseVectors();
    //var m = Mat3.fromVectorBase(baseVectors.up, baseVectors.right, this.normal);
    var d = v.subbed(this.point);
    //var result = m.mulVec3(d);
    var v2 = new Vec2(baseVectors.right.dot(d), baseVectors.up.dot(d));

    var m = Mat3.fromVectorBase(baseVectors.right, baseVectors.up, baseVectors.front);
    var v2m = m.mulVec3(d);

    var m4 = new Mat4();
    m4.set4x4r(
      baseVectors.right.x, baseVectors.right.y, baseVectors.right.z, 0,
      baseVectors.up.x, baseVectors.up.y, baseVectors.up.z, 0,
      baseVectors.front.x, baseVectors.front.y, baseVectors.front.z, 0,
      0, 0, 0, 1
    );
    var v4m = m4.mulVec3(d);

    return v2;
  };

   Plane.prototype.vec2ToVec3 = function(v) {
    var baseVectors = this.getBaseVectors();
    var result = baseVectors.right.scaled(v.x).add(baseVectors.up.scaled(v.y));
    result.add(this.point);
    return result;
  };


  Plane.prototype.buildMesh = function() {
    var gl = Context.currentContext.gl;
    var geometry = new Geometry();
    geometry.vertices = [];
    geometry.faces = [];

    var baseVectors = this.getBaseVectors();

    geometry.vertices.push(this.point.added(baseVectors.right.scaled(-0.5).added(baseVectors.up.scaled(-0.5))));
    geometry.vertices.push(this.point.added(baseVectors.right.scaled( 0.5).added(baseVectors.up.scaled(-0.5))));
    geometry.vertices.push(this.point.added(baseVectors.right.scaled( 0.5).added(baseVectors.up.scaled( 0.5))));
    geometry.vertices.push(this.point.added(baseVectors.right.scaled(-0.5).added(baseVectors.up.scaled( 0.5))));

    geometry.edges = [];
    geometry.edges.push(new Edge(0, 1));
    geometry.edges.push(new Edge(1, 2));
    geometry.edges.push(new Edge(2, 3));
    geometry.edges.push(new Edge(3, 0));
    geometry.edges.push(new Edge(0, 2));
    geometry.edges.push(new Edge(1, 3));

    this.mesh = new Mesh(geometry, new SolidColorMaterial({color: this.color.toVec4()}), {useEdges:true, primitiveType:gl.LINES});
  };

  Plane.intersectTwoPlanes = function(p1, p2) {
    var direction = p1.normal.crossed(p2.normal);
    if (direction.length() === 0) {
      return null;
    }

    var s1 = p1.normal.dot(p1.point);
    var s2 = p2.normal.dot(p2.point);
    var n1n2dot = p1.normal.dot(p2.normal);
    var n1normsqr = p1.normal.dot(p1.normal);
    var n2normsqr = p2.normal.dot(p2.normal);
    var a = (s2 * n1n2dot - s1 * n2normsqr) / (n1n2dot*n1n2dot - n1normsqr * n2normsqr);
    var b = (s1 * n1n2dot - s2 * n2normsqr) / (n1n2dot*n1n2dot - n1normsqr * n2normsqr);
    var point = p1.normal.scaled(a).add(p2.normal.scaled(b));

    return new Line3D(point, direction);
  };

  Plane.prototype.draw = function(camera) {
    this.mesh.draw(camera);
  };

  return Plane;
});