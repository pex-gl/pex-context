var sys = require('pex-sys');
var glu = require('pex-glu');
var materials = require('pex-materials');
var color = require('pex-color');
var gen = require('pex-gen');
var geom = require('pex-geom');
var timeline = require('timeline-js');

var Cube = gen.Cube;
var Mesh = glu.Mesh;
var ShowNormals = materials.ShowNormals;
var PerspectiveCamera = glu.PerspectiveCamera;
var Arcball = glu.Arcball;
var Color = color.Color;
var Platform = sys.Platform;
var Time = sys.Time;
var Vec3 = geom.Vec3;
var Timeline = timeline.Timeline;
var anim = timeline.anim;

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

    this.angle = 0;
    this.distance = 5;
    anim(this).to(0, { angle: Math.PI / 2 }, 0.5, Timeline.Easing.Cubic.EaseInOut ).to(3, { angle: Math.PI }, 0.5, Timeline.Easing.Cubic.EaseOut );
    anim(this).to(0.5, { distance: 1.5 }, 3, Timeline.Easing.Cubic.EaseOut ).to(0, { distance: 3 }, 0.5, Timeline.Easing.Cubic.EaseOut );
  },
  draw: function() {
    Time.verbose = true;
    this.arcball.setPosition(new Vec3(
      5 * Math.cos(this.angle),
      2,
      5 * Math.sin(this.angle)
    ).normalize().scale(this.distance));
    glu.clearColorAndDepth(Color.Black);
    glu.enableDepthReadAndWrite(true);
    this.mesh.draw(this.camera);
  }
});
