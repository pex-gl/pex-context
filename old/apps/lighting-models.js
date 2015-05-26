var sys = require('pex-sys');
var glu = require('pex-glu');
var geom = require('pex-geom');
var gen = require('pex-gen');
var materials = require('pex-materials');
var gui = require('pex-gui');
var color = require('pex-color');
var fx = require('pex-fx');

var Window = sys.Window;
var Time = sys.Time;
var Platform = sys.Platform;
var Mesh = glu.Mesh;
var Texture2D = glu.Texture2D;
var PerspectiveCamera = glu.PerspectiveCamera;
var Arcball = glu.Arcball;
var ScreenImage = glu.ScreenImage;
var Context = glu.Context;
var Cube = gen.Cube;
var Sphere = gen.Sphere;
var Vec3 = geom.Vec3;
var Vec2 = geom.Vec2;
var ShowNormals = materials.ShowNormals;
var SolidColor = materials.SolidColor;
var Diffuse = materials.Diffuse;
var BlinnPhong = materials.BlinnPhong;
var MatCap = materials.MatCap;
var Textured = materials.Textured;
var GUI = gui.GUI;
var Color = color.Color;
var ObjReader = require('./utils/ObjReader');
var GGX = require('./materials/GGX');

var ASSETS_PATH = Platform.isPlask ? __dirname + '/assets' : 'assets';

Window.create({
  settings: {
    width: Platform.isEjecta ? 640 : 1280,
    height: Platform.isEjecta ? 1136 : 720,
    highdpi: Platform.isBrowser ? window.devicePixelRatio : 1,
    fullscreen: Platform.isBrowser,
    stencil: true,
  },
  reflection: 0.4,
  aoEnabled: true,
  exposure: 1,
  blurredReflection: false,
  floorSize: 4,
  ambient: new Color(0.1, 0.1, 0.1, 1),
  diffuse: Color.fromHSL(0.55, 0.3, 0.2, 1),
  specular: new Color(1, 0, 0, 1),
  init: function() {
    this.gui = new GUI(this);
    this.gui.addLabel('Settings');
    this.meshes = [];

    this.framerate(120);

    var d = 0.1;

    this.materials = [
      new Diffuse({ ambientColor: this.ambient, diffuseColor : this.diffuse, specularColor: this.specular }),
      new BlinnPhong({ shininess: 8, ambientColor: this.ambient, diffuseColor: this.diffuse, specularColor: this.specular }),
      new GGX({ ambientColor: this.ambient, diffuseColor: this.diffuse, specularColor: this.specular, wrap: 0 })
    ];

    this.diffuseBrightness = 1;

    this.gui.addParam('Ambient', this, 'ambient' );
    this.gui.addParam('Diffuse', this, 'diffuse' );
    this.gui.addParam('Specular', this, 'specular' );
    this.gui.addLabel('BlinnPhong');
    this.gui.addParam('Shininess', this.materials[1].uniforms, 'shininess', { min: 0, max: 1024 });
    this.gui.addLabel('GGX');
    this.gui.addParam('Roughness', this.materials[2].uniforms, 'roughness', { min: 0, max: 1 });
    this.gui.addParam('N0', this.materials[2].uniforms, 'n0', { min: 0, max: 1 });
    console.log(this.width);
    this.gui.addLabel('Diffuse').setPosition(1*this.width/6-50, this.height-100);
    this.gui.addLabel('Diffuse + BlinnPhong').setPosition(3*this.width/6-50, this.height-100);
    this.gui.addLabel('Diffuse + GGX').setPosition(5*this.width/6-50, this.height-100);

    ObjReader.load(ASSETS_PATH + '/models/geo_blob.obj', function(geo) {
      var vertexHashMap = {};
      var replace = geo.vertices.map(function(v, vi) {
        var hash = v.toString();
        if (vertexHashMap[hash] !== undefined) {
          return vertexHashMap[hash];
        }
        else {
          return vertexHashMap[hash] = vi;
        }
      });
      geo.faces.forEach(function(f) {
        f.forEach(function(index, ii) {
          f[ii] = replace[index];
        })
      })
      //geo = new Cube();
      geo.computeNormals();
      this.meshes.push(new Mesh(geo, this.materials[0]));
      this.meshes.push(new Mesh(geo, this.materials[1]));
      this.meshes.push(new Mesh(geo, this.materials[2]));
      this.meshes.push(new Mesh(geo, this.materials[0]));
      this.meshes.push(new Mesh(geo, this.materials[1]));
      this.meshes.push(new Mesh(geo, this.materials[2]));
      this.meshes[3].scale.set(10, 10, 10)
      this.meshes[4].scale.set(10, 10, 10)
      this.meshes[5].scale.set(10, 10, 10)
    }.bind(this));

    this.bg = new ScreenImage(Texture2D.load(ASSETS_PATH + '/textures/bg_darkgrey.jpg'));
    if (Platform.isEjecta) {
      this.camera = new PerspectiveCamera(60, this.width/this.height);
    }
    else {
      this.camera = new PerspectiveCamera(60, this.width/3/this.height);
    }
    this.arcball = new Arcball(this, this.camera, 3);
    this.arcball.target = new Vec3(0, 0.25, 0);
    this.arcball.updateCamera();
  },
  drawBehindTheMirror: function() {
    glu.clearColorAndDepth(Color.Black);
    if (this.camera.position.y > 0) {
      this.meshMirrored.draw(this.camera);
    }
  },
  draw: function() {
    Time.verbose = true;
    glu.clearColorAndDepth(Color.Black);
    glu.enableDepthReadAndWrite();


    if (!this.meshes[0]) return;

    this.meshes[0].rotation.setAxisAngle(new Vec3(0,1,0).normalize(), Time.seconds * 15);
    this.meshes[1].rotation.setAxisAngle(new Vec3(0,1,0).normalize(), Time.seconds * 15);
    this.meshes[2].rotation.setAxisAngle(new Vec3(0,1,0).normalize(), Time.seconds * 15);
    this.meshes[3].rotation.setAxisAngle(new Vec3(0,1,0).normalize(), Time.seconds * 15);
    this.meshes[4].rotation.setAxisAngle(new Vec3(0,1,0).normalize(), Time.seconds * 15);
    this.meshes[5].rotation.setAxisAngle(new Vec3(0,1,0).normalize(), Time.seconds * 15);
    this.arcball.updateCamera();
    this.camera.updateMatrices();

    if (Platform.isEjecta) {
      glu.viewport(0, 0, this.width, this.height);
      this.meshes[2].draw(this.camera);
      this.meshes[5].draw(this.camera);
    }
    else {
      glu.viewport(0, 0, this.width/3, this.height);
      this.meshes[0].draw(this.camera);
      this.meshes[3].draw(this.camera);
      glu.viewport(this.width/3, 0, this.width/3, this.height);
      this.meshes[1].draw(this.camera);
      this.meshes[4].draw(this.camera);
      glu.viewport(2*this.width/3, 0, this.width/3, this.height);
      this.meshes[2].draw(this.camera);
      this.meshes[5].draw(this.camera);
      glu.viewport(0, 0, this.width, this.height);
      this.gui.draw();
    }
  }
})