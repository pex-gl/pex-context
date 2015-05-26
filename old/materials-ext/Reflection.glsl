varying vec3 vNormal;
varying vec3 R;
varying vec3 RR;

#ifdef VERT

uniform mat4 projectionMatrix;
uniform mat4 modelViewMatrix;
uniform mat4 normalMatrix;
uniform vec3 eyePos;
uniform float refraction;
attribute vec3 position;
attribute vec3 normal;

void main() {
  gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);

  vec3 I = normalize(position.xyz - eyePos.xyz);
  R = reflect(I, normal);
  RR = refract(I, normal, refraction);
  vNormal = (normalMatrix * vec4(normal, 1.0)).xyz;
}

#endif

#ifdef FRAG

uniform sampler2D diffuseTexture;
uniform sampler2D reflectionTexture;
uniform float reflection;

vec4 extractHDR(vec4 color) {
  return vec4((color.rgb * pow(2.0, color.a * 256.0 - 128.0)), 1.0);
}

void main() {
  //vec3 N = normalize(R);
  vec3 N = normalize(vNormal);
  //(1.0 - skyBox)*(1.0-glass)*
  vec2 diffuseTexCoord = vec2((1.0 + atan(-N.z, N.x)/3.14159265359)/2.0, acos(N.y)/3.14159265359);
  vec2 reflectionTexCoord = vec2((1.0 + atan(-R.z, R.x)/3.14159265359)/2.0, acos(R.y)/3.14159265359);
  vec4 diffuseColor = extractHDR(texture2D(diffuseTexture, diffuseTexCoord));
  vec4 reflectionColor = extractHDR(texture2D(reflectionTexture, reflectionTexCoord));
  vec4 textureColor = mix(diffuseColor, reflectionColor, reflection);
  gl_FragColor = textureColor;
  gl_FragColor.a = 1.0;
}

#endif