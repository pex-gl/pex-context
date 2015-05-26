#ifdef VERT
uniform mat4 projectionMatrix;
uniform mat4 modelViewMatrix;
uniform mat4 normalMatrix;
uniform vec3 eyePos;
uniform float refraction;
uniform float far;
uniform float near;
attribute vec3 position;
attribute vec3 normal;
attribute vec2 texCoord;
varying vec3 vNormal;
varying vec3 R;
varying vec3 RR;
varying float vDepth;
varying vec2 vTexCoord;
void main() {
  gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
  vec3 N = normal; //(normalMatrix * vec4(normal, 1.0)).xyz
  vec3 I = normalize(position.xyz - eyePos.xyz);
  R = reflect(I, normal);
  RR = refract(I, normal, refraction);
  vNormal = N;
  vDepth = (-(modelViewMatrix * vec4(position, 1.0)).z-near)/(far - near);
  vDepth = clamp(vDepth, 0.0, 1.0);
  vTexCoord = texCoord;
}

#endif

#ifdef FRAG
//uniform samplerCube texture
uniform sampler2D texture;
uniform sampler2D texture2;
uniform float reflection;
uniform float selected;
uniform vec4 color;
varying vec3 R;
varying vec3 RR;
varying vec3 vNormal;
varying float vDepth;
varying vec2 vTexCoord;
uniform float revealStart;
uniform float revealEnd;

vec4 sample(sampler2D tex, vec3 n) {
  return texture2D(tex, vec2((1.0 + atan(n.z, n.x)/3.14159265359)/2.0, acos(-n.y)/3.14159265359));
}

void main() {
  if (vTexCoord.y > revealStart) discard;
  if (vTexCoord.y < revealEnd) discard;

  //gl_FragColor = 1.2 * color;
  //gl_FragColor += 0.4 * sample(texture2, vNormal);
  //gl_FragColor += 0.4 * sample(texture, vNormal);
  //gl_FragColor.a = 1.0;
  //gl_FragColor += 0.2 * vec4(vDepth);

  //gl_FragColor = 0.8 * color;
  vec3 L = normalize(vec3(10.0, 10.0, 10.0));
  float NdotL = dot(vNormal, L);
  vec4 diffuse =  color * vec4((NdotL*0.5 + 0.75)/1.5);

  gl_FragColor = diffuse;// + color;

  gl_FragColor += 0.4 * sample(texture2, vNormal);
  gl_FragColor += 0.1 * sample(texture, R);
  //gl_FragColor += 0.1 * vec4(vDepth);
  gl_FragColor.a = color.a;
}
#endif