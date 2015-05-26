var glu = require('pex-glu');
var color = require('pex-color');
var geom = require('pex-geom');
var Platform = require('pex-sys').Platform;
var Context = glu.Context;
var Material = glu.Material;
var Program = glu.Program;
var Color = color.Color;
var Vec3 = geom.Vec3;
var merge = require('merge');
var fs = require('fs');

var UberMaterialGLSL = fs.readFileSync(__dirname + '/UberMaterial.glsl', 'utf8');

function UberMaterial(uniforms) {
  this.gl = Context.currentContext;
  if (Platform.isBrowser) {
    this.lodExt = this.gl.getExtension('EXT_shader_texture_lod');
    if (this.lodExt) {
      UberMaterialGLSL = '#define WEBGL 1\n' + UberMaterialGLSL;
      UberMaterialGLSL = '#define textureCubeLod textureCubeLodEXT\n' + UberMaterialGLSL;
    }
  }
  var program = new Program(UberMaterialGLSL);
  var defaults = {
    correctGamma: true,
    showNormals: false,
    baseColor: Color.create(1, 1, 1, 1),
    baseColorMap: null,
    baseColorMapEnabled: false,

    roughness: 0.7,
    specular: 0.01,

    lightPos: new Vec3(5, 5, 5),
    cameraPos: new Vec3(0, 0, -1),

    reflectionMap: null,
    diffuseMap: null,

    skyBox: false

    //wrap: 0,
    //pointSize: 1,
    //lightPos: Vec3.create(10, 20, 30),
    //ambientColor: Color.create(0, 0, 0, 1),
    //diffuseColor: Color.create(0.9, 0.9, 0.9, 1),
    //specularColor: Color.create(1, 1, 1, 1),
    //shininess: 256,
    //useUberMaterial: true
  };
  uniforms = merge(defaults, uniforms);
  Material.call(this, program, uniforms);
}

UberMaterial.prototype = Object.create(Material.prototype);

UberMaterial.prototype.use = function() {
  this.uniforms.baseColorMapEnabled = (this.uniforms.baseColorMap != null);
  Material.prototype.use.call(this);
}

module.exports = UberMaterial;
