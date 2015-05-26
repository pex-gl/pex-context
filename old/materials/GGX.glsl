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
varying vec3 vNormal;
varying vec3 vLightPos;
varying vec3 vEyePos;

void main() {
  vec4 worldPos = modelWorldMatrix * vec4(position, 1.0);
  vec4 eyePos = modelViewMatrix * vec4(position, 1.0);
  gl_Position = projectionMatrix * eyePos;
  vEyePos = eyePos.xyz;
  gl_PointSize = pointSize;
  vNormal = (normalMatrix * vec4(normal, 0.0)).xyz;
  vLightPos = (viewMatrix * vec4(lightPos, 1.0)).xyz;
}

#endif

#ifdef FRAG

uniform vec4 ambientColor;
uniform vec4 diffuseColor;
uniform vec4 specularColor;
uniform float shininess;
uniform float wrap;
uniform bool useBlinnPhong;
uniform float roughness;
uniform float n0;
varying vec3 vNormal;
varying vec3 vLightPos;
varying vec3 vEyePos;

float G1V(float dotNV, float k) {
  return 1.0/(dotNV*(1.0-k)+k);
}

float LightingFuncGGX_REF(vec3 N, vec3 V, vec3 L, float roughness, float F0) {
  float alpha = roughness*roughness;

  vec3 H = normalize(V+L);

  float dotNL = clamp(dot(N,L), 0.0, 1.0);
  float dotNV = clamp(dot(N,V), 0.0, 1.0);
  float dotNH = clamp(dot(N,H), 0.0, 1.0);
  float dotLH = clamp(dot(L,H), 0.0, 1.0);

  float F, D, vis;

  // D
  float alphaSqr = alpha*alpha;
  float pi = 3.14159;
  float denom = dotNH * dotNH *(alphaSqr-1.0) + 1.0;
  D = alphaSqr/(pi * denom * denom);

  // F
  float dotLH5 = pow(1.0-dotLH, 5.0);
  F = F0 + (1.0-F0)*(dotLH5);

  // V
  float k = alpha/2.0;
  vis = G1V(dotNL,k)*G1V(dotNV,k);

  float specular = dotNL * D * F * vis;
  return specular;
}

float phong(vec3 L, vec3 E, vec3 N) {
  vec3 R = reflect(-L, N);
  return dot(R, E);
}

float blinnPhong(vec3 L, vec3 E, vec3 N) {
  vec3 halfVec = normalize(L + E);
  return dot(halfVec, N);
}

void main() {
  vec3 L = normalize(vLightPos - vEyePos); //lightDir
  vec3 E = normalize(-vEyePos); //viewDir
  vec3 N = normalize(vNormal); //normal

  float NdotL = max(0.0, (dot(N, L) + wrap) / (1.0 + wrap));
  vec4 color = ambientColor + NdotL * diffuseColor;

  float specular = 0.0;
  if (useBlinnPhong)
    specular = blinnPhong(L, E, N);
  else
    specular = phong(L, E, N);

  specular = LightingFuncGGX_REF(N, E, L, roughness, n0);

  color += specular * specularColor;

  //color = color / (1.0 + color);

  //color = pow(color, vec4(1.0/2.2));

  gl_FragColor = color;
}

#endif
