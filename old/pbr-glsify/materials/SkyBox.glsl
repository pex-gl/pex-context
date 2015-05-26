#ifdef VERT

uniform mat4 projectionMatrix;
uniform mat4 modelViewMatrix;
attribute vec3 position;
attribute vec3 normal;
varying vec3 vNormal;

void main() {
  gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
  vNormal = position * vec3(1.0, 1.0, 1.0);
}

#endif

#ifdef FRAG

uniform samplerCube texture;
varying vec3 vNormal;

#define LOD_ENABLED

#ifdef LOD_ENABLED
#ifdef GL_ES
  #extension GL_EXT_shader_texture_lod : require
  #define textureCubeLod textureCubeLodEXT
#else
  #extension GL_ARB_shader_texture_lod : require
#endif
#endif

uniform float cubemapSize;

vec3 fixSeams(vec3 vec, float mipmapIndex) {
    float scale = 1.0 - exp2(mipmapIndex) / cubemapSize;
    float M = max(max(abs(vec.x), abs(vec.y)), abs(vec.z));
    if (abs(vec.x) != M) vec.x *= scale;
    if (abs(vec.y) != M) vec.y *= scale;
    if (abs(vec.z) != M) vec.z *= scale;
    return vec;
}

void main() {
  vec3 N = normalize(vNormal);
  float lod = 0.0;
  float exposure = 2.0;
  gl_FragColor = textureCubeLod(texture, fixSeams(N, lod), lod);
  gl_FragColor.rgb *= exposure;
  gl_FragColor.rgb = gl_FragColor.rgb / (1.0 + gl_FragColor.rgb); //Tonemap Reinhard
}

#endif
