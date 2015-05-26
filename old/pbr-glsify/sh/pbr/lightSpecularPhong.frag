#pragma glslify: phong = require(glsl-specular-phong)

float getLightSpecular(inout FragData data) {
  float glossiness = 1.0 - data.roughness;
  float specPower = pow(2.0, glossiness * 11.0);

  return phong(data.lightDirView, data.eyeDirView, data.normalView, specPower);
}

#pragma glslify: export(getLightSpecular)