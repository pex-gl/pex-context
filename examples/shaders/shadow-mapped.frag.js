const gamma = require('./gamma.glsl.js')

module.exports = /* glsl */ `
precision highp float;

uniform vec4 uAmbientColor;
uniform vec4 uDiffuseColor;
uniform vec3 uLightPos;
uniform float uWrap;
uniform float uLightNear;
uniform float uLightFar;
uniform sampler2D uDepthMap;
uniform mat4 uLightProjectionMatrix;
uniform mat4 uLightViewMatrix;

varying vec3 vNormal;
varying vec3 vWorldPosition;

${gamma}

//fron depth buf normalized z to linear (eye space) z
//http://stackoverflow.com/questions/6652253/getting-the-true-z-value-from-the-depth-buffer
float ndcDepthToEyeSpace(float ndcDepth) {
  return 2.0 * uLightNear * uLightFar / (uLightFar + uLightNear - ndcDepth * (uLightFar - uLightNear));
}

//fron depth buf normalized z to linear (eye space) z
//http://stackoverflow.com/questions/6652253/getting-the-true-z-value-from-the-depth-buffer
float readDepth(sampler2D depthMap, vec2 coord) {
  float z_b = texture2D(depthMap, coord).r;
  float z_n = 2.0 * z_b - 1.0;
  return ndcDepthToEyeSpace(z_n);
}

void main() {
  vec3 L = normalize(uLightPos);
  vec3 N = normalize(vNormal);
  float NdotL = max(0.0, (dot(N, L) + uWrap) / (1.0 + uWrap));
  vec3 ambient = toLinear(uAmbientColor.rgb);
  vec3 diffuse = toLinear(uDiffuseColor.rgb);

  vec4 lightViewPosition = uLightViewMatrix * vec4(vWorldPosition, 1.0);
  float lightDist1 = -lightViewPosition.z;
  vec4 lightDeviceCoordsPosition = uLightProjectionMatrix * lightViewPosition;
  vec2 lightDeviceCoordsPositionNormalized = lightDeviceCoordsPosition.xy / lightDeviceCoordsPosition.w;
  vec2 lightUV = lightDeviceCoordsPositionNormalized.xy * 0.5 + 0.5;
  float bias = 0.1;
  float lightDist2 = readDepth(uDepthMap, lightUV);

  gl_FragColor.rgb = ambient + NdotL * diffuse;

  if (lightDist1 < lightDist2 + bias)
    gl_FragColor = min(gl_FragColor,  gl_FragColor * vec4(1.0, 1.0, 1.0, 1.0));
  else
    gl_FragColor = min(gl_FragColor, gl_FragColor * vec4(0.05, 0.05, 0.05, 1.0));

  gl_FragColor.rgb = toGamma(gl_FragColor.rgb);

  gl_FragColor.a = 1.0;
  //gl_FragColor = vec4(lightDist1/5.0);
  //gl_FragColor = vec4(lightUV, 0.0, 1.0);
  //gl_FragColor = vec4(abs(lightDist1 - lightDist2));
  //gl_FragColor = vec4(abs(lightDist1 - lightDist2));
  //gl_FragColor = vec4((lightDist1 - lightNear)/(lightFar - lightNear));
  //gl_FragColor = vec4((lightDist2 - lightNear)/(lightFar - lightNear));
}
`
