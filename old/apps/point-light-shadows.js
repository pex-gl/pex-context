var sys = require('pex-sys');
var glu = require('pex-glu');
var materials = require('pex-materials');
var color = require('pex-color');
var gen = require('pex-gen');
var geom = require('pex-geom');
var fx = require('pex-fx');
var ShadowMap = require('./fx/ShadowMap');

var Box = gen.Box;
var Dodecahedron = gen.Dodecahedron;
var Sphere = gen.Sphere;
var Mesh = glu.Mesh;
var ShowNormals = materials.ShowNormals;
var SolidColor = materials.SolidColor;
var ShowDepth = materials.ShowDepth;
var Diffuse = materials.Diffuse;
var PerspectiveCamera = glu.PerspectiveCamera;
var Arcball = glu.Arcball;
var Color = color.Color;
var Program = glu.Program;
var Material = glu.Material;
var Texture2D = glu.Texture2D;
var Time = sys.Time;
var Vec3 = geom.Vec3;
var Quat = geom.Quat;
var LineBuilder = gen.LineBuilder;
var ShowColors = materials.ShowColors;

sys.Window.create({
  settings: {
    width: 1600,
    height: 800,
    type: '3d',
    fullscreen: sys.Platform.isBrowser
  },
  init: function() {
    this.lightMesh = new Mesh(new Sphere(0.1), new SolidColor({ color: Color.White }));

    var box = new Dodecahedron(1).wire(0.1).toFlatGeometry();
    box.computeNormals();
    this.boxMesh = new Mesh(box, new Diffuse({ lightPos: this.lightMesh.position }));

    var box2 = new Dodecahedron(1.5).wire(0.1).toFlatGeometry();
    box2.computeNormals();
    this.box2Mesh = new Mesh(box2, new Diffuse({ lightPos: this.lightMesh.position }));

    var room = new Box(10).toFlatGeometry();
    room.computeNormals();
    room.normals.forEach(function(n) {
      //flip upside down
      n.scale(-1);
    })
    this.roomMesh = new Mesh(room, new Diffuse({ lightPos: this.lightMesh.position }));

    this.camera = new PerspectiveCamera(60, this.width / this.height, 0.1, 20);
    this.arcball = new Arcball(this, this.camera);
    this.arcball.setPosition(new Vec3(2, 2, 2))

    this.scene = [ this.boxMesh, this.roomMesh ];

    this.initMaterials();

    this.targets = [
      new Vec3(10, 0, 0),
      new Vec3(-10, 0, 0),
      new Vec3(0, 10, 0),
      new Vec3(0, -10, 0),
      new Vec3(0, 0, -10),
      new Vec3(0, 0, 10)
    ];

    this.lightCameras = [];

    var right = new PerspectiveCamera(90, 1/1, 0.1, 20);
    this.lightCameras.push(right);

    var left = new PerspectiveCamera(90, 1/1, 0.1, 20);
    this.lightCameras.push(left);

    var top = new PerspectiveCamera(90, 1/1, 0.1, 20);
    top.setUp(new Vec3(0, 0, 1));
    this.lightCameras.push(top);

    var bottom = new PerspectiveCamera(90, 1/1, 0.1, 20);
    bottom.setUp(new Vec3(0, 0, 1));
    this.lightCameras.push(bottom);

    var back = new PerspectiveCamera(90, 1/1, 0.1, 20);
    this.lightCameras.push(back);

    var front = new PerspectiveCamera(90, 1/1, 0.1, 20);
    this.lightCameras.push(front);

    this.lineBuilder = new LineBuilder();
    this.lineMesh = new Mesh(this.lineBuilder, new ShowColors(), { lines: true });
    this.lineBuilder.addLine(back.position, back.target);
    this.lineBuilder.addLine(front.position, front.target);
    this.lineBuilder.addLine(right.position, right.target);
    this.lineBuilder.addLine(left.position, left.target);
    this.lineBuilder.addLine(top.position, top.target);
    this.lineBuilder.addLine(bottom.position, bottom.target);
  },
  initMaterials: function() {
    this.depthBuffer = Texture2D.create(Math.floor(1024), Math.floor(512), { format: this.gl.DEPTH_COMPONENT, type: this.gl.UNSIGNED_SHORT });
    this.depthBuffer.bind();
    var gl = this.gl;
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
    this.showNormals = new ShowNormals();
    this.showDepth = new ShowDepth();
  },
  drawAlbedo: function(meshes, camera, lights) {
    glu.enableBlending(false);
    glu.clearColorAndDepth(Color.Black);
    glu.enableDepthReadAndWrite(true);
    meshes.forEach(function(m) {
      m.draw(camera);
    }.bind(this));
  },
  drawNormals: function(meshes, camera, lights) {
    glu.clearColorAndDepth(Color.Black);
    glu.enableDepthReadAndWrite(true);
    meshes.forEach(function(m) {
      var oldMaterial = m.getMaterial();
      m.setMaterial(this.showNormals);
      m.draw(camera);
      m.setMaterial(oldMaterial);
    }.bind(this));
  },
  drawDepth: function(meshes, camera, lights) {
    glu.clearColorAndDepth(Color.Black);
    glu.enableDepthReadAndWrite(true);
    this.showDepth.uniforms.near = camera.getNear();
    this.showDepth.uniforms.far = camera.getFar();
    meshes.forEach(function(m) {
      var oldMaterial = m.getMaterial();
      m.setMaterial(this.showDepth);
      m.draw(camera);
      m.setMaterial(oldMaterial);
    }.bind(this));
  },
  drawLight: function(meshes, camera, lights) {
    glu.clearColor(Color.Black);
    glu.enableDepthReadAndWrite(true);
    lights.forEach(function(m) {
      m.draw(camera);
    });
  },
  draw: function() {
    Time.verbose = true;

    //this.gl.getSupportedExtensions().forEach(function(e) {
    //  console.log(e, this.gl.getExtension(e));
    //}.bind(this));

    glu.clearColorAndDepth(Color.Red);
    glu.enableDepthReadAndWrite(true);

    this.lightMesh.position.x = 2 * Math.sin(Time.seconds * 1);
    this.lightMesh.position.y = 0;

    var meshes = this.scene;
    var camera = this.camera;
    var lights = [this.lightMesh];
    var W = 1024;
    var H = 512;

    var root = fx();
    var albedo = root.render({ drawFunc: function() { this.drawAlbedo(meshes, camera, lights); }.bind(this), depth: this.depthBuffer, width: W, height: H });
    var normals = root.render({ drawFunc: function() { this.drawNormals(meshes, camera, lights); }.bind(this), depth: true, width: W, height: H });
    var depth = root.render({ drawFunc: function() { this.drawDepth(meshes, camera); }.bind(this), depth: true, width: W, height: H });

    this.lineBuilder.reset();
    this.lineBuilder.vertices.dirty = true;
    var lightDepthMaps = this.lightCameras.map(function(lightCamera, cameraIndex) {
      lightCamera.position.setVec3(this.lightMesh.position)
      lightCamera.target.setVec3(this.lightMesh.position.dup().add(this.targets[cameraIndex]))
      lightCamera.updateMatrices();
      this.lineBuilder.addLine(lightCamera.position, lightCamera.target);
      return root.render({ drawFunc: function() { this.drawDepth(meshes, lightCamera); }.bind(this), depth: true, width: H, height: H, bpp: 32 });
    }.bind(this));

    var shadow1 = albedo.shadowMap({
      depthMap: this.depthBuffer, camera: camera, width: W, height: H,
      lightDepthMap: lightDepthMaps[0], lightCamera: this.lightCameras[0],
      normalMap: normals
    });

    var shadow2 = shadow1.shadowMap({
      depthMap: this.depthBuffer, camera: camera, width: W, height: H,
      lightDepthMap: lightDepthMaps[1], lightCamera: this.lightCameras[1],
      normalMap: normals
    });

    var shadow3 = shadow2.shadowMap({
      depthMap: this.depthBuffer, camera: camera, width: W, height: H,
      lightDepthMap: lightDepthMaps[2], lightCamera: this.lightCameras[2],
      normalMap: normals
    });

    var shadow4 = shadow3.shadowMap({
      depthMap: this.depthBuffer, camera: camera, width: W, height: H,
      lightDepthMap: lightDepthMaps[3], lightCamera: this.lightCameras[3],
      normalMap: normals
    });

    var shadow5 = shadow4.shadowMap({
      depthMap: this.depthBuffer, camera: camera, width: W, height: H,
      lightDepthMap: lightDepthMaps[4], lightCamera: this.lightCameras[4],
      normalMap: normals
    });

    var shadow6 = shadow5.shadowMap({
      depthMap: this.depthBuffer, camera: camera, width: W, height: H,
      lightDepthMap: lightDepthMaps[5], lightCamera: this.lightCameras[5],
      normalMap: normals
    });

    if (lightDepthMaps.length > 0) lightDepthMaps[0].blit();

    //albedo.blit();
    shadow6.blit();

    lightDepthMaps.forEach(function(depthMap, i) {
      depthMap.blit({ x: i * 52, y: 0, width: 50, height: 50 })
    });

    this.boxMesh.rotation = Quat.fromAxisAngle(new Vec3(0, 1, 0), Time.seconds * 50)
    this.box2Mesh.rotation = Quat.fromAxisAngle(new Vec3(0, 1, 0), -Time.seconds * 50)

    var light = root.render({ drawFunc: function() { this.drawLight(meshes, camera, lights); }.bind(this), depth: this.depthBuffer, width: W, height: H });
    //light.blit();

    var finalColor = shadow6.add(light);
    finalColor.blit({ width: this.width, height: this.height });

    //this.lineMesh.draw(this.camera);
  }
});