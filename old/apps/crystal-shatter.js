var sys       = require('pex-sys');
var glu       = require('pex-glu');
var materials = require('pex-materials');
var color     = require('pex-color');
var gen       = require('pex-gen');
var gui       = require('pex-gui');
var geom      = require('pex-geom');
var helpers   = require('pex-helpers');

var Cube              = gen.Cube;
var PlaneGeom             = gen.Plane;
var Box               = gen.Box;
var Cylinder          = require('./gen/Cylinder');
var Plane             = require('./geom/Plane');
var GeometryBla       = require('./geom/Geometry.clip');
var Mesh              = glu.Mesh;
var ShowNormals       = materials.ShowNormals;
var SolidColor        = materials.SolidColor;
var Diffuse           = materials.Diffuse;
var MatCap            = materials.MatCap;
var PerspectiveCamera = glu.PerspectiveCamera;
var Arcball           = glu.Arcball;
var Texture2D         = glu.Texture2D;
var Color             = color.Color;
var Platform          = sys.Platform;
var BoundingBox       = geom.BoundingBox;
var Vec3              = geom.Vec3;
var Quat              = geom.Quat;
var Geometry          = geom.Geometry;
var EdgeHelper        = helpers.EdgeHelper;
var VertexHelper      = helpers.VertexHelper;
var AxisHelper        = helpers.AxisHelper;
var Time              = sys.Time;
var GUI               = gui.GUI;
var timeline          = require('./lib/timeline.js')
var Timeline          = timeline.Timeline;
var anim              = timeline.anim;

function isMesh(o) {
  return o.geometry != null;
}

function focusOnScene(scene, arcball) {
  var bbox = new BoundingBox(new Vec3(0,0,0), new Vec3(0,0,0));
  scene.filter(isMesh).forEach(function(mesh) {
    var obbox = BoundingBox.fromPoints(mesh.geometry.vertices);
    bbox.addPoint(obbox.min);
    bbox.addPoint(obbox.max);
  });
  //arcball.setTarget(bbox.getCenter());
  //arcball.setPosition(new Vec3(
  //  bbox.max.x * 3,
  //  bbox.max.y * 2,
  //  bbox.max.z * 3
  //));
}

sys.Window.create({
  settings: {
    width: 1280,
    height: 720,
    type: '3d',
    fullscreen: Platform.isBrowser ? true : false
  },
  meshIndex: 0,
  split: 0,
  rotation: 0,
  init: function() {
    this.initGUI();
    this.initScene();
    this.initMeshes();
    focusOnScene(this.scene, this.arcball);
  },
  initScene: function() {
    this.scene = [];
    this.camera = new PerspectiveCamera(60, this.width / this.height);
    this.camera.setPosition(new Vec3(
      3,
      1,
      3
    ));
    //this.arcball = new Arcball(this, this.camera);
  },
  initMeshes: function() {
    var cube = new Cylinder(0.5, 0.5, 2, 6, 1)
    cube.vertices[cube.vertices.length-2].y -= 0.6;
    cube.vertices[cube.vertices.length-1].y += 0.6;
    //cube = cube.toFlatGeometry();

    var bbox = new BoundingBox(new Vec3(0,-0.15,0), new Vec3(0.5, 0.3, 0.5));

    geom.randomSeed(0);

    var numPoints = 40;
    var points = [];
    for(var i=0; i<numPoints; i++) {
      points.push(geom.randomVec3InBoundingBox(bbox));
    }

    var brokenPiece = [];
    var planesScene = this.planesScene = [];

    var pieces = points.map(function(center, pointIndex) {
      var planes = points
      .filter(function(point) {
        return point != center;
      })
      .map(function(point) {
        centerToPoint = Vec3.create().asSub(point, center)
        return new Plane(center.dup().add(centerToPoint.dup().scale(0.5)), centerToPoint.normalize())
      });

      var piece = cube;
      var broken = false;
      var debug = false;
      planes.forEach(function(plane, planeIndex) {
        if (broken) return;
        try {
          if (pointIndex == 26) {
            console.log('#', pointIndex, planeIndex, 'faces', piece.faces.length);
            debug = true;
          }
          else {
            debug = false;
          }
          //piece = piece.clip(plane, true, pointIndex == 11 && planeIndex == 9);
          //piece = piece.clip(plane, true, pointIndex == 11);
          piece = piece.clip(plane, true, debug);
          //if (pointIndex == 11 && planeIndex == 9) {
          if (pointIndex == 26) {
            brokenPiece.push(piece);
            var p = new PlaneGeom(2, 2);
            var planeMesh = new Mesh(p, new SolidColor({ color: new Color(1, 0, 0, 0.5) }));
            planeMesh.position = plane.point;
            planeMesh.rotation = Quat.fromDirection(plane.normal);

            planesScene.push(planeMesh);
          }
        }
        catch(e) {
          console.log('#', pointIndex, planeIndex, 'faces', piece.faces.length);
          console.log('error', e.stack);
          broken = true;
        }
      });

      return piece;
    }).filter(function(m) { return m != null; });

    //pieces = brokenPiece;

    var diffuse = new Diffuse({ wrap: 1 });
    var diffuse = new MatCap({ texture : Texture2D.load('assets/matcap2.jpg') })

    this.edgesScene = [];

    pieces.forEach(function(p) {
      p.computeEdges();
      tp = p.dooSabin(0.01).triangulate().toFlatGeometry();
      var bbox = BoundingBox.fromPoints(p.vertices);
      var center = bbox.getCenter();
      tp.computeEdges();
      tp.computeNormals();
      var e = new EdgeHelper(p);
      var m = new Mesh(tp, diffuse);
      var t = (1.0 - Math.abs(center.y/2))*(1.0 - Math.abs(center.y/2));
      //var angle = -300 * center.y/2;
      var angle = geom.randomFloat(-200, 200);
      center.x *= 1.2;
      center.y *= 1.6;
      center.z *= 1.2;
      center.z -= t;
      var axis = geom.randomVec3();
      axis.y = 0;
      axis.normalize();
      e.targetPosition = center;
      m.targetPosition = center;
      e.targetRotation = angle;
      m.targetRotation = angle;
      e.axis = axis;
      m.axis = axis;
      this.edgesScene.push(e);
      this.scene.push(m);
    }.bind(this))

    this.meshIndex = 0;

    this.on('keyDown', function(e) {
      if (e.keyCode == 123) this.meshIndex--;
      if (e.keyCode == 124) this.meshIndex++;
      console.log('this.meshIndex', this.meshIndex);
    }.bind(this));
  },
  initGUI: function() {
    this.gui = new GUI(this);
    this.gui.addParam('Split', this, 'split');
    this.gui.addParam('Rotation', this, 'rotation', { min : -Math.PI/2, max: Math.PI/2});

    anim(this)
      .to({ split: 0, rotation: Math.PI*0.4}, 0)
      .to({ split: 0 }, 0.3)
      .to({ split: 1 }, 1, Timeline.Easing.Cubic.EaseOut)

    Timeline.getGlobalInstance().loop(2)
  },
  drawScene: function() {
    this.scene.forEach(function(mesh, meshIndex) {
      mesh.position.setVec3(mesh.targetPosition.dup().scale(this.split));
      mesh.rotation = Quat.fromAxisAngle(mesh.axis, mesh.targetRotation * this.split);

      mesh.draw(this.camera);
    }.bind(this));

    this.edgesScene.forEach(function(mesh, meshIndex) {
      mesh.position.setVec3(mesh.targetPosition.dup().scale(this.split));
      mesh.rotation = Quat.fromAxisAngle(mesh.axis, mesh.targetRotation * this.split);
      //mesh.draw(this.camera);
    }.bind(this));
  },
  drawDebug: function() {
    this.scene.forEach(function(mesh, meshIndex) {
      if (meshIndex == this.meshIndex) mesh.draw(this.camera);
    }.bind(this));

    this.edgesScene.forEach(function(mesh, meshIndex) {
      if (meshIndex == this.meshIndex || meshIndex == this.meshIndex - 1) mesh.draw(this.camera);
    }.bind(this));

    glu.enableAlphaBlending();
    this.planesScene.forEach(function(mesh, meshIndex) {
      if (meshIndex == this.meshIndex) mesh.draw(this.camera);
    }.bind(this));
    glu.enableBlending(false, false);
  },
  draw: function() {
    glu.clearColorAndDepth(Color.DarkGrey);
    glu.enableDepthReadAndWrite(true);

    var position = this.camera.getPosition();
    position.x = 4 * Math.cos(this.rotation);
    position.z = 4 * Math.sin(this.rotation);
    this.camera.setPosition(position);

    this.drawScene();
    //this.drawDebug();
    this.gui.draw();
  }
});
