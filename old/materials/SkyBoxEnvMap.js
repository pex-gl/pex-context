var glu = require('pex-glu');
var color = require('pex-color');
var Context = glu.Context;
var Material = glu.Material;
var Program = glu.Program;
var Color = color.Color;
var merge = require('merge');
var fs = require('fs');

var SkyBoxEnvMapGLSL = fs.readFileSync(__dirname + '/SkyBoxEnvMap.glsl', 'utf8');

function SkyBoxEnvMap(uniforms) {
  this.gl = Context.currentContext;
  var program = new Program(SkyBoxEnvMapGLSL);
  var defaults = {};
  uniforms = merge(defaults, uniforms);
  Material.call(this, program, uniforms);
}

SkyBoxEnvMap.prototype = Object.create(Material.prototype);

module.exports = SkyBoxEnvMap;
