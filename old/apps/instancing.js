var sys = require('pex-sys');
var glu = require('pex-glu');
var materials = require('pex-materials');
var color = require('pex-color');
var gen = require('pex-gen');
var gui = require('pex-gui');
var geom = require('pex-geom');
var random = require('pex-random');

var Cube = gen.Cube;
var Box = gen.Box;
var HexSphere = gen.HexSphere;
var Mesh = glu.Mesh;
var ShowNormals = materials.ShowNormals;
var SolidColor = materials.SolidColor;
var PerspectiveCamera = glu.PerspectiveCamera;
var Arcball = glu.Arcball;
var Color = color.Color;
var Time = sys.Time;
var Vec3 = geom.Vec3;
var Quat = geom.Quat;
var Platform = sys.Platform;
var GUI = gui.GUI;
var Diffuse = materials.Diffuse;

var ShowNormalsInstanced = require('./materials/ShowNormalsInstanced');

var DPI = Platform.isPlask ? 2 : 2;

function prop(name) {
  return function(o) {
    return o[name];
  }
}

sys.Window.create({
  settings: {
    width: 1280*DPI,
    height: 720*DPI,
    type: '3d',
    highdpi: DPI,
    fullscreen: true
  },
  instancing: true,
  init: function() {
    this.camera = new PerspectiveCamera(60, this.width / this.height);
    this.arcball = new Arcball(this, this.camera);
    var sphere = new Box(3, 0.2, 1).catmullClark().catmullClark().catmullClark().catmullClark().catmullClark().catmullClark();
    sphere.computeNormals();
    this.origSphere = sphere.clone();
    this.mesh = new Mesh(sphere, new SolidColor({ color: Color.Black, pointSize: 3 }));

    var lowPolySphere = new Box(3,0.23,1).catmullClark().catmullClark();//.catmullClark();
    lowPolySphere = lowPolySphere.triangulate();
    lowPolySphere.computeNormals();
    this.lowPolyOrigSphere = lowPolySphere.clone();
    this.lowPolyMesh = new Mesh(lowPolySphere, new SolidColor({ color: Color.Black, pointSize: 3 }));

    var offsets = sphere.vertices.map(function(v) { return v.clone() });
    var rotations = sphere.vertices.map(function(v) { return new Quat() });

    var cube = this.cube = new Cube(0.003, 0.003, 0.05);
    cube.addAttrib('offsets', 'offset', offsets, true, true);
    cube.addAttrib('rotations', 'rotation', rotations, true, true);
    this.instancedCubes = new Mesh(cube, new ShowNormalsInstanced());
  },
  draw: function() {
    glu.clearColorAndDepth(Color.Black);
    glu.enableDepthReadAndWrite(true);

    var origSphere = this.origSphere;
    var lowPolyOrigSphere = this.lowPolyOrigSphere;

    var rot = Quat.fromDirection(new Vec3(0,1,1).normalize());

    var s = 1.85;
    var n = new Vec3();
    for(var vi=0; vi<this.mesh.geometry.vertices.length; vi++) {
      var v = this.mesh.geometry.vertices[vi];
      n.setVec3(origSphere.vertices[vi]);
      var f = 0.08 * random.noise3(s * n.x + Time.seconds, s * n.y, s * n.z);
      n.normalize();
      v.setVec3(origSphere.vertices[vi]);
      v.add(n.scale(f));
      this.cube.offsets[vi].setVec3(v);
    };
    this.mesh.geometry.vertices.dirty = true;
    this.mesh.geometry.computeNormals();

    for(var vi=0; vi<this.lowPolyMesh.geometry.vertices.length; vi++) {
      var v = this.lowPolyMesh.geometry.vertices[vi];
      n.setVec3(lowPolyOrigSphere.vertices[vi]);
      var f = 0.08 * random.noise3(s * n.x + Time.seconds, s * n.y, s * n.z);
      n.normalize();
      v.setVec3(lowPolyOrigSphere.vertices[vi]);
      v.add(n.scale(f));
    };
    this.lowPolyMesh.geometry.vertices.dirty = true;

    this.cube.offsets.dirty = true;
    for(var i=0; i<this.cube.rotations.length; i++) {
      this.cube.rotations[i].setDirection(this.mesh.geometry.normals[i]).mul(rot);
    }
    this.cube.rotations.dirty = true;

    this.lowPolyMesh.draw(this.camera);
    this.instancedCubes.draw(this.camera);
  }
});