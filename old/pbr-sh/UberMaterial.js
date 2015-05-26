var Material = require('pex-glu').Material;
var Program  = require('pex-glu').Program;
var merge    = require('merge');
var Color    = require('pex-color').Color;
var lib      = require('./shaderlib');

function UberMaterial(uniforms) {
  var defaults = {
    albedoColor: Color.create(0, 0, 0, 1)
  };

  uniforms = merge(defaults, uniforms);

  var vertSrc = '';
  vertSrc += lib.baseVert;
  vertSrc += lib.transform;
  vertSrc += lib.startVert;

  vertSrc += lib.endVert;
  //console.log(vertSrc);

  var hasTexture2D = uniforms.albedoMap || uniforms.glossMap || uniforms.specularMap; //TODO: has texture

  var fragSrc = '';
  fragSrc += lib.baseFrag;
  fragSrc += lib.correctGammaInput;
  fragSrc += lib.correctGammaOutput;
  fragSrc += lib.tonemapReinhard;
  fragSrc += uniforms.fixSeams ? lib.fixSeams : lib.fixSeamsNone;
  fragSrc += lib.noise3;

  if (uniforms.lightPos) {
    fragSrc += lib.lambert;
    fragSrc += lib.phong;
    fragSrc += lib.lightDiffuseLambert;
    fragSrc += lib.lightSpecularPhong;
    fragSrc += lib.fresnelSchlick;
  }

  if (hasTexture2D) {
    if (uniforms.genTexCoordTriPlanar) {
      fragSrc += lib.sampleTexture2DTriPlanar;
    }
    else {
      fragSrc += lib.sampleTexture2D;
    }
  }

  if (false) {
    fragSrc += lib.albedoGen;
  }
  else if (uniforms.albedoColor && !uniforms.albedoMap) {
    fragSrc += lib.albedoConst;
  }
  else if (uniforms.albedoMap) {
    fragSrc += lib.albedoTex;
  }

  if (false) {
    fragSrc += lib.roughnessGen;
  }
  else if (typeof(uniforms.roughness) != 'undefined' && !uniforms.glossMap) {
    fragSrc += lib.roughnessConst;
  }
  else if (uniforms.glossMap) {
    fragSrc += lib.roughnessTex;
  }

  if (uniforms.irradianceMap) {
    fragSrc += lib.irradianceCubeMap;
  }

  if (uniforms.reflectionMap) {
    fragSrc += lib.reflectionCubeMap;
  }

  if (false) {
    fragSrc += lib.specularGen;
  }
  else if (uniforms.specularity && !uniforms.specularMap) {
    fragSrc += lib.specularConst;
  }
  else if (uniforms.specularMap) {
    fragSrc += lib.specularTex;
  }

  fragSrc += lib.startFrag;

  if (uniforms.albedoColor || uniforms.albedoMap) {
    fragSrc += '  getAlbedo(data);\n';
  }

  if (typeof(uniforms.roughness) != 'undefined' || uniforms.glossMap) {
    fragSrc += '  getRoughness(data);\n';
  }

  if (typeof(uniforms.specularity) != 'undefined' || uniforms.specularMap) {
    fragSrc += '  getSpecularity(data);\n';
  }

  if (uniforms.lightPos) {
    if (uniforms.useFresnel) {
      fragSrc += '  getFresnel(data);\n';
    }
    fragSrc += '  data.lightAtten *= getLightDiffuse(data);\n';
    fragSrc += '  vec3 lightDiffuse = vec3(0.0);\n';
    if (uniforms.useDiffuse) fragSrc += '  lightDiffuse = data.lightAtten * data.albedo * lightColor.rgb;\n';
    fragSrc += '  data.lightAtten *= getLightSpecular(data);\n';
    fragSrc += '  vec3 lightSpecular = vec3(0.0);\n';
    if (uniforms.useSpecular) fragSrc += '  lightSpecular = data.lightAtten * lightColor.rgb;\n';
    //mixing diffuse and specular according to specularity for energy conservation
    fragSrc += '  data.color = mix(lightDiffuse, lightSpecular, data.specularity);\n';
    if (uniforms.irradianceMap) {
      fragSrc += '  getIrradiance(data);\n';
      fragSrc += '  data.color += data.albedo * data.irradianceColor * (1.0 - data.specularity);\n'
    }
    if (uniforms.reflectionMap) {
      fragSrc += '  getReflection(data);\n';
      fragSrc += '  data.color += data.reflectionColor;\n';
    }
    if (uniforms.reflectionMap || uniforms.irradianceMap) { //ibl is in hdr so tonemapping
      fragSrc += '  data.color = tonemapReinhard(data.color, data.exposure);\n';
    }
  }
  else {
    fragSrc += '  data.color = data.albedo;\n'
  }
  fragSrc += lib.endFrag;

  //console.log(fragSrc);

  var program = new Program(vertSrc, fragSrc);

  Material.call(this, program, uniforms);
}

UberMaterial.prototype = Object.create(Material.prototype);

module.exports = UberMaterial;