#ifdef VERT

uniform mat4 projectionMatrix;
uniform mat4 modelViewMatrix;

attribute vec3 position;
attribute vec2 texCoord;

uniform mat4 viewMatrix;

uniform vec3 lightPos;

varying vec3 ecLighPos;
varying vec2 vTexCoord;
uniform float near;

void main() {
  vec3 pos = position;
  vec4 ecPos = modelViewMatrix * vec4(pos, 1.0);
  ecPos.z = min(ecPos.z, -near - 0.0001);
  //ecPos.z = -5.0;
  gl_Position = projectionMatrix * ecPos;
  vTexCoord = gl_Position.xy/gl_Position.w * 0.5 + 0.5;
  ecLighPos = (viewMatrix * vec4(lightPos, 1.0)).xyz;
  //ecLighPos = lightPos;
}

#endif

#ifdef FRAG

uniform mat4 invViewMatrix;
uniform mat4 invProjectionMatrix;

varying vec3 ecLighPos;
varying vec2 vTexCoord;
uniform sampler2D albedoMap;
uniform sampler2D normalMap;
uniform sampler2D depthMap;
uniform sampler2D occlusionMap;
uniform float lightBrightness;
uniform float lightRadius;
uniform vec4 lightColor;

uniform float roughness;

uniform float wrap;
uniform float fov;
uniform float near;
uniform float far;
uniform float aspectRatio;
uniform float correctGamma;

const float PI = 3.14159265358979323846;

//vec3 environmentMap(samplerCube envMap, in vec3 normalIn, in vec3 positionIn, float mipmapIndex) {
//  vec3 E = normalize(positionIn); //eye dir
//  vec3 R = reflect(E, normalIn); //reflecte vector
//  R = vec3(invViewMatrix * vec4(R, 0.0));
//  vec3 color = textureCubeLod(envMap, R, mipmapIndex).rgb;
//  return color;
//}

//From Disney princlpled BRDF
float SchlickFresnel(float u) {
  float m = clamp(1.0-u, 0.0, 1.0);
  float m2 = m*m;
  return m2*m2*m; // pow(m,5)
}

vec3 Fresnel(vec3 specAlbedo, vec3 H, vec3 L) {
  float LdotH = clamp(dot(L, H), 0.0, 1.0);
  return specAlbedo + (1.0 - specAlbedo) * pow((1.0 - LdotH), 5.0);
}

//fron depth buf normalized z to linear (eye space) z
//http://stackoverflow.com/questions/6652253/getting-the-true-z-value-from-the-depth-buffer
float ndcDepthToEyeSpace(float ndcDepth) {
  return 2.0 * near * far / (far + near - ndcDepth * (far - near));
}

//fron depth buf normalized z to linear (eye space) z
//http://stackoverflow.com/questions/6652253/getting-the-true-z-value-from-the-depth-buffer
float readDepth(sampler2D depthMap, vec2 coord) {
  float z_b = texture2D(depthMap, coord).r;
  float z_n = 2.0 * z_b - 1.0;
  return ndcDepthToEyeSpace(z_n);
}

vec3 getFarViewDir(vec2 tc) {
  float hfar = 2.0 * tan(fov/2.0/180.0 * PI) * far;
  float wfar = hfar * aspectRatio;
  vec3 dir = (vec3(wfar * (tc.x - 0.5), hfar * (tc.y - 0.5), -far));
  return dir;
}

vec3 getViewRay(vec2 tc) {
  vec3 ray = normalize(getFarViewDir(tc));
  return ray;
}

//asumming z comes from depth buffer (ndc coords) and it's not a linear distance from the camera but
//perpendicular to the near/far clipping planes
//http://mynameismjp.wordpress.com/2010/09/05/position-from-depth-3/
//assumes z = eye space z
vec3 reconstructPositionFromDepth(vec2 texCoord, float z) {
  vec3 ray = getFarViewDir(texCoord);
  vec3 pos = ray;
  return pos * z / far;
}

//Problems more sharp metal doesn't get darker

void main() {
  vec3 normal = texture2D(normalMap, vTexCoord).rgb; //assumes rgb = ecNormal.xyz + 0.5
  vec4 albedoValue = texture2D(albedoMap, vTexCoord);
  float gammaPow = mix(1.0, 2.2, correctGamma);
  vec3 albedoColor = pow(albedoValue.rgb, vec3(gammaPow));
  vec3 specularColor = albedoColor; //for now
  float depth = texture2D(depthMap, vTexCoord).a; //assumes a = len(ecPos.xyz)
  float occlusion = texture2D(occlusionMap, vTexCoord).r;

  vec3 position = reconstructPositionFromDepth(vTexCoord, readDepth(depthMap, vTexCoord));

  vec3 FinalColor = vec3(0.0);
  vec3 N = normalize(normal - 0.5);
  vec3 L = normalize(ecLighPos - position.xyz);
  vec3 V = normalize(-position.xyz);
  vec3 H = normalize(L + V);

  float NdotL = clamp((dot(N, L) + wrap)/(1.0+wrap), 0.0, 1.0);
  float NdotV = clamp((dot(N, V) + wrap)/(1.0+wrap), 0.0, 1.0);
  float LdotH = clamp((dot(L, H) + wrap)/(1.0+wrap), 0.0, 1.0);
  float NdotH = clamp((dot(N, H) + wrap)/(1.0+wrap), 0.0, 1.0);
  float VdotH = clamp((dot(V, H) + wrap)/(1.0+wrap), 0.0, 1.0);

  float lightDistance = length(ecLighPos - position.xyz);
  float maxMipMapLevel = 6.0; //most blurry
  vec3 F0 = specularColor;

  float metallic = 0.0;
  float smoothness = 1.0 - roughness; //0 - matte, 1 - reflective
  float specular = 0.5;

  //Based on "Real Shading in Unreal Engine 4"
  float lightFalloff = 0.1 + pow(clamp(1.0 - pow(lightDistance/lightRadius, 4.0), 0.0, 1.0), 2.0) / (pow(lightDistance, 2.0) + 1.0);

  //Diffuse Fresnel (Disney) aka glossy Fresnel
  //Should be 2D lookup texture for IBL as in UnreadEngine4
  float FL = SchlickFresnel(NdotL);
  float FV = SchlickFresnel(NdotV);
  float Fd90 = 0.5 + 2.0 * LdotH*LdotH * roughness;
  float Fd = mix(1.0, Fd90, FL) * mix(1.0, Fd90, FV);

  //Specular BRDF: Cook-Torrance microfacet model
  //          D(h) * F(v,h) * G(l,v,h)
  // f(l,v) = ------------------------
  //              4 * n.l * n.v

  //Alpha: Based on "Real Shading in Unreal Engine 4"
  float a = pow(1.0 - smoothness * 0.7, 6.0);

  //Normal Distribution Function: GGX
  //                    a^2
  //D(h) = --------------------------------
  //       PI * ((n.h)^2 * (a^2 - 1) + 1)^2
  float aSqr = a * a;
  float Ddenom = NdotH * NdotH * (aSqr - 1.0) + 1.0;
  float Dh = aSqr / ( PI * Ddenom * Ddenom);

  //Fresnel Term: Fresnel schlick
  //F(v,h) = F0 + (1 - F0)*(1 - (v.h))^5
  //Linear interpolation between specular color F0 and white
  vec3 Fvh = F0 + (1.0 - F0) * pow((1.0 - VdotH), 5.0);

  //Visibility Term: Schlick-Smith
  //                                          n.v               (0.8 + 0.5*a)^2
  //G(l,v,h) = G1(l)* G1(v)    G1(v) = -----------------    k = ---------------
  //                                   (n.v) * (1-k) + k               2
  float k = pow(0.8 + 0.5 * a, 2.0) / 2.0;
  float G1l = NdotL / (NdotL * (1.0 - k) + k);
  float G1v = NdotV / (NdotV * (1.0 - k) + k);
  float Glvn = G1l * G1v;

  //Complete Cook-Torrance
  float fDenom = (4.0 * NdotL * NdotV);
  if (fDenom == 0.0) fDenom = 1.0;
  vec3 flv = Dh * Fvh * Glvn / fDenom;

  //vec3 LDirectDiffuse = 1.0 / PI * albedoColor * (1.0 - metallic) * lightBrightness * lightColor * lightFalloff * clamp(NdotL, 0.0, 1.0);
  vec3 LDirectDiffuse = 1.0 / PI * albedoColor * (1.0 - metallic) * lightBrightness * lightColor.rgb * lightFalloff * clamp(NdotL, 0.0, 1.0);
  vec3 LDirectSpecualar = vec3(flv) * lightBrightness * lightColor.rgb * lightFalloff * clamp(NdotL, 0.0, 1.0);

  //FinalColor = (LDirectDiffuse + LDirectSpecualar) * occlusion;
  FinalColor = (LDirectDiffuse + LDirectSpecualar) * occlusion;

  gl_FragColor.rgb = FinalColor;

  //gl_FragColor.rgb = vec3(lightDistance/20.0);
  //lightFalloff = pow(clamp(1.0 - pow(lightRadius/lightDistance, 4.0), 0.0, 1.0), 2.0) / (pow(lightDistance, 2.0) + 1.0);
  //lightFalloff = clamp(1.0 - pow(lightRadius/lightDistance, 4.0), 0.0, 1.0);
  //gl_FragColor.rgb = vec3(distance(ecLighPos, vec3(2.0, 2.0, -3.0)));
  //gl_FragColor.rgb = vec3(position);

  //L = normalize(vec3(10.0, 10.0, 10.0));
}

#endif