#ifdef VERT

uniform mat4 projectionMatrix;
uniform mat4 modelViewMatrix;
uniform mat4 modelWorldMatrix;
uniform mat4 normalMatrix;
uniform float pointSize;
attribute vec3 position;
attribute vec3 normal;
attribute vec2 texCoord;
attribute vec2 texCenter;
varying vec3 vNormal;
varying vec3 vWorldPosition;
varying vec2 vTexCoord;
varying vec2 vTexCenter;

void main() {
  vec2 coord = texCoord;
  gl_Position = vec4((coord - 0.5)*2.0, 0.0, 1.0);
  vWorldPosition = (modelWorldMatrix * vec4(position, 1.0)).xyz;
  vNormal = (gl_NormalMatrix * vec4(normal, 1.0).xyz).xyz;
  vTexCoord = texCoord;
  vTexCenter = texCenter;
}

#endif

#ifdef FRAG

uniform vec4 ambientColor;
uniform vec4 diffuseColor;
uniform vec3 lightPos;
uniform vec4 lightColor;
uniform float wrap;
uniform float lightNear;
uniform float lightFar;
uniform sampler2D depthMap;
uniform sampler2D texture;

varying vec3 vNormal;
varying vec3 vWorldPosition;
uniform mat4 lightProjectionMatrix;
uniform mat4 lightViewMatrix;

varying vec2 vTexCoord;

void main() {
  vec3 L = normalize(lightPos);
  vec3 N = normalize(vNormal);
  float NdotL = max(0.0, (dot(N, L) + wrap) / (1.0 + wrap));
  gl_FragColor = ambientColor + NdotL * diffuseColor;
  //gl_FragColor.rgb = N;
  //return;

  vec4 lightViewPosition = lightViewMatrix * vec4(vWorldPosition, 1.0);
  float lightDist1 = -lightViewPosition.z;
  vec4 lightDeviceCoordsPosition = lightProjectionMatrix * lightViewPosition;
  vec2 lightDeviceCoordsPositionNormalized = lightDeviceCoordsPosition.xy / lightDeviceCoordsPosition.w;
  vec2 lightUV = lightDeviceCoordsPositionNormalized.xy * 0.5 + 0.5;
  float lightDist2Normalized = texture2D(depthMap, lightUV).r;
  float bias = 0.02;
  float lightDist2 = lightNear + lightDist2Normalized * (lightFar - lightNear) + bias;

  if (lightDist1 < lightDist2 + bias)
    gl_FragColor = lightColor;
  else
    gl_FragColor = vec4(0.0, 0.0, 0.0, 1.0);

  //gl_FragColor.rgb = pow(gl_FragColor.rgb*0.01, vec3(1.0/2.2));
  //gl_FragColor = vec4(lightDist1/5.0, 0.0, 0.0, 1.0);

  //gl_FragColor = vec4(texture2D(depthMap, lightUV));
  //gl_FragColor = vec4(lightDist2/5.0);

  //gl_FragColor.rg = vTexCoord;
  //gl_FragColor.ba = vec2(0.0, 1.0);
}

#endif
