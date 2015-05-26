var sys = require('pex-sys');
var glu = require('pex-glu');
var materials = require('pex-materials');
var color = require('pex-color');
var gen = require('pex-gen');
var random = require('pex-random');
var geom = require('pex-geom');
var gui = require('pex-gui');
var R = require('ramda');
var remap = require('re-map');

var Cube = gen.Cube;
var Mesh = glu.Mesh;
var ShowNormals = materials.ShowNormals;
var SolidColor = materials.SolidColor;
var PerspectiveCamera = glu.PerspectiveCamera;
var Arcball = glu.Arcball;
var Color = color.Color;
var Platform = sys.Platform;
var PingPongFbo = require('./glu/PingPongFbo');
var Geometry = geom.Geometry; 
var Mesh = glu.Mesh;
var Material = glu.Material;
var ScreenImage = glu.ScreenImage;
var Program = glu.Program;
var Texture2D = glu.Texture2D;
var GUI = gui.GUI;
var Vec2 = geom.Vec2;
var Vec3 = geom.Vec3;
var Time = sys.Time;
var Platform = sys.Platform;

function updateTexture(gl, tex, data) {
  var pixels = new Float32Array(data.length);
  var type = gl.FLOAT;

  for(var i=0; i<data.length; i++) {
     pixels[i] = data[i];
  }

  if (Platform.isMobile) {
    var textureHalfFloatExt = gl.getExtension('OES_texture_half_float');
    type = textureHalfFloatExt.HALF_FLOAT_OES;
    pixels = new Uint16Array(data.length);
    for(var i=0; i<data.length; i++) {
     pixels[i] = data[i];
    }
  }

  tex.bind();
  gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, tex.width, tex.height, 0, gl.RGBA, type, pixels);
  //gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, true);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
  gl.bindTexture(gl.TEXTURE_2D, null);
}

function vec3toArray(v) {
    return [v.x, v.y, v.z, 0];
}

sys.Window.create({
  settings: {
    width: 1024,
    height: 512,
    type: '3d',
    fullscreen: sys.Platform.isBrowser
  },
  debug: false,
  init: function() {
    Time.verbose = true;
    if (sys.Platform.isBrowser) {

    }

    this.gui = new GUI(this);
    var cube = new Cube();
    this.mesh = new Mesh(cube, new ShowNormals());

    this.camera = new PerspectiveCamera(60, this.width / this.height);
    this.arcball = new Arcball(this, this.camera);
    this.arcball.setTarget(new Vec3(-1, 0, 0))
    this.arcball.setPosition(new Vec3(-1, 2, 2))

    var W = this.W = 1024;
    var H = this.H = 1024;

    console.log('Num particles', W * H);

    this.positionFbo = new PingPongFbo(W, H, { bpp: 32 });
    this.velocityFbo = new PingPongFbo(W, H, { bpp: 32 });
    this.screenImage1 = new ScreenImage(null, 0, 0, W, H, W, H);
    this.screenImage2 = new ScreenImage(null, 0, 0, W, H, W, H);

    //0 1 2 3 4 5 6 7 8 9 10 11
    //0 1 2 0 1 2 0 1 2 0  1  2
    //0 0 0 1 1 1 2 2 2 2  0  1
    //0 0 0 0 0 0 0 0 0 0  1  1

    console.time('init');
    var numParticles = W * H;
    var particlesVertices = new Array(numParticles);
    var particlesTexCoords = new Array(numParticles);
    var delays = new Array(numParticles*4);
    var colors = new Array(numParticles*4);
    var side = Math.floor(Math.pow(numParticles, 1/3));
    var x = 0;
    var y = 0;
    var z = 0;
    for(var i=0; i<numParticles; i++) {
      particlesVertices[i] = {
        x: 2*(x/side - 0.5),
        y: y/side - 0.5,
        z: 2*(z/side - 0.5)
      };
      colors[i*4+0] = x/side;
      colors[i*4+1] = y/side;
      colors[i*4+2] = z/side;
      colors[i*4+3] = 1.0;
      z++;
      if (z >= side) {
        z = 0;
        y++;
      }
      if (y >= side) {
        y = 0;
        x++;
      }
      delays[i*4+0] = (-particlesVertices[i].x + 0.5)*10;
      delays[i*4+1] = (-particlesVertices[i].x + 0.5)*10;
      delays[i*4+2] = (-particlesVertices[i].x + 0.5)*10;
      delays[i*4+3] = (-particlesVertices[i].x + 0.5)*10;

      particlesTexCoords[i] = {
        x: (i % W)/W,
        y: Math.floor(i / W)/H
      };
    }

      //return new Vec3((i % W)/W - 0.5, 2*(Math.floor(i / W)/H - 0.5), random.float(-1.53,1.53));
    //}.bind(this));
    console.timeEnd('init');
    var pariclesGeom = new Geometry({ vertices: particlesVertices, texCoords: particlesTexCoords });
    this.particlesMesh = new Mesh(pariclesGeom, new Material(Program.load('assets/ImageParticleGPURenderer.glsl')), { points: true });
    //this.particlesMesh = new Mesh(pariclesGeom, new SolidColor());

    this.colorTexture = Texture2D.create(W, H, { bpp: 32 });
    updateTexture(this.gl, this.colorTexture, colors);
    this.delayTexture = Texture2D.create(W, H, { bpp: 32 });
    updateTexture(this.gl, this.delayTexture, delays);

    this.gui.addTexture2D('Position', this.positionFbo.curr.getColorAttachment());
    this.gui.addTexture2D('Position Prev', this.positionFbo.prev.getColorAttachment());
    this.gui.addTexture2D('Velocity', this.velocityFbo.curr.getColorAttachment()).setPosition(180, 10);;
    this.gui.addTexture2D('Velocity Prev', this.velocityFbo.prev.getColorAttachment());
    this.gui.addTexture2D('Color', this.colorTexture).setPosition(350, 10);
    this.gui.addTexture2D('Delay', this.delayTexture);

    var positions = R.flatten(particlesVertices.map(vec3toArray));
    var zeros = R.repeatN(0.1, positions.length);

    updateTexture(this.gl, this.positionFbo.curr.getColorAttachment(), zeros);
    updateTexture(this.gl, this.positionFbo.prev.getColorAttachment(), positions);
    updateTexture(this.gl, this.velocityFbo.curr.getColorAttachment(), zeros);
    updateTexture(this.gl, this.velocityFbo.prev.getColorAttachment(), zeros);

    setInterval(function() {
        updateTexture(this.gl, this.positionFbo.curr.getColorAttachment(), zeros);
        updateTexture(this.gl, this.positionFbo.prev.getColorAttachment(), positions);
        updateTexture(this.gl, this.velocityFbo.curr.getColorAttachment(), zeros);
        updateTexture(this.gl, this.velocityFbo.prev.getColorAttachment(), zeros);
    }.bind(this), 100 * 1000)

    this.velocityUpdater = Program.load('assets/ImageParticleGPUVelocityUpdater.glsl');
    this.positionUpdater = Program.load('assets/ImageParticleGPUPositionUpdater.glsl');

    this.bgColor = Color.fromHSL(0.45, 0.9, 0.45);
  },
  draw: function() {
    glu.clearColorAndDepth(this.bgColor);
    glu.enableDepthReadAndWrite(true);
    glu.enableBlending(false);
    //this.mesh.draw(this.camera);

    glu.viewport(0, 0, this.W, this.H);

    glu.enableDepthReadAndWrite(false, false);

    if (!this.velocityUpdater.ready || !this.positionUpdater.ready) return;

    /**/
    this.velocityFbo.curr.bind();
    this.velocityFbo.prev.getColorAttachment(0).bind(0);
    this.positionFbo.prev.getColorAttachment(0).bind(1);
    this.delayTexture.bind(2);
    this.velocityUpdater.use();
    this.velocityUpdater.uniforms.prevVelocityTex(0);
    this.velocityUpdater.uniforms.prevPositionTex(1);
    this.velocityUpdater.uniforms.delayTex(2);
    this.velocityUpdater.uniforms.timeDelta(Time.delta);
    this.velocityUpdater.uniforms.noiseScale(3);
    //ci::gl::drawSolidRect(this.velocityFbo.curr.getBounds());
    this.screenImage1.draw(null, this.velocityUpdater);
    //this.velocityUpdater.unbind();
    this.velocityFbo.curr.unbind();
    /**/

    //UPDATE POSITIONS

    this.positionFbo.curr.bind();
    this.positionFbo.prev.getColorAttachment(0).bind(0);
    this.velocityFbo.curr.getColorAttachment(0).bind(1);
    this.positionUpdater.use();
    this.positionUpdater.uniforms.prevPositionTex(0);
    this.positionUpdater.uniforms.velocityTex(1);
    this.positionUpdater.uniforms.timeDelta(Time.delta);
    this.positionUpdater.uniforms.velocityScale(0.2);
    //ci::gl::drawSolidRect(this.positionFbo.curr.getBounds());
    //this.positionUpdater.unbind();
    this.screenImage2.draw(null, this.positionUpdater);
    //glu.clearColorAndDepth(Color.Black);
    this.positionFbo.curr.unbind();

    glu.viewport(0, 0, this.width, this.height);

    //PARTICLES

    //FIXME: this should be simple shader bind not a materials
    this.positionFbo.curr.getColorAttachment(0).bind(0);
    this.particlesMesh.material.uniforms.posTexture = this.positionFbo.curr.getColorAttachment(0);
    this.particlesMesh.material.uniforms.colorTexture = this.colorTexture;
    this.particlesMesh.material.uniforms.velocityTexture = this.velocityFbo.curr.getColorAttachment(0);
    this.particlesMesh.material.uniforms.delayTexture = this.delayTexture;

    glu.enableDepthReadAndWrite(true, true);

    this.particlesMesh.draw(this.camera);

    this.positionFbo.swap();
    this.velocityFbo.swap();

    if (this.debug) this.gui.draw();
  }
});
