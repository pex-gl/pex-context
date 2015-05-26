var sys = require('pex-sys');
var glu = require('pex-glu');
var materials = require('pex-materials');
var color = require('pex-color');
var gen = require('pex-gen');
var random = require('pex-random');
var R = require('ramda');
var Geometry = require('pex-geom').Geometry;
var Vec3 = require('pex-geom').Vec3;
var Quat = require('pex-geom').Quat;
var Time = require('pex-sys').Time;
var LineBuilder = require('pex-gen').LineBuilder;
var voronoi = require('./convexHull3').voronoi;
var delaunay = require('./convexHull3').delaunay;
var cartesian = require('./convexHull3').cartesian;
var convexHull3 = require('./convexHull3').convexHull3;

var Cube = gen.Cube;
var Mesh = glu.Mesh;
var ShowNormals = materials.ShowNormals;
var SolidColor = materials.SolidColor;
var PerspectiveCamera = glu.PerspectiveCamera;
var Arcball = glu.Arcball;
var Color = color.Color;
var Platform = sys.Platform;

function point2array(p) {
  return [p.x, p.y, p.z];
}

function forEachTwo(list, cb) {
  for(var i = 0; i < list.length-1; i++) {
    cb(list[i], list[i+1]);
  }
  cb(list[i], list[0]);
}

function centroid(points) {
  var center = new Vec3(0, 0, 0);
  for(var i=0; i<points.length; i++) {
    center.add(points[i]);
  }
  center.scale(1/points.length);
  return center;
}

sys.Window.create({
  settings: {
    width: 1280,
    height: 720,
    type: '3d',
    fullscreen: Platform.isBrowser ? true : false
  },
  init: function() {
    this.camera = new PerspectiveCamera(60, this.width / this.height);
    this.arcball = new Arcball(this, this.camera);
    this.redColor = new SolidColor({ color: Color.Red, pointSize: 5 });
    this.pinkColor = new SolidColor({ color: new Color(1, 0.8, 0.8), pointSize: 5 });
    this.blueColor = new SolidColor({ color: Color.Blue });
    this.points = R.range(0, 100).map(function() {
      return random.vec3().normalize();
    });
    this.rotations = this.points.map(function() {
      var q = new Quat();
      q.setAxisAngle(random.vec3(), 0.1)
      return q;
    })
  },
  rebuild: function() {
    var points = this.points;
    points.forEach(function(p, pi) {
      p.transformQuat(this.rotations[pi]);
    }.bind(this));

    var pointsGeom = new Geometry({ vertices: points });
    this.pointsMesh = new Mesh(pointsGeom, this.redColor, { points: true });

    var triangles = delaunay(points);
    var lineBuilderTri = new LineBuilder();
    triangles.forEach(function(tri) {
      lineBuilderTri.addLine(tri.a.p, tri.b.p)
      lineBuilderTri.addLine(tri.b.p, tri.c.p)
      lineBuilderTri.addLine(tri.c.p, tri.a.p)
    })
    if (this.trianglesMesh) this.trianglesMesh.dispose();
    this.trianglesMesh = new Mesh(lineBuilderTri, this.blueColor, { lines: true });
    //console.log(cells)

    var fullGeom = new Geometry({ vertices: true, faces: true });
    var fi = 0;

    var lineBuilder = new LineBuilder();
    var cells = voronoi(points).geometries;
    cells.forEach(function(cell) {
      if (!cell) return;
      //console.log(cell.coordinates[0])
      var points = cell.coordinates[0].map(cartesian);

      points.forEach(function(p) {
        var n = p.dup().normalize()
        var f = 0.1 * random.noise3(n.x + Time.seconds, n.y, n.z);
        p.add(n.scale(f));
      });

      var c = centroid(points);
      //console.log(points[0])
      //console.log(points)
      forEachTwo(points, lineBuilder.addLine.bind(lineBuilder))
      forEachTwo(points, function(a, b) {
        fullGeom.vertices.push(a, b, c);
        fullGeom.faces.push([fi++, fi++, fi++]);
      })
    //  lineBuilder.addLine(tri.a.p, tri.b.p);
    //  lineBuilder.addLine(tri.b.p, tri.c.p);
    //  lineBuilder.addLine(tri.c.p, tri.a.p);
    })

    if (this.linesMesh) this.linesMesh.dispose();
    this.linesMesh = new Mesh(lineBuilder, this.redColor, { lines: true });
    this.geomMesh = new Mesh(fullGeom, this.pinkColor);
    this.geomMesh.scale.set(0.999, 0.999, 0.999);
  },
  draw: function() {
    this.rebuild();
    glu.clearColorAndDepth(Color.White);
    glu.enableDepthReadAndWrite(true);
    //this.pointsMesh.draw(this.camera);
    this.linesMesh.draw(this.camera);
    this.geomMesh.draw(this.camera);
    //this.trianglesMesh.draw(this.camera);
  }
});
