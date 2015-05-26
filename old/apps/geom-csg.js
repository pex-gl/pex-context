var sys       = require('pex-sys');
var glu       = require('pex-glu');
var materials = require('pex-materials');
var color     = require('pex-color');
var gen       = require('pex-gen');
var geom      = require('pex-geom');
var helpers   = require('pex-helpers');
var csg       = require('./lib/csg');
var fn        = require('./utils/fn');

var Cube              = gen.Cube;
var Sphere            = gen.Sphere;
var Mesh              = glu.Mesh;
var SolidColor        = materials.SolidColor;
var ShowNormals       = materials.ShowNormals;
var Diffuse           = materials.Diffuse;
var PerspectiveCamera = glu.PerspectiveCamera;
var Arcball           = glu.Arcball;
var Color             = color.Color;
var Platform          = sys.Platform;
var Geometry          = geom.Geometry;
var Vec3              = geom.Vec3;
var Quat              = geom.Quat;
var Plane             = geom.Plane;
var BoundingBox       = geom.BoundingBox;
var AxisHelper        = helpers.AxisHelper;

function csg2geometry(c) {
  var polygons = c.toPolygons();

  var vertices = fn.flatten(polygons.map(function(polygon) {
    return polygon.vertices.map(function(v) {
      return new Vec3(v.pos.x, v.pos.y, v.pos.z);
    });
  }));

  var vartexCount = 0;
  var faces = polygons.map(function(polygon) {
    return polygon.vertices.map(function(v) {
      return vartexCount++;
    });
  });

  var g = new Geometry({ vertices: vertices, faces: faces });
  g = g.triangulate();
  g.computeNormals();
  return g;
}

function geometry2csg(g) {
  return csg.fromPolygons(g.faces.map(function(f) {
    return new csg.Polygon(f.map(function(i) {
      return new csg.Vertex(g.vertices[i], g.normals[i]);
    }));
  }));
}

function clip(g, plane) {
  var clip = new Cube(10, 10, 10);
  var faceCenter = new Vec3(0, 0, 5);

  var rot = Quat.fromDirection(plane.normal.normalize());
  faceCenter.transformQuat(rot);

  var translate = plane.point.dup().sub(faceCenter);

  clip.vertices.forEach(function(v) {
    v.transformQuat(rot).add(translate);
  });

  return csg2geometry(geometry2csg(g).intersect(geometry2csg(clip)));
}

function vec3hash(v) {
  return Math.floor(v.x*1000)/1000 + ',' + Math.floor(v.y*1000)/1000 + ',' + Math.floor(v.z*1000)/1000
}

function toClosedGeometry(g) {
  var vertexCache = {};
  var newVertices = [];

  var newVerticesMap = g.vertices.map(function(v) {
    var hash = vec3hash(v);
    if (typeof(vertexCache[hash]) == 'undefined') {
      vertexCache[hash] = newVertices.length;
      newVertices.push(v);
    }
    return vertexCache[hash];
  });

  console.log(newVerticesMap.length, '->', newVertices.length);

  var newFaces = g.faces.map(function(f) {
    return f.map(function(i) {
      return newVerticesMap[i];
    })
  });

  var newGeometry = new Geometry({ vertices: newVertices, faces: newFaces });
  return newGeometry;
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
    this.arcball = new Arcball(this, this.camera, 4);


    geom.randomSeed(0);

    var points = fn.sequence(0, 10).map(function() {
      var p = geom.randomVec3();
      p.y *= 0.5;
      return p;
    });

    this.pieces = points.map(function(center, pointIndex) {
      var planes = points
      .filter(function(point) {
        return point != center;
      })
      .map(function(point) {
        centerToPoint = Vec3.create().asSub(point, center)
        return new Plane(center.dup().add(centerToPoint.dup().scale(0.5)), centerToPoint.normalize())
      });

      //planes[0] = new Plane(new Vec3(1, 1, 1), new Vec3(1, 1, 1).normalize());


      var cube = csg.cube();
      var sphere = csg.sphere({ radius: 1.3, center: [1, 0, 1] });
      var polygons = cube.subtract(sphere);
      var mesh = csg2geometry(polygons);

      planes.forEach(function(plane) {
        mesh = clip(mesh, plane);
      })

      return mesh;
    }.bind(this))
    .map(function(g) {
      g.computeNormals();
      var bbox = BoundingBox.fromPoints(g.vertices);
      g = toClosedGeometry(g).toFlatGeometry();
      //g = g.catmullClark();
      //g = g.dooSabin(0.1);
      g.computeNormals();
      var m = new Mesh(g, new Diffuse({ wrap: 1 }));
      m.position = bbox.getCenter().scale(0.1);
      return m;
    });

    this.axis = new AxisHelper(2);
  },
  draw: function() {
    glu.clearColorAndDepth(Color.Black);
    glu.enableDepthReadAndWrite(true);
    this.pieces.forEach(function(p, pi) {
      //if (pi == 0)
      p.draw(this.camera);
    }.bind(this));
    this.axis.draw(this.camera);
    //this.ball.draw(this.camera);
  }
});
