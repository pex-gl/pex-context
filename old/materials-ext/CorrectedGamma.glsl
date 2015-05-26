#ifdef VERT

uniform mat4 projectionMatrix;
uniform mat4 modelViewMatrix;
uniform mat4 modelWorldMatrix;
uniform mat4 viewMatrix;
uniform mat4 normalMatrix;
uniform float pointSize;
uniform vec3 lightPos;
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

float PI = 3.141592653589793;

uniform vec4 ambientColor;
uniform vec4 diffuseColor;
uniform vec4 specularColor;
uniform float shininess;
uniform float wrap;
uniform bool correctGamma;
uniform bool useBlinnPhong;
uniform bool conserveDiffuseEnergy;
uniform float contrast;
varying vec3 vNormal;
varying vec3 vLightPos;
varying vec3 vEyePos;

float phong(vec3 L, vec3 E, vec3 N) {
  vec3 R = reflect(-L, N);
  return dot(R, E);
}

float blinnPhong(vec3 L, vec3 E, vec3 N) {
  vec3 halfVec = normalize(L + E);
  return dot(halfVec, N);
}

void main() {
  //everything in view space
  vec3 L = normalize(vLightPos - vEyePos); //lightDir
  vec3 E = normalize(-vEyePos); //viewDir
  vec3 N = normalize(vNormal); //normal

  float NdotL = max(0.0, (dot(N, L) + wrap) / (1.0 + wrap));
  vec4 color = ambientColor + NdotL * diffuseColor;

  if (conserveDiffuseEnergy) {
    NdotL = max(0.0, (dot(N, L) + wrap) / ((1.0 + wrap) + (1.0 + wrap)));
    color = ambientColor + NdotL * diffuseColor;
    //color = color / PI;
  }

  float specular = 0.0;
  if (useBlinnPhong)
    specular = blinnPhong(L, E, N);
  else
    specular = phong(L, E, N);

  color += max(pow(specular, shininess), 0.0) * specularColor;

  color.rgb = ((color.rgb - 0.5) * max(contrast, 0.0)) + 0.5;


  if (correctGamma) {
    color = pow(color, vec4(1.0/2.2));
  }

  gl_FragColor = color;
}

#endif
