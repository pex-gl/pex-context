var sys = require('pex-sys');
var fx = require('pex-fx');
var glu = require('pex-glu');
var geom = require('pex-geom');
var color = require('pex-color');
var materials = require('pex-materials');
var merge = require('merge');

var Vec3                = geom.Vec3;
var BoundingBox         = geom.BoundingBox;
var Platform            = sys.Platform;
var Context             = glu.Context;
var Texture2D           = glu.Texture2D;
var PerspectiveCamera   = glu.PerspectiveCamera;
var Color               = color.Color;

var DeferredPointLight  = require('./materials/DeferredPointLight');
var DeferredGlobalLight = require('./materials/DeferredGlobalLight');
var DeferredDirectionalLight = require('./materials/DeferredDirectionalLight');
var UberMaterial        = require('../materials/UberMaterial');
var UberMaterialInstance        = require('../materials/UberMaterialInstance');
var SSAO                = require('../fx/SSAO');
var Fog                 = require('../fx/Fog');
var FogBox              = require('../fx/FogBox');
var Contrast            = require('../fx/Contrast');
var ShadowMap           = require('../fx/ShadowMap');
var Rect                = require('../geom/Rect');
var PointLight          = require('./PointLight');
var GlobalLight         = require('./GlobalLight');
var DirectionalLight    = require('./DirectionalLight');
var CameraHelper        = require('../helpers/CameraHelper');

function Renderer(width, height, options) {
  var gl = this.gl = Context.currentContext;

  this.initExtensions();

  this.width = width;
  this.height = height;

  var defaultOptions = {
    exposure: 1.5,
    contrast: 1
  };

  options = merge(defaultOptions, options);

  this.exposure = options.exposure;
  this.contrast = options.contrast;
  this.debug = false;
  this.ssao = 1;
  this.fogColor = new Color(1,1,1,1);
  this.fogDensity = 3.2;
  this.fogStart = 0.05;
  this.fogEnd = 0.7;
  this.fogBoundingBox = BoundingBox.fromPositionSize(new Vec3(0, 0, 0), new Vec3(500, 500, 500));

  this.enableLights = true;
  this.enableShadows = true;
  this.enableFog = true;
  this.enableToneMapping = true;
  this.enableGamma = true;
  this.enableContrast = false;
  this.enableFXAA = false;
  this.enableSSAO = false;

  //this.lightCamera = new PerspectiveCamera(45, 1/1, 5, 300);
  //this.lightCamera.setPosition(new Vec3(0, 100, 100));
  //this.lightCamera.setTarget(new Vec3(0, -10, -20));
  this.lightCamera = new PerspectiveCamera(45, 1/1, 10, 100);
  this.lightCamera.setPosition(new Vec3(0, 40, 40));
  this.lightCamera.setTarget(new Vec3(0, 0, 0));
  this.shadowMapBias = 0.0012;

  this.initMaterials();
}

Renderer.prototype.getScene = function() {
  return this.scene;
}

Renderer.prototype.initExtensions = function() {
  if (Platform.isBrowser) {
    console.log('OES_texture_float', this.gl.getExtension("OES_texture_float"));
    console.log('OES_texture_float_linear', this.gl.getExtension("OES_texture_float_linear"));
    console.log('OES_texture_half_float', this.gl.getExtension("OES_texture_half_float"));
    console.log('OES_texture_half_float_linear', this.gl.getExtension("OES_texture_half_float_linear"));
    console.log('WEBGL_depth_texture', this.gl.getExtension("WEBGL_depth_texture"));
    //console.log('EXT_shader_texture_lod', this.gl.getExtension("EXT_shader_texture_lod"));
    //console.log('OES_standard_derivatives', this.gl.getExtension("OES_standard_derivatives"));
  }
}

Renderer.prototype.initMaterials = function() {
  this.depthBuffer = Texture2D.create(this.width, this.height, { format: this.gl.DEPTH_COMPONENT, type: this.gl.UNSIGNED_SHORT });
  this.showNormals = new UberMaterial({ skinned: false, showNormals: true });
  this.skinnedShowNormals = new UberMaterial({ skinned: true, showNormals: true });
  this.skinnedShowNormalsInstance = new UberMaterialInstance({ skinned: true, showNormals: true });
  this.showDepth = new UberMaterial({ skinned: false, showDepth: true });
  this.skinnedShowDepth = new UberMaterial({ skinned: true, showDepth: true });
  this.skinnedShowDepthInstance = new UberMaterial({ skinned: true, showDepth: true });
  this.deferredPointLight = new DeferredPointLight();
  this.deferredGlobalLight = new DeferredGlobalLight();
  this.deferredDirectionalLight = new DeferredDirectionalLight();
}

Renderer.prototype.drawAlbedo = function(meshes, camera, lights) {
  glu.enableBlending(false);
  glu.clearColorAndDepth(Color.Black);
  glu.enableDepthReadAndWrite(true);
  meshes.forEach(function(m) {
    m.instances ? m.drawInstances(camera, m.instances) : m.draw(camera);
  }.bind(this));
}

Renderer.prototype.drawNormals = function(meshes, camera, lights) {
  glu.clearColorAndDepth(Color.Black);
  glu.enableDepthReadAndWrite(true);
  meshes.forEach(function(m) {
    var oldMaterial = m.getMaterial();
    if (oldMaterial.uniforms.skinned) {
      for (var i in oldMaterial.uniforms) {
        this.skinnedShowNormals.uniforms[i] =  oldMaterial.uniforms[i];
        this.skinnedShowNormalsInstance.uniforms[i] =  oldMaterial.uniforms[i];
      }
      if (m.instances) {
        m.setMaterial(this.skinnedShowNormalsInstance);
      }
      else {
        m.setMaterial(this.skinnedShowNormals);
      }
    }
    else {
      m.setMaterial(this.showNormals);
    }
    m.instances ? m.drawInstances(camera, m.instances) : m.draw(camera);
    m.setMaterial(oldMaterial);
  }.bind(this));
}

Renderer.prototype.drawDepth = function(meshes, camera, lights) {
  glu.clearColorAndDepth(Color.Black);
  glu.enableDepthReadAndWrite(true);
  this.showDepth.uniforms.near = camera.getNear();
  this.showDepth.uniforms.far = camera.getFar();
  this.skinnedShowDepth.uniforms.near = camera.getNear();
  this.skinnedShowDepth.uniforms.far = camera.getFar();
  this.skinnedShowDepthInstance.uniforms.near = camera.getNear();
  this.skinnedShowDepthInstance.uniforms.far = camera.getFar();
  meshes.forEach(function(m) {
    var oldMaterial = m.getMaterial();
    if (oldMaterial.uniforms.skinned) {
      for (var i in oldMaterial.uniforms) {
        this.skinnedShowDepth.uniforms[i] =  oldMaterial.uniforms[i];
      }
      if (m.instances) {
        m.setMaterial(this.skinnedShowDepthInstance);
      }
      else {
        m.setMaterial(this.skinnedShowDepth);
      }
    }
    else {
      m.setMaterial(this.showDepth);
    }
    m.instances ? m.drawInstances(camera, m.instances) : m.draw(camera);
    m.setMaterial(oldMaterial);
  }.bind(this));
}

Renderer.prototype.drawPointLights = function(meshes, camera, lights, albedo, normals, depth) {
  var roughness = 0.7;

  this.deferredPointLight.uniforms.albedoMap = albedo.getSourceTexture();
  this.deferredPointLight.uniforms.normalMap = normals.getSourceTexture();
  this.deferredPointLight.uniforms.depthMap = depth.getSourceTexture ? depth.getSourceTexture() : depth;
  //this.deferredPointLight.uniforms.occlusionMap = ssao.getSourceTexture(); //TEMP: disabled ssao
  this.deferredPointLight.uniforms.roughness = roughness;
  this.deferredPointLight.uniforms.fov = camera.getFov();
  this.deferredPointLight.uniforms.near = camera.getNear();
  this.deferredPointLight.uniforms.far = camera.getFar();
  this.deferredPointLight.uniforms.aspectRatio = camera.getAspectRatio();

  this.deferredGlobalLight.uniforms.albedoMap = albedo.getSourceTexture();
  this.deferredGlobalLight.uniforms.normalMap = normals.getSourceTexture();
  this.deferredGlobalLight.uniforms.depthMap = depth.getSourceTexture ? depth.getSourceTexture() : depth;
  //this.deferredGlobalLight.uniforms.occlusionMap = ssao.getSourceTexture(); //TEMP: disabled ssao
  this.deferredGlobalLight.uniforms.roughness = roughness;
  this.deferredGlobalLight.uniforms.fov = camera.getFov();
  this.deferredGlobalLight.uniforms.near = camera.getNear();
  this.deferredGlobalLight.uniforms.far = camera.getFar();
  this.deferredGlobalLight.uniforms.aspectRatio = camera.getAspectRatio();

  this.deferredDirectionalLight.uniforms.albedoMap = albedo.getSourceTexture();
  this.deferredDirectionalLight.uniforms.normalMap = normals.getSourceTexture();
  this.deferredDirectionalLight.uniforms.depthMap = depth.getSourceTexture ? depth.getSourceTexture() : depth;
  this.deferredDirectionalLight.uniforms.occlusionMap = albedo.getSourceTexture(); //TEMP: disabled ssao
  this.deferredDirectionalLight.uniforms.roughness = roughness;
  this.deferredDirectionalLight.uniforms.fov = camera.getFov();
  this.deferredDirectionalLight.uniforms.near = camera.getNear();
  this.deferredDirectionalLight.uniforms.far = camera.getFar();
  this.deferredDirectionalLight.uniforms.aspectRatio = camera.getAspectRatio();

  var gl = this.gl;

  glu.clearColorAndDepth(Color.Black);

  gl.disable(gl.CULL_FACE);
  gl.colorMask(0, 0, 0, 0);
  glu.enableDepthReadAndWrite(true, true);
  gl.depthFunc(gl.LEQUAL);
  this.drawAlbedo(meshes, camera, lights); //just depth
  gl.colorMask(1, 1, 1, 1);

  glu.enableDepthReadAndWrite(true, false);
  glu.enableAdditiveBlending(true);

  lights.forEach(function(light) {
    var oldMaterial = light.getMaterial();
    if (light instanceof PointLight) {
      gl.cullFace(gl.FRONT);
      gl.enable(gl.CULL_FACE);
      gl.depthFunc(gl.GREATER);
      this.deferredPointLight.uniforms.lightBrightness = light.brightness;
      this.deferredPointLight.uniforms.lightColor = light.color;
      this.deferredPointLight.uniforms.lightRadius = light.radius;
      this.deferredPointLight.uniforms.lightPos = light.position;
      light.proxyMesh.setMaterial(this.deferredPointLight);
    }
    if (light instanceof GlobalLight) {
      gl.cullFace(gl.BACK);
      gl.enable(gl.CULL_FACE);
      gl.depthFunc(gl.ALWAYS);
      this.deferredGlobalLight.uniforms.intensity = light.intensity;
      this.deferredGlobalLight.uniforms.reflectionMap = light.reflectionMap;
      this.deferredGlobalLight.uniforms.diffuseMap = light.diffuseMap;
      this.deferredGlobalLight.uniforms.lightColor = light.color;
      light.proxyMesh.setMaterial(this.deferredGlobalLight);
    }
    if (light instanceof DirectionalLight) {
      gl.cullFace(gl.BACK);
      gl.enable(gl.CULL_FACE);
      gl.depthFunc(gl.ALWAYS);
      this.deferredDirectionalLight.uniforms.intensity = light.intensity;
      this.deferredDirectionalLight.uniforms.reflectionMap = light.reflectionMap;
      this.deferredDirectionalLight.uniforms.diffuseMap = light.diffuseMap;
      this.deferredDirectionalLight.uniforms.lightColor = light.color;
      light.proxyMesh.setMaterial(this.deferredGlobalLight);
    }
    light.proxyMesh.draw(camera);
    light.proxyMesh.setMaterial(oldMaterial);
  }.bind(this));

  glu.enableBlending(false);
  glu.enableDepthReadAndWrite(true, true);
  gl.disable(gl.CULL_FACE);
  gl.depthFunc(gl.LEQUAL);
  gl.cullFace(gl.BACK);
}

Renderer.prototype.drawDebug = function(meshes, camera, lights) {
  if (!this.lightCameraHelper) {
    this.lightCameraHelper = new CameraHelper(this.lightCamera);
  }

  glu.clearColor(Color.Black);
  glu.enableDepthReadAndWrite();
  this.gl.lineWidth(2);
  if (this.debug) {
    this.lightCameraHelper.draw(camera);
    lights.forEach(function(light) {
      light.draw(camera);
      if (light.gizmoMesh) light.gizmoMesh.draw(camera);
    });
  }
  this.gl.lineWidth(1);
}

Renderer.prototype.resize = function(width, height) {
  this.width = width;
  this.height = height;

  this.depthBuffer.dispose();
  this.depthBuffer = Texture2D.create(this.width, this.height, { format: this.gl.DEPTH_COMPONENT, type: this.gl.UNSIGNED_SHORT });

  //fx().resourceMgr.cache.forEach(function(res) {
  //  if (res.dispose) res.dispose();
  //})
  //fx().resourceMgr.cache.length = 1;
}

Renderer.prototype.draw = function(scene, windowWidth, windowHeight) {
  var gl = Context.currentContext;
  //init

  var meshes = scene.getMeshes();
  var lights = scene.getLights();
  var cameras = scene.getCameras();

  var camera = cameras[0];
  if (!camera) {
    console.log('pbr.Renderer.draw no camera found!');
    return;
  }

  var measure = false;

  //camera.setPosition(this.lightCamera.getPosition());
  //camera.setTarget(this.lightCamera.getTarget());
  //camera.setUp(new Vec3(0, 1, 0))

  //pepare

  glu.viewport(0, 0, this.width, this.height);

  // render

  var W = this.width;
  var H = this.height;

  if (measure) gl.finish();

  var finalColor;;

  if (measure) console.time('render');

  var root = fx();
  var albedo = root.render({ drawFunc: function() { this.drawAlbedo(meshes, camera, lights); }.bind(this), depth: this.depthBuffer, width: W, height: H, bpp: 32 });
  var normals = root.render({ drawFunc: function() { this.drawNormals(meshes, camera, lights); }.bind(this), depth: this.depthBuffer, width: W, height: H, bpp: 32 });
  var depth = this.depthBuffer;
  var lightDepthMap = root.render({ drawFunc: function() { this.drawDepth(meshes, this.lightCamera); }.bind(this), depth: true, width: H, height: H, bpp: 32 });
  finalColor = albedo;

  //lights
  if (this.enableLights) finalColor = root.render({ drawFunc: function() { this.drawPointLights(meshes, camera, lights, albedo, normals, depth); }.bind(this), depth: true, width: W, height: H, bpp: 32 });

  //shadows
  if (this.enableShadows) finalColor = finalColor.shadowMap({
    depthMap: depth, camera: camera, width: W, height: H, bpp: 32,
    lightDepthMap: lightDepthMap, lightCamera: this.lightCamera,
    bias: this.shadowMapBias,
    normalMap: normals
  });

  if (this.enableSSAO) {
    var ssaoScale = 1.0;
    ssao = root.ssao({ strength: this.ssao, depthMap: depth, camera: camera, width: W/ssaoScale, height: H/ssaoScale });//.blur3();
    finalColor = finalColor.mult(ssao);
  }

  //fog
  if (this.enableFog) finalColor = finalColor.fogBox({ depthMap: depth, camera: camera, width: W, height: H, bpp: 32,
    color: this.fogColor || Color.Black,
    fogDensity: this.fogDensity,
    fogStart: this.fogStart,
    fogEnd: this.fogEnd,
    fogBoundingBox: this.fogBoundingBox
  })

  if (this.enableToneMapping) finalColor = finalColor.tonemapReinhard({ width: W, height: H, bpp: 32, exposure: this.exposure });
  if (this.enableGamma) finalColor = finalColor.correctGamma({ width: W, height: H, bpp: 32 });
  if (this.enableContrast) finalColor = finalColor.contrast({ width: W, height: H, bpp: 32, contrast: this.contrast });
  if (this.enableFXAA) finalColor = finalColor.fxaa();

  glu.viewport(0, 0, windowWidth, windowHeight);

  var rtViewport = new Rect(0, 0, this.width, this.height);
  var windowViewport = new Rect(0, 0, windowWidth, windowHeight);

  var drawViewport = rtViewport.scaleToFill(windowViewport);
  //var drawViewport = rtViewport.scaleToFit(windowViewport);

  // debug

  var debugMeshes = root.render({ drawFunc: function() { this.drawDebug(meshes, camera, lights); }.bind(this), depth: this.depthBuffer, width: W, height: H });
  finalColor = finalColor.add(debugMeshes);
  //finalColor = debugMeshes;

  //finalColor = normals;
  //finalColor = ssao;

  //finalColor = albedo;
  //finalColor = normals;

  // blit

  //glu.clearColorAndDepth(Color.Red);
  //glu.viewport(drawViewport.x, drawViewport.y, drawViewport.width, drawViewport.height);
  glu.viewport(0, 0, windowWidth, windowHeight);
  finalColor.blit({ x: drawViewport.x, y: drawViewport.y, width: drawViewport.width, height: drawViewport.height });

  if (measure) gl.finish();
  if (measure) console.timeEnd('render');

}

module.exports = Renderer;