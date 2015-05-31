var sys = require('pex-sys');
var glu = require('pex-glu');
var materials = require('pex-materials');
var color = require('pex-color');
var gen = require('pex-gen');

var Cube = gen.Cube;
var Mesh = glu.Mesh;
var ShowNormals = materials.ShowNormals;
var PerspectiveCamera = glu.PerspectiveCamera;
var Arcball = glu.Arcball;
var Color = color.Color;
var Platform = sys.Platform;
var Vec3 = require('pex-geom').Vec3;
var Quat = require('pex-geom').Quat;

sys.Window.create({
  settings: {
    width: 1280,
    height: 720,
    type: '3d',
    fullscreen: Platform.isBrowser ? true : false
  },
  init: function() {
    var cube = new Cube();
    this.mesh = new Mesh(cube, new ShowNormals());

    this.camera = new PerspectiveCamera(60, this.width / this.height);
    this.arcball = new Arcball(this, this.camera);

    this.instances = [];
    for(var i=0; i<5000; i++) {
      var pos = new Vec3(Math.random()*1-0.5, Math.random()*1-0.5, Math.random()*1-0.5)
      var rotation = Quat.fromDirection(pos.dup().normalize());
      this.instances.push({
        scale: new Vec3(0.2, 0.2, 0.2),
        position: pos,
        rotation: rotation
      })
    }
  },
  draw: function() {
    console.time('frame');
    glu.clearColorAndDepth(Color.Black);
    glu.enableDepthReadAndWrite(true);
    this.mesh.drawInstances(this.camera, this.instances);
    this.gl.flush();
    console.timeEnd('frame');
    console.log('est fps', Math.floor(1000/45));
  }
});
