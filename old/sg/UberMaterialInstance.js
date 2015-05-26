var merge = require('merge');
var fs = require('fs');
var glu = require('pex-glu');
var geom = require('pex-geom');
var color = require('pex-color');
var sg = require('../sg/');
var Material = glu.Material;
var Program = glu.Program;
var Vec3 = geom.Vec3;
var Color = color.Color;

var PositionVert = fs.readFileSync(__dirname + '/../sg/shaders/Position.vert', 'utf8');
var PositionFrag = fs.readFileSync(__dirname + '/../sg/shaders/Position.frag', 'utf8');
var NormalVert = fs.readFileSync(__dirname + '/../sg/shaders/Normal.vert', 'utf8');
var NormalFrag = fs.readFileSync(__dirname + '/../sg/shaders/Normal.frag', 'utf8');
var SkinnedInstanceVert = fs.readFileSync(__dirname + '/../sg/shaders/SkinnedInstance.vert', 'utf8');
var SkinnedFrag = fs.readFileSync(__dirname + '/../sg/shaders/Skinned.frag', 'utf8');
var SolidColorFrag = fs.readFileSync(__dirname + '/../sg/shaders/SolidColor.frag', 'utf8');
var TintColorFrag = fs.readFileSync(__dirname + '/../sg/shaders/TintColor.frag', 'utf8');
var ShowNormalsFrag = fs.readFileSync(__dirname + '/../sg/shaders/ShowNormals.frag', 'utf8');
var ShowDepthFrag = fs.readFileSync(__dirname + '/../sg/shaders/ShowDepth.frag', 'utf8');
var MatCapFrag = fs.readFileSync(__dirname + '/../sg/shaders/MatCap.frag', 'utf8');
var TexturedTriPlanarFrag = fs.readFileSync(__dirname + '/../sg/shaders/TexturedTriPlanar.frag', 'utf8');
var CubeMapFrag = fs.readFileSync(__dirname + '/../sg/shaders/CubeMap.frag', 'utf8');
var EnvMapFrag = fs.readFileSync(__dirname + '/../sg/shaders/EnvMap.frag', 'utf8');
var EnvMapWithRoughnessFrag = fs.readFileSync(__dirname + '/../sg/shaders/EnvMapWithRoughness.frag', 'utf8');
var CorrectGammaFrag = fs.readFileSync(__dirname + '/../sg/shaders/CorrectGamma.frag', 'utf8');
var GammaFrag = fs.readFileSync(__dirname + '/../sg/shaders/Gamma.frag', 'utf8');
var GGXFrag = fs.readFileSync(__dirname + '/../sg/shaders/GGX.frag', 'utf8');
var LightVert = fs.readFileSync(__dirname + '/../sg/shaders/Light.vert', 'utf8');
var LambertFrag = fs.readFileSync(__dirname + '/../sg/shaders/Lambert.frag', 'utf8');
var LambertWrappedFrag = fs.readFileSync(__dirname + '/../sg/shaders/LambertWrapped.frag', 'utf8');
var OutputVert = fs.readFileSync(__dirname + '/../sg/shaders/Output.vert', 'utf8');
var OutputInstanceVert = fs.readFileSync(__dirname + '/../sg/shaders/OutputInstance.vert', 'utf8');
var OutputFrag = fs.readFileSync(__dirname + '/../sg/shaders/Output.frag', 'utf8');
var SetAlphaFromRoughnessFrag = fs.readFileSync(__dirname + '/../sg/shaders/SetAlphaFromRoughness.frag', 'utf8');

function UberMaterial(uniforms) {
  var defaultOptions = {
    skinned: false,
    solidColor: true,
    correctGamma: false,
    roughness: 0.2,
    fakeLights: false,
    color: new Color(1,1,1,1),
    tintColor: new Color(1,1,1,1),
    matCapTexture: null,
    triPlanarTexture: null,
    cubeMap: null,
    envMap: null,
    envMapReflection: null,
    envMapDiffuse: null,
    showNormals: false,
    showDepth: false
  }
  uniforms = merge(defaultOptions, uniforms);

  var graph = sg.graph();

  if (uniforms.skinned) {
    graph.material(SkinnedInstanceVert, SkinnedFrag);
  }
  else {
    graph.material(PositionVert, PositionFrag);
    graph.material(NormalVert, NormalFrag);
  }

  if (uniforms.color) {
    graph.snippet(SolidColorFrag);
  }

  if (uniforms.matCapTexture) {
    graph.snippet(MatCapFrag);
  }

  if (uniforms.triPlanarTexture) {
    graph.snippet(TexturedTriPlanarFrag);
  }

  if (uniforms.cubeMap) {
    graph.snippet(CubeMapFrag);
  }

  if (uniforms.envMap) {
    graph.snippet(EnvMapFrag);
  }

  if (uniforms.envMapReflection && uniforms.envMapDiffuse) {
    graph.snippet(EnvMapWithRoughnessFrag);
  }

  if (uniforms.tintColor) {
    graph.snippet(TintColorFrag);
  }

  if (uniforms.roughness) {
    graph.snippet(SetAlphaFromRoughnessFrag);
  }

  if (uniforms.fakeLights) {
    uniforms.lightPos = new Vec3(-5, 5, 5);
    uniforms.n0 = 0.1;
    uniforms.wrap = 1.0;
    uniforms.specularColor = new Color(0.25, 0.25, 0.25, 0.25);
    graph.material(LightVert, LambertWrappedFrag);
    graph.material(LightVert, GGXFrag);
  }

  if (uniforms.showNormals) {
    graph.snippet(ShowNormalsFrag);
  }

  if (uniforms.showDepth) {
    graph.snippet(ShowDepthFrag);
  }

  if (uniforms.correctGamma) {
    graph.snippet(CorrectGammaFrag);
  }

  graph.material(OutputInstanceVert, OutputFrag);

  var program = graph.compile();

  Material.call(this, new Program(program.vertexShader, program.fragmentShader), uniforms);
}

UberMaterial.prototype = Object.create(Material.prototype);


module.exports = UberMaterial;