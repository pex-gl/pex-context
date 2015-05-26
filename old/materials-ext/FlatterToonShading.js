var glu = require('pex-glu');
var color = require('pex-color');
var geom = require('pex-geom');
var Context = glu.Context;
var Material = glu.Material;
var Program = glu.Program;
var Color = color.Color;
var Vec3 = geom.Vec3;
var merge = require('merge');
var fs = require('fs');

var FlatterToonShadingGLSL = fs.readFileSync(__dirname + '/FlatterToonShading.glsl', 'utf8');

function FlatterToonShading(uniforms) {
  this.gl = Context.currentContext.gl;
  var program = new Program(FlatterToonShadingGLSL);

  var defaults = {
    lightPos : Vec3.create(10, 20, 30),
    shred: 0.04
  };

  uniforms = merge(defaults, uniforms);

  Material.call(this, program, uniforms);
}

FlatterToonShading.prototype = Object.create(Material.prototype);

module.exports = FlatterToonShading;