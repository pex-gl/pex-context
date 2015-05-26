#pragma glslify: lambert = require(glsl-diffuse-lambert)

float getLightDiffuse(inout FragData data) {
  return lambert(data.normalView, data.lightDirView);
}

#pragma glslify: export(getLightDiffuse)