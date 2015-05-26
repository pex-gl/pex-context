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

uniform vec4 baseColor;

uniform samplerCube irradianceMap;
uniform samplerCube reflectionMap;

varying vec3 ecNormal;
varying vec3 ecLighPos;
varying vec3 ecPosition;

uniform float roughness;

void environmentMap(samplerCube envMap, in vec3 normalIn, in vec3 positionIn, out vec4 colorOut, float mipmapIndex) {
  vec3 V = normalize(positionIn); //eye dir
  vec3 R = reflect(V, normalIn); //reflecte vector
  R = vec3 (invViewMatrix * vec4(R, 0.0));
  colorOut = textureCubeLod(envMap, R, mipmapIndex);
}

float gamma = 2.2;
const float PI = 3.14159265358979323846;

float sqr(float x) { return x*x; }

uniform float ambient;
uniform float reflectivity;
uniform float metallic;
uniform float subsurface;
uniform float specular;
uniform float specularTint;
uniform float anisotropic;
uniform float sheen;
uniform float sheenTint;
uniform float clearcoat;
uniform float clearcoatGloss;
uniform float exposure;

float GTR1(float NdotH, float a) {
  if (a >= 1) return 1/PI;
  float a2 = a*a;
  float t = 1 + (a2-1)*NdotH*NdotH;
  return (a2-1) / (PI*log(a2)*t);
}

float GTR2(float NdotH, float a) {
  float a2 = a*a;
  float t = 1 + (a2-1)*NdotH*NdotH;
  return a2 / (PI * t*t);
}

/*
float phong(vec3 L, vec3 E, vec3 N) {
  vec3 R = reflect(-L, N);
  return max(0.0, dot(R, E));
}

float blinnPhong(vec3 L, vec3 E, vec3 N) {
  vec3 halfVec = normalize(L + E);
  return max(0.0, dot(halfVec, N));
}

float SchlickFresnel(float u) {
  float m = clamp(1-u, 0, 1);
  float m2 = m*m;
  return m2*m2*m; // pow(m,5)
}

float GTR2_aniso(float NdotH, float HdotX, float HdotY, float ax, float ay) {
  return 1 / ( PI * ax*ay * sqr( sqr(HdotX/ax) + sqr(HdotY/ay) + NdotH*NdotH ));
}


vec3 mon2lin(vec4 x) {
  return vec3(pow(x[0], 2.2), pow(x[1], 2.2), pow(x[2], 2.2));
}

float Fresnel(float f0, float u) {
    return f0 + (1-f0) * pow(1-u, 5);
}

float ior = 1.2;

vec3 BRDF_Schlick( vec3 L, vec3 V, vec3 N) {
    vec3 H = normalize(L+V);
    float f0 = pow((ior-1)/(ior+1), 2);
    float F = Fresnel(f0, dot(L,H));
    return vec3(F);
}
*/


float smithG_GGX(float Ndotv, float alphaG) {
  float a = alphaG*alphaG;
  float b = Ndotv*Ndotv;
  return 1/(Ndotv + sqrt(a + b - a*b));
}

float SchlickFresnel(float u) {
  float m = clamp(1-u, 0, 1);
  float m2 = m*m;
  return m2*m2*m; // pow(m,5)
}

vec3 BRDF( vec3 L, vec3 V, vec3 N, float roughness) {
  float NdotL = dot(N,L);
  float NdotV = dot(N,V);

  //return vec3(NdotL);
  //if (NdotL < 0 || NdotV < 0) return vec3(0);
  if (NdotL < 0) return vec3(0);

  vec3 H = normalize(L+V);
  float NdotH = dot(N,H);
  float LdotH = dot(L,H);

  //vec3 Cdlin = mon2lin(baseColor);
  //float Cdlum = .3*Cdlin[0] + .6*Cdlin[1]  + .1*Cdlin[2]; // luminance approx.

  //vec3 Ctint = Cdlum > 0 ? Cdlin/Cdlum : vec3(1); // normalize lum. to isolate hue+sat
  vec3 Ctint = vec3(1.0);
  vec3 Cdlin = vec3(1.0);
  //vec3 Cspec0 = mix(specular*.08*mix(vec3(1), Ctint, specularTint), Cdlin, metallic);
  vec3 Cspec0 = mix(specular*0.08*vec3(1.0), Cdlin, metallic);
  //Cspec0 = vec3(1.0);
  //vec3 Csheen = mix(vec3(1), Ctint, sheenTint);

  // Diffuse fresnel - go from 1 at normal incidence to .5 at grazing
  // and mix in diffuse retro-reflection based on roughness
  float FL = SchlickFresnel(NdotL);
  float FV = SchlickFresnel(NdotV);
  float Fd90 = 0.5 + 2 * LdotH*LdotH * roughness;
  float Fd = mix(1, Fd90, FL) * mix(1, Fd90, FV);

  // Based on Hanrahan-Krueger brdf approximation of isotropic bssrdf
  // 1.25 scale is used to (roughly) preserve albedo
  // Fss90 used to "flatten" retroreflection based on roughness
  float Fss90 = LdotH*LdotH*roughness;
  float Fss = mix(1, Fss90, FL) * mix(1, Fss90, FV);
  float ss = 1.25 * (Fss * (1 / (NdotL + NdotV) - .5) + .5);

  /*
  // specular
  float aspect = sqrt(1-anisotropic*.9);
  float ax = max(.001, sqr(roughness)/aspect);
  float ay = max(.001, sqr(roughness)*aspect);
  //float Ds = GTR2_aniso(NdotH, dot(H, X), dot(H, Y), ax, ay);
  //float Ds = GTR1(NdotH, roughness);
  */
  float Ds = GTR2(NdotH, roughness);
  float FH = SchlickFresnel(LdotH);
  vec3 Fs = mix(Cspec0, vec3(1), FH);
  float roughg = sqr(roughness*.5+.5);
  float Gs = smithG_GGX(NdotL, roughg) * smithG_GGX(NdotV, roughg);

  // sheen
  //vec3 Fsheen = FH * sheen * Csheen;

  // clearcoat (ior = 1.5 -> F0 = 0.04)
  float Dr = GTR1(NdotH, mix(.1,.001,clearcoatGloss));
  float Fr = mix(.04, 1, FH);
  float Gr = smithG_GGX(NdotL, .25) * smithG_GGX(NdotV, .25);

  //vec3 result = ((1/PI) * mix(Fd, ss, subsurface)*Cdlin + Fsheen) * (1-metallic) + Gs*Fs*Ds + .25*clearcoat*Gr*Fr*Dr;
  vec3 result = ((1/PI) * mix(Fd, ss, subsurface)) * (1-metallic) + Gs*Fs*Ds + 0.25*clearcoat*Gr*Fr*Dr;
  return result;
}

float G1V(float dotNV, float k) {
  return 1.0/(dotNV*(1.0-k)+k);
}

float LightingFuncGGX_REF(vec3 N, vec3 V, vec3 L, float roughness, float F0) {
  float alpha = roughness * roughness;

  //half vector
  vec3 H = normalize(V+L);

  float dotNL = clamp(dot(N,L), 0.0, 1.0);
  float dotNV = clamp(dot(N,V), 0.0, 1.0);
  float dotNH = clamp(dot(N,H), 0.0, 1.0);
  float dotLH = clamp(dot(L,H), 0.0, 1.0);

  float F, D, vis;

  //microfacet model

  // D - microfacet distribution function, shape of specular peak
  float alphaSqr = alpha*alpha;
  float pi = 3.14159;
  float denom = dotNH * dotNH * (alphaSqr-1.0) + 1.0;
  D = alphaSqr/(pi * denom * denom);

  // F - fresnel reflection coefficient
  F = F0 + (1.0 - F0) * pow(1.0 - dotLH, 5.0);

  // V / G - geometric attenuation or shadowing factor
  float k = alpha/2.0;
  vis = G1V(dotNL,k)*G1V(dotNV,k);

  float specular = dotNL * D * F * vis;
  //float specular = F;
  return specular;
}

void main() {
  vec4 irradianceColor;
  vec4 reflectionColor;
  float powerDropOnMip = 0.5;
  //float mipmapIndex = log(1.0 - roughness) / log(powerDropOnMip);
  float mipmapIndex = 8.0 * roughness;
  //float mipmapIndex = -1.66096404744368 * log((1.0 - roughness) * 8.0) + 5.5;
  //float mipmapIndex = log((1.0 - roughness) * 2048 / 2048) / log(0.5);
  environmentMap(irradianceMap, ecNormal, ecPosition, irradianceColor, 0.0);
  environmentMap(reflectionMap, ecNormal, ecPosition, reflectionColor, mipmapIndex);

  vec3 L = normalize(ecLighPos - ecPosition);
  vec3 V = normalize(-ecPosition);
  vec3 N = normalize(ecNormal);
  vec3 H = normalize(L + V);

  float NdotL = clamp(dot(N, L), 0.0, 1.0);
  float LdotH = clamp(dot(L, H), 0.0, 1.0);
  float VdotH = clamp(dot(V, H), 0.0, 1.0);

  irradianceColor.rgb = pow(irradianceColor.rgb, vec3(gamma));
  reflectionColor.rgb = pow(reflectionColor.rgb, vec3(gamma));
  //gl_FragColor = irradianceColor;
  gl_FragColor = reflectionColor;

  //Blinn Phong
  //the reflection is the strongest when normal vectore is exactly between eye and light
  float shininess = 4;
  float specular = max(0.0, dot(N, H));
  specular = max(pow(specular, shininess), 0.0);
  //gl_FragColor.rgb = vec3(specular);

  //Schlick Fresnel
  float F0 = 0.2;
  float base = 1.0 - VdotH;
  float exponential = pow(base, 5.0);
  //float fresnel = exponential + F0 * (1.0 - exponential);
  float fresnel = F0 + (1.0 - F0) * pow(1.0 - LdotH, 5.0) / 2.0;
  //gl_FragColor.rgb = vec3(specular * fresnel);

  float ggx = LightingFuncGGX_REF(N, V, L, roughness, 0.2);
  //gl_FragColor.rgb = vec3(ggx);

  vec3 disneyBRDF = BRDF(L, V, N, roughness);
  //gl_FragColor.rgb = vec3(disneyBRDF * NdotL) * reflectionColor.rgb;

  //gl_FragColor = irradianceColor * baseColor * (1.0 - specular) + baseColor * vec4(specular) * reflectionColor;
}

#endif
