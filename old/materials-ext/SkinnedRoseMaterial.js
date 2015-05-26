var glu = require('pex-glu');
var color = require('pex-color');
var Context = glu.Context;
var Material = glu.Material;
var Program = glu.Program;
var Color = color.Color;
var merge = require('merge');
var fs = require('fs');

var SkinnedRoseMaterialGLSL = fs.readFileSync(__dirname + '/SkinnedRoseMaterial.glsl', 'utf8');

function SkinnedRoseMaterial(uniforms) {
  this.gl = Context.currentContext;
  var program = new Program(SkinnedRoseMaterialGLSL);
  var defaults = {
    color: Color.create(1, 1, 1, 1),
    pointSize: 1,
    premultiplied: 0,
    shininess: 128,
    wrap: 0,
    useBlinnPhong: false,
    usePhong: false,
    useDiffuse: false,
    useTexture: false
  };
  uniforms = merge(defaults, uniforms);
  Material.call(this, program, uniforms);
}

SkinnedRoseMaterial.prototype = Object.create(Material.prototype);

module.exports = SkinnedRoseMaterial;