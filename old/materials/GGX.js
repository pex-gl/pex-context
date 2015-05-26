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

var GGXGLSL = fs.readFileSync(__dirname + '/GGX.glsl', 'utf8');

function GGX(uniforms) {
  this.gl = Context.currentContext;
  var program = new Program(GGXGLSL);
  var defaults = {
    wrap: 0,
    pointSize: 1,
    lightPos: Vec3.create(10, 20, 30),
    ambientColor: Color.create(0, 0, 0, 1),
    diffuseColor: Color.create(0.9, 0.9, 0.9, 1),
    specularColor: Color.create(1, 1, 1, 1),
    shininess: 256,
    roughness: 0.5,
    n0: 0.2,
    useGGX: true
  };
  uniforms = merge(defaults, uniforms);
  Material.call(this, program, uniforms);
}

GGX.prototype = Object.create(Material.prototype);

module.exports = GGX;
