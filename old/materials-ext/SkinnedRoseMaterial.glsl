#ifdef VERT

#define MAX_BONES 32

uniform mat4 projectionMatrix;
uniform mat4 modelViewMatrix;
uniform mat4 modelWorldMatrix;
uniform mat4 viewMatrix;
uniform mat4 normalMatrix;
uniform float pointSize;
uniform vec3 lightPos;
uniform vec3 cameraPos;
uniform mat4 boneMatrices[MAX_BONES];
attribute vec3 position;
attribute vec3 normal;
attribute vec2 texCoord;
attribute vec2 skinIndices;
attribute vec2 skinWeights;
varying vec3 vNormal;
varying vec3 vLightPos;
varying vec3 vEyePos;
varying vec2 vTexCoord;

void main() {
  vec4 skinnedPosition = vec4(0.0);
  vec4 skinnedNormal = vec4(0.0);
  int idx1 = int(skinIndices.x);
  int idx2 = int(skinIndices.y);

  //for(int i=0; i<20; i++) {
  //  if (i == idx1) { skinnedPosition += skinWeights.x * boneMatrices[i] * vec4(position, 1.0); }
  //  if (i == idx2) { skinnedPosition += skinWeights.y * boneMatrices[i] * vec4(position, 1.0); }
  //  if (i == idx1) { skinnedNormal += skinWeights.x * boneMatrices[i] * vec4(normal, 0.0); }
  //  if (i == idx2) { skinnedNormal += skinWeights.y * boneMatrices[i] * vec4(normal, 0.0); }
  //}

  vec3 pos = position;
  mat4 matX = boneMatrices[int(skinIndices.x)];
  mat4 matY = boneMatrices[int(skinIndices.y)];
  skinnedPosition = vec4(skinWeights.x * matX * vec4(pos, 1.0) + skinWeights.y *  matY * vec4(pos, 1.0));
  skinnedNormal = normalize(vec4(skinWeights.x * matX * vec4(normal, 0.0) + skinWeights.y *  matY * vec4(normal, 0.0)));

  pos = skinnedPosition.xyz;
  //pos = position;

  //http://graphics.ucsd.edu/courses/cse169_w05/3-Skin.htm
  //It is also important to recall that the normal vector represents a direction, rather than a position.
  //This implies that its expansion to 4D homogeneous coordinates should have a 0 in the value of the w coordinate, instead of a 1 as in the vertex position.
  //This ensures that the normal will only be affected by the upper 3x3 portion of the matrix, and not affected by any translation [see appendix [A]].
  //e = normalize(vec3(modelViewMatrix * vec4(position, 1.0)));

  vec4 worldPos = modelWorldMatrix * vec4(pos, 1.0);
  vec4 eyePos = modelViewMatrix * vec4(pos, 1.0);

  //wcCoords = (modelWorldMatrix * vec4(pos, 1.0)).xyz;
  //wcNormal = skinnedNormal;

  gl_Position = projectionMatrix * eyePos;

  vEyePos = eyePos.xyz;

  gl_PointSize = pointSize;
  vNormal = (normalMatrix * vec4(skinnedNormal.xyz, 0.0)).xyz;
  vLightPos = (viewMatrix * vec4(lightPos, 1.0)).xyz;
  vTexCoord = texCoord;

}

#endif

#ifdef FRAG

varying vec2 vTexCoord;
varying vec3 vNormal;
varying vec3 vLightPos;
varying vec3 vEyePos;

uniform sampler2D texture;
uniform vec2 scale;
uniform vec4 color;
uniform float shininess;
uniform float wrap;
uniform bool useBlinnPhong;
uniform bool usePhong;
uniform bool useDiffuse;
uniform bool useTexture;

float phong(vec3 L, vec3 E, vec3 N) {
  vec3 R = reflect(-L, N);
  return max(0.0, dot(R, E));
}

float blinnPhong(vec3 L, vec3 E, vec3 N) {
  vec3 halfVec = normalize(L + E);
  return max(0.0, dot(halfVec, N));
}

void main() {
  vec4 baseColor = color;

  if (useTexture) {
    baseColor = texture2D(texture, vTexCoord) * color;
  }

  vec4 ambientColor = baseColor * 0.1;
  vec4 diffuseColor = baseColor * 0.9;
  vec4 specularColor = vec4(1.0);
  float finalWrap = wrap;

  if (!useDiffuse) {
    finalWrap = 0.5;
    ambientColor = baseColor * 0.5;
    diffuseColor = baseColor * 0.5;
  }

  vec3 L = normalize(vLightPos - vEyePos); //lightDir
  vec3 E = normalize(-vEyePos); //viewDir
  vec3 N = normalize(vNormal); //normal

  float NdotL = max(0.0, (dot(N, L) + finalWrap) / (1.0 + finalWrap));

  vec4 finalColor = ambientColor + NdotL * diffuseColor;

  float specular = 0.0;
  if (useBlinnPhong) specular = blinnPhong(L, E, N);
  if (usePhong) specular = phong(L, E, N);

  finalColor += max(pow(specular, shininess), 0.0) * specularColor;

  gl_FragColor = finalColor;
  gl_FragColor = vec4(1.0, 0.0, 0.0, 1.0);
  gl_FragColor.a = 1.0;
}

#endif
