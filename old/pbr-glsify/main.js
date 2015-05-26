var glu           = require('pex-glu');
var Window        = require('pex-sys').Window;
var Platform      = require('pex-sys').Platform;
var Sphere        = require('pex-gen').Sphere;
var Box           = require('pex-gen').Box;
var Cube          = require('pex-gen').Cube;
var Mesh          = require('pex-glu').Mesh;
var PerspCamera   = require('pex-glu').PerspectiveCamera;
var Arcball       = require('pex-glu').Arcball;
var Material      = require('pex-glu').Material;
//var Program       = require('pex-glu').Program;
var Color         = require('pex-color').Color;
//var SolidColor    = require('./sh/SolidColor');
var LightingTest  = require('./sh/LightingTest');
var PBR           = require('./sh/PBR');
var Texture2D     = require('pex-glu').Texture2D;
var Vec3          = require('pex-geom').Vec3;
var loadDDS       = require('./glu/loadDDS');
var SkyBox        = require('./materials/SkyBox');
var Time          = require('pex-sys').Time;
var Textured      = require('pex-materials').Textured;
var SolidColor    = require('pex-materials').SolidColor;
var Context       = require('pex-glu').Context;
var GUI           = require('pex-gui').GUI;
var DPI = 2;

Texture2D.genSolidColor = function(color, w, h) {
  w = w || 32;
  h = h || 32;
  var gl = Context.currentContext;
  var handle = gl.createTexture();
  gl.activeTexture(gl.TEXTURE0);
  gl.bindTexture(gl.TEXTURE_2D, handle);
  var b = new ArrayBuffer(w * h * 4);
  var pixels = new Uint8Array(b);
  for (var y = 0; y < h; y++) {
    for (var x = 0; x < w; x++) {
      pixels[(y * w + x) * 4 + 0] = Math.floor(255 * color.r);
      pixels[(y * w + x) * 4 + 1] = Math.floor(255 * color.g);
      pixels[(y * w + x) * 4 + 2] = Math.floor(255 * color.b);
      pixels[(y * w + x) * 4 + 3] = Math.floor(255 * color.a);
    }
  }
  gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, w, h, 0, gl.RGBA, gl.UNSIGNED_BYTE, pixels);
  gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, true);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
  gl.bindTexture(gl.TEXTURE_2D, null);
  var texture = new Texture2D();
  texture.handle = handle;
  texture.width = w;
  texture.height = h;
  texture.target = gl.TEXTURE_2D;
  texture.gl = gl;
  return texture;
};

Window.create({
  settings: {
    width: 1.25 * 1024 * DPI,
    height: 1.25 * 768 * DPI,
    type: '3d',
    fullscreen: Platform.isBrowser,
    highdpi: DPI
  },
  roughness: 0.8,
  specularity: 0.05,
  init: function() {
    this.gui = new GUI(this);
    this.camera = new PerspCamera(60, this.width / this.height);
    this.arcball = new Arcball(this, this.camera);

    this.meshes = [];

    //var sphere = new Sphere(0.75);
    sphere = new Box();
    sphere = sphere.catmullClark();
    sphere = sphere.extrude(0.4);
    sphere = sphere.catmullClark().catmullClark();
    var sphereFlat = sphere.toFlatGeometry();
    sphere.computeNormals();
    sphereFlat.computeNormals();
    //sphere = sphereFlat;

    var albedoMaps = this.albedoMaps = [
      Texture2D.genSolidColor(Color.fromHSL(0.6, 0.5, 0.05)),
      Texture2D.genSolidColor(Color.fromHSL(0.0, 0.5, 0.15)),
      //Texture2D.genSolidColor(Color.fromHSL(0.56, 0.8, 0.35)),
      //Texture2D.load('assets/textures/wood_AlternatingSquareTiles_512_alb.png', { repeat: true }),
      //Texture2D.load('assets/textures/Misc_BlackLeather_512_alb.png', { repeat: true }),
      //Texture2D.load('assets/textures/tile_disgustingtilev2_512_alb.png', { repeat: true }),
      Texture2D.load('assets/textures/Metal_IronRusty_512_alb.png', { repeat: true }),
      //Texture2D.load('assets/textures/Misc_PaintedBarrel_512_alb3.png', { repeat: true }),
      Texture2D.genSolidColor(Color.fromHSL(0.56, 0.8, 0.35)),
      Texture2D.load('assets/textures/Metal_Gold_512_alb.png', { repeat: true }),
    ];

    var glossinessMaps = this.albedoMaps = [
      Texture2D.genSolidColor(new Color(0.55, 0.55, 0.55, 0.7)),
      Texture2D.genSolidColor(new Color(0.8, 0.8, 0.8, 0.7)),
      //Texture2D.genSolidColor(new Color(0.7, 0.7, 0.7, 0.7)),
      //Texture2D.load('assets/textures/wood_AlternatingSquareTiles_512_g.png', { repeat: true }),
      //Texture2D.load('assets/textures/Misc_BlackLeather_512_g.png', { repeat: true }),
      //Texture2D.load('assets/textures/tile_disgustingtilev2_512_g.png', { repeat: true }),
      Texture2D.load('assets/textures/Metal_IronRusty_512_g.png', { repeat: true }),
      Texture2D.load('assets/textures/Misc_PaintedBarrel_512_g.png', { repeat: true }),
      Texture2D.load('assets/textures/Metal_Gold_512_g.png', { repeat: true }),
    ];

    var specularityMaps = this.albedoMaps = [
      Texture2D.genSolidColor(new Color(0.15, 0.15, 0.15, 0.05)),
      Texture2D.genSolidColor(new Color(0.15, 0.15, 0.15, 0.05)),
      //Texture2D.genSolidColor(new Color(0.015, 0.015, 0.015, 0.05)),
      //Texture2D.load('assets/textures/Misc_BlackLeather_512_s.png', { repeat: true }),
      //Texture2D.load('assets/textures/wood_AlternatingSquareTiles_512_s.png', { repeat: true }),
      //Texture2D.load('assets/textures/tile_disgustingtilev2_512_s.png', { repeat: true }),
      Texture2D.load('assets/textures/Metal_IronRusty_512_s.png', { repeat: true }),
      Texture2D.load('assets/textures/Misc_PaintedBarrel_512_s.png', { repeat: true }),
      Texture2D.load('assets/textures/Metal_Gold_512_s.png', { repeat: true }),
    ];

    var irradianceMaps = [
      loadDDS(this.gl, 'assets/pmrem_dds/ForestIrradiance.dds'),
      loadDDS(this.gl, 'assets/pmrem_dds/GracieIrradiance.dds'),
      loadDDS(this.gl, 'assets/pmrem_dds/StPetersIrradiance.dds'),
      loadDDS(this.gl, 'assets/pmrem_dds/UffiziIrradiance.dds'),
    ];

    var reflectionMaps = [
      loadDDS(this.gl, 'assets/pmrem_dds/ForestReflection.dds'),
      loadDDS(this.gl, 'assets/pmrem_dds/GracieReflection.dds'),
      loadDDS(this.gl, 'assets/pmrem_dds/StPetersReflection.dds'),
      loadDDS(this.gl, 'assets/pmrem_dds/UffiziReflection.dds'),
    ];

    //this.gui.addParam('roughness', this, 'roughness');
    //this.gui.addParam('specularity', this, 'specularity');

    this.skyBoxMesh = new Mesh(new Cube(50), new SkyBox({ texture: albedoMaps[0], cubemapSize: 256 }));

    albedoMaps.forEach(function(albedoMap, j) {
      irradianceMaps.forEach(function(irradianceMap, i) {
         this.meshes.push(new Mesh(sphere, new PBR({
            albedoMap: albedoMaps[j],
            glossinessMap: glossinessMaps[j],
            specularityMap: specularityMaps[j],
            roughness: 0.607,
            specularity: 0.01385,
            irradianceMap: irradianceMaps[i],
            reflectionMap: reflectionMaps[i],
            lightColor: Color.White,
            lightPosition: new Vec3(10, 10, 10),
            exposure: 1,
            triplanarTextureScale: 1
          }), { triangles: true }));
      }.bind(this))
    }.bind(this))
  },
  draw: function() {
    glu.clearColorAndDepth(Color.Black);
    glu.enableDepthReadAndWrite(true);

    var cols = 4;
    var rows = 5;
    var index = 0;
    var dw = 1/cols * this.width;
    var dh = 1/rows * this.height;
    this.camera.setAspectRatio(dw/dh);

    for(var j=0; j<rows; j++) {
      for(var i=0; i<cols; i++) {
        glu.viewport(i * dw, this.height - dh - j * dh, dw, dh);
        var mesh = this.meshes[index++];
        if (mesh) {
          this.skyBoxMesh.material.uniforms.texture = mesh.material.uniforms.reflectionMap;
          this.skyBoxMesh.draw(this.camera);
          mesh.material.uniforms.roughness = this.roughness;
          mesh.material.uniforms.specularity = this.specularity;
          if (!mesh.material.uniforms.reflectionMap.ready || !mesh.material.uniforms.irradianceMap.ready) {
            continue;
          }
          mesh.draw(this.camera);
        }
      }
    }

    glu.viewport(0, 0, this.width, this.height);
    this.gui.draw();
  }
});