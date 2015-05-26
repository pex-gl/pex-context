var sys = require('pex-sys');
var glu = require('pex-glu');
var materials = require('pex-materials');
var color = require('pex-color');
var gen = require('pex-gen');
var geom = require('pex-geom');
var fx = require('pex-fx');
var gui = require('pex-gui');
var random = require('pex-random');

var Box                 = gen.Box;
var Sphere              = gen.Sphere;
var Dodecahedron        = gen.Dodecahedron;
var Tetrahedron         = gen.Tetrahedron;
var Mesh                = glu.Mesh;
var PerspectiveCamera   = glu.PerspectiveCamera;
var Arcball             = glu.Arcball;
var ShowNormals         = materials.ShowNormals;
var SolidColor          = materials.SolidColor;
var ShowDepth           = materials.ShowDepth;
var ShowPosition        = materials.ShowPosition;
var Color               = color.Color;
var Platform            = sys.Platform;
var Time                = sys.Time;
var Vec3                = geom.Vec3;
var Quat                = geom.Quat;
var GUI                 = gui.GUI;
var DeferredPointLight  = require('./materials/DeferredPointLight');
var Contrast            = require('./fx/Contrast');

var UP = new Vec3(0, 1, 0);

var degToRad = 1/180.0 * Math.PI;

function evalPos(theta, phi) {
  var pos = new Vec3();
  pos.x = Math.sin(theta * degToRad) * Math.sin(phi * degToRad);
  pos.y = Math.cos(theta * degToRad);
  pos.z = Math.sin(theta * degToRad) * Math.cos(phi * degToRad);
  return pos;
}

sys.Window.create({
  settings: {
    width: 1280,
    height: 720,
    type: '3d',
    fullscreen: true,
    highdpi: 1
  },
  animate: true,
  exposure: 1,
  contrast: 1,
  ssaoStrength: 0.4,
  correctGamma: true,
  ssao: false,
  tonemapReinhard: true,
  roughness: 0.3,
  lightRadius: 0.95,
  numLights: Platform.isMobile ? 20 : 100,
  wrap: 0,
  init: function() {
    if (Platform.isBrowser) {
      console.log('OES_texture_float', this.gl.getExtension("OES_texture_float"));
      console.log('OES_texture_float_linear', this.gl.getExtension("OES_texture_float_linear"));
      console.log('OES_texture_half_float', this.gl.getExtension("OES_texture_half_float"));
      console.log('OES_texture_half_float_linear', this.gl.getExtension("OES_texture_half_float_linear"));
      //console.log('EXT_shader_texture_lod', this.gl.getExtension("EXT_shader_texture_lod"));
      //console.log('OES_standard_derivatives', this.gl.getExtension("OES_standard_derivatives"));
    }
    this.gui = new GUI(this);
    this.gui.addParam('Animate', this, 'animate');
    this.gui.addParam('Wrap light', this, 'wrap');
    this.gui.addParam('SSAO', this, 'ssao');
    this.gui.addParam('SSAO Strength', this, 'ssaoStrength', { min: 0.0, max: 10 });
    this.gui.addParam('Roughness', this, 'roughness', { min: 0.01, max: 1 });
    this.gui.addParam('Tonemap Reinhard', this, 'tonemapReinhard');
    this.gui.addParam('Exposure', this, 'exposure', { min: 0.5, max: 3 });
    this.gui.addParam('Correct Gamma', this, 'correctGamma');
    this.gui.addParam('Contrast', this, 'contrast', { min: 0.5, max: 3 });

    this.scene = [];

    random.seed(0);

    var star = new Box().catmullClark().extrude(1).catmullClark().extrude().catmullClark();
    star.computeNormals();
    this.starMesh = new Mesh(star, null);
    this.scene.push(this.starMesh);

    var sphere = new Tetrahedron(0.6).dooSabin().triangulate().catmullClark();
    sphere.computeNormals();
    this.spheres = [];
    for(var i=0; i<50; i++) {
      var m = new Mesh(sphere, null);
      m.radius = random.float(2, 6);
      m.theta = random.float(0, 180);
      m.phi = random.float(0, 360);
      m.rotation = Quat.fromDirection(random.vec3().normalize());
      this.scene.push(m);
      this.spheres.push(m);
    }

    this.camera = new PerspectiveCamera(60, 2/1, 1, 10);
    this.arcball = new Arcball(this, this.camera, 5);

    this.lightPos = new Vec3(3, 3, 3);
    this.lightBrightness = 5;
    this.solidColor = new SolidColor();


    this.lights = [];
    for(var i=0; i<this.numLights; i++) {
      this.lights.push({
        position: new Vec3(0, 0, 0),
        scale: new Vec3(1, 1, 1),
        t: 0,
        dt: random.float(0, 1),
        k1: random.float(0, 5),
        k2: random.float(0, 5),
        r: random.float(1, 3),
        uniforms: {
          color: Color.fromHSL(random.float(0.6, 0.79), 0.8, 0.25)
        }
      });
      var l = this.lights[this.lights.length-1];
      l.uniforms.color = Color.fromHSL(random.float(0.6, 0.79), 0.8, 0.25)
    }

    this.lightMesh = new Mesh(new Sphere(0.05), new SolidColor());

    this.deferredPointLight = new DeferredPointLight();
    this.lightProxyMesh = new Mesh(new Sphere(this.lightRadius, 64, 64), this.deferredPointLight);
  },
  drawColor: function() {
    if (!this.solidColor) {
      this.solidColor = new SolidColor({ color: Color.White });
    }
    this.drawScene(this.solidColor);
  },
  drawNormals: function() {
    if (!this.showNormals) {
      this.showNormals = new ShowNormals({ color: Color.Red });
    }
    this.drawScene(this.showNormals);
  },
  drawDepth: function() {
    var gl = this.gl;
    gl.clearColor(1,1,1,1);
    gl.clear(gl.COLOR_BUFFER_BIT);
    if (!this.showDepth) {
      this.showDepth = new ShowDepth();
    }
    this.showDepth.uniforms.near = this.camera.getNear();
    this.showDepth.uniforms.far = this.camera.getFar();
    this.drawScene(this.showDepth);
  },
  drawScene: function(material) {
    this.scene.forEach(function(m) {
      m.setMaterial(material);
      m.draw(this.camera);
    }.bind(this));
  },
  drawDeferredLights: function() {
    glu.clearColorAndDepth(new Color(0.01, 0.01, 0.01, 1.0));
    glu.enableDepthReadAndWrite(false, false);
    glu.enableAdditiveBlending(true);

    var gl = this.gl;

    gl.colorMask(0, 0, 0, 0);
    glu.enableDepthReadAndWrite(true);
    gl.depthFunc(gl.LEQUAL);
    this.drawScene(this.solidColor); //just depth
    gl.colorMask(1, 1, 1, 1);
    gl.enable(gl.DEPTH_TEST);
    gl.enable(gl.CULL_FACE);

    gl.cullFace(gl.FRONT); gl.depthFunc(gl.GREATER);

    for(var i=0; i<this.lights.length; i++) {
      this.lights[i].uniforms.lightPos = this.lights[i].position;
      this.lights[i].uniforms.lightColor = this.lights[i].uniforms.color;
    }
    glu.enableDepthReadAndWrite(true, false);
    this.lightProxyMesh.drawInstances(this.camera, this.lights);
    glu.enableBlending(false);
    gl.depthFunc(gl.LEQUAL);
    gl.disable(gl.CULL_FACE);
    gl.cullFace(gl.BACK);
  },
  update: function() {
    if (!this.time) {
      this.time = 0;
    }
    if (this.animate) {
      this.time += Time.delta;
    }
    this.lights.forEach(function(light) {
      light.position.x = light.r * Math.sin(this.time + light.k1)
      light.position.y = light.r * Math.cos(this.time + light.k2)
      light.position.z = light.r * Math.sin(this.time + 0.5 * light.k2) + Math.sin(this.time + light.k1)
    }.bind(this));

    this.lightPos = this.lights[0].position;
    this.lightPos = new Vec3(0, 0, 1);

    this.starMesh.rotation.setAxisAngle(UP, this.time * 20);
    this.spheres.forEach(function(sphere) {
      sphere.position = evalPos(sphere.theta, sphere.phi - this.time * 20).scale(sphere.radius);
    }.bind(this))
  },
  draw: function() {
    Time.verbose = true;
    this.update();

    glu.clearColorAndDepth(Color.Black);
    glu.enableDepthReadAndWrite(true);
    glu.cullFace(true);

    var W = Platform.isMobile ? 2048 : 1024;
    var H = Platform.isMobile ? 1024 : 512;
    var BPP = 32;

    var root = fx();
    var color = root.render({ drawFunc: this.drawColor.bind(this), depth: true, width: W, height: H, bpp: BPP });
    var normals = root.render({ drawFunc: this.drawNormals.bind(this), depth: true, width: W, height: H, bpp: BPP });
    var depth = root.render({ drawFunc: this.drawDepth.bind(this), depth: true, width: W, height: H, bpp: 32 });
    var ssao = color;
    if (this.ssao) ssao = depth.ssao({ strength: this.ssaoStrength, depthMap: depth, width: W, height: H, bpp: BPP, camera: this.camera });
    this.deferredPointLight.uniforms.wrap = this.wrap;
    this.deferredPointLight.uniforms.correctGamma = this.correctGamma ? 1 : 0;
    this.deferredPointLight.uniforms.albedoMap = color.getSourceTexture();
    this.deferredPointLight.uniforms.normalMap = normals.getSourceTexture();
    this.deferredPointLight.uniforms.depthMap = depth.getSourceTexture();
    this.deferredPointLight.uniforms.occlusionMap = ssao.getSourceTexture();
    this.deferredPointLight.uniforms.roughness = this.roughness;
    this.deferredPointLight.uniforms.fov = this.camera.getFov();
    this.deferredPointLight.uniforms.near = this.camera.getNear();
    this.deferredPointLight.uniforms.far = this.camera.getFar();
    this.deferredPointLight.uniforms.aspectRatio = this.camera.getAspectRatio();
    this.deferredPointLight.uniforms.lightPos = new Vec3(0, 0, 0);
    this.deferredPointLight.uniforms.lightBrightness = this.lightBrightness;
    this.deferredPointLight.uniforms.lightColor = Color.White;
    this.deferredPointLight.uniforms.lightRadius = this.lightRadius;
    var lights = root.render({ drawFunc: this.drawDeferredLights.bind(this), depth: true, width: W, height: H, bpp: BPP });
    var finalColor = lights;

    if (this.tonemapReinhard) finalColor = finalColor.tonemapReinhard({ width: W, height: H, bpp: BPP, exposure: this.exposure });
    if (this.correctGamma) finalColor = finalColor.correctGamma({ width: W, height: H, bpp: BPP });
    finalColor = finalColor.contrast({ width: W, height: H, bpp: BPP, contrast: this.contrast });

    var scale = Math.max(this.width / W, this.height / H);
    finalColor.blit({ x : (this.width - W * scale)/2, y: (this.height - H * scale)/2, width : W * scale, height: H * scale});

    glu.viewport((this.width - W * scale)/2, (this.height - H * scale)/2, W * scale, H * scale);

    this.gl.colorMask(0, 0, 0, 0);
    glu.enableDepthReadAndWrite(true);
    this.drawScene(this.solidColor); //just depth
    this.gl.colorMask(1, 1, 1, 1);

    this.lights[0].scale.set(1, 1, 1)
    this.lightMesh.drawInstances(this.camera, this.lights);

    //ssao.blit({ x : (this.width - W * scale)/2, y: (this.height - H * scale)/2, width : W * scale, height: H * scale});

    //glu.clearColorAndDepth(Color.Red);

    glu.viewport(0, 0, this.width, this.height);
    //this.gui.draw();

    this.gl.writeImage('png', 'image.png');
  }
});
