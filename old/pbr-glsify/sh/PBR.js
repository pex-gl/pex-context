var glu = require('pex-glu');
var color = require('pex-color');
var Context = glu.Context;
var Material = glu.Material;
var Color = color.Color;
var merge = require('merge');
var fs = require('fs');
var glslify       = require('glslify-pex');
var Program = require('../glu/Program');
var Vec3 = require('pex-geom').Vec3;
var Platform = require('pex-sys').Platform;

function PBR(uniforms) {
  this.gl = Context.currentContext;
  if (Platform.isBrowser) {
    this.lodExt = this.gl.getExtension('EXT_shader_texture_lod');
  }
  var program = new Program(
    glslify(__dirname + '/PBR.vert'),
    glslify(__dirname + '/PBR.frag')
  );
  var defaults = {
    exposure: 1,
    lightColor: Color.White,
    lightPos: new Vec3(10, 10, 10),
    albedoColor: Color.White,
    roughness: 0.91,
    specularity: 0.05,
    triplanarTextureScale: 1
  };
  uniforms = merge(defaults, uniforms);
  Material.call(this, program, uniforms);
}

PBR.prototype = Object.create(Material.prototype);

module.exports = PBR;