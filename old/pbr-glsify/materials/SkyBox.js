var glu = require('pex-glu');
var color = require('pex-color');
var Context = glu.Context;
var Material = glu.Material;
var Program = glu.Program;
var Color = color.Color;
var merge = require('merge');
var fs = require('fs');
var Platform = require('pex-sys').Platform;

var SkyBoxGLSL = fs.readFileSync(__dirname + '/SkyBox.glsl', 'utf8');

function SkyBox(uniforms) {
  this.gl = Context.currentContext;
  if (Platform.isBrowser) {
    this.lodExt = this.gl.getExtension('EXT_shader_texture_lod');
  }
  var program = new Program(SkyBoxGLSL);
  var defaults = {
    cubemapSize: 128
  };
  uniforms = merge(defaults, uniforms);
  Material.call(this, program, uniforms);
}

SkyBox.prototype = Object.create(Material.prototype);

module.exports = SkyBox;
