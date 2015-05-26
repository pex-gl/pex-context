var glu = require('pex-glu');
var color = require('pex-color');
var geom = require('pex-geom');
var Context = glu.Context;
var Material = glu.Material;
var Program = glu.Program;
var Color = color.Color;
var merge = require('merge');
var fs = require('fs');
var Vec3 = geom.Vec3;

var DeferredPointLightGLSL = fs.readFileSync(__dirname + '/DeferredPointLight.glsl', 'utf8');

function DeferredPointLight(uniforms) {
  this.gl = Context.currentContext;
  var program = new Program(DeferredPointLightGLSL);
  var defaults = {
    albedoMap: null,
    normalMap: null,
    depthMap: null,
    occlusionMap: null,
    roughness: null,
    camera: null,
    lightPos: new Vec3(0, 0, 0),
    lightBrightness: 1,
    lightColor: Color.White,
    lightRadius: 1
  };
  uniforms = merge(defaults, uniforms);
  Material.call(this, program, uniforms);
}

DeferredPointLight.prototype = Object.create(Material.prototype);

module.exports = DeferredPointLight;
