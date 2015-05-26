var glu = require('pex-glu');
var color = require('pex-color');
var Context = glu.Context;
var Material = glu.Material;
var Program = glu.Program;
var Color = color.Color;
var merge = require('merge');
var fs = require('fs');

var PointLightWithFogGLSL = fs.readFileSync(__dirname + '/PointLightWithFog.glsl', 'utf8');

function PointLightWithFog(uniforms) {
  this.gl = Context.currentContext;
  var program = new Program(PointLightWithFogGLSL);
  var defaults = {
    pointSize: 1
  };
  uniforms = merge(defaults, uniforms);
  Material.call(this, program, uniforms);
}

PointLightWithFog.prototype = Object.create(Material.prototype);

module.exports = PointLightWithFog;