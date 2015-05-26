#ifdef VERT

uniform mat4 projectionMatrix;
uniform mat4 modelViewMatrix;
uniform mat4 modelWorldMatrix;
uniform mat4 viewMatrix;
uniform mat4 normalMatrix;

uniform float pointSize;
uniform vec3 lightPos;
uniform vec3 cameraPos;
attribute vec3 position;
attribute vec3 normal;
varying vec3 ecNormal;
varying vec3 ecLighPos;
varying vec3 ecPosition;

void main() {
  vec4 worldPos = modelWorldMatrix * vec4(position, 1.0);
  gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
  ecPosition = (modelViewMatrix * vec4(position, 1.0)).xyz;
  gl_PointSize = pointSize;
  ecNormal = (normalMatrix * vec4(normal, 0.0)).xyz;
  ecLighPos = (viewMatrix * vec4(lightPos, 1.0)).xyz;
}

#endif

#ifdef FRAG

#extension GL_ARB_shader_texture_lod : require

uniform mat4 invViewMatrix;

uniform vec4 color;

uniform samplerCube irradianceMap;
uniform samplerCube reflectionMap;

varying vec3 ecNormal;
varying vec3 ecLighPos;
varying vec3 ecPosition;

void environmentMap(samplerCube envMap, in vec3 normalIn, in vec3 positionIn, out vec4 colorOut, float mipmapIndex) {
  vec3 V = normalize(positionIn); //eye dir
  vec3 R = reflect(V, normalIn); //reflecte vector
  R = vec3 (invViewMatrix * vec4(R, 0.0));
  colorOut = textureCubeLod(envMap, R, mipmapIndex);
}

void main() {
  vec4 reflectionColor;
  float roughness = color.a;
  float mipmapIndex = 8.0 * roughness;
  environmentMap(irradianceMap, ecNormal, ecPosition, irradianceColor, 0.0);
}

#endif
