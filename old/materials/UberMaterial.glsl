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
attribute vec2 texCoord;

varying vec3 ecNormal;
varying vec3 ecLightPos;
varying vec3 ecPosition;
//varying vec2 vTexCoord;
varying vec3 wcNormal;
varying vec3 wcCoords;
//varying vec3 vEyePos;
//varying vec2

void main() {
  vec4 worldPos = modelWorldMatrix * vec4(position, 1.0);
  ecPosition = vec3(modelViewMatrix * vec4(position, 1.0));
  gl_Position = projectionMatrix * vec4(ecPosition, 1.0);
  //vEyePos = eyePos.xyz;
  //gl_PointSize = pointSize;
  ecNormal = (normalMatrix * vec4(normal, 0.0)).xyz;
  ecLightPos = (viewMatrix * vec4(lightPos, 1.0)).xyz;

  wcNormal = normal;
  wcCoords = (modelWorldMatrix * vec4(position, 1.0)).xyz;
  //vTexCoord = texCoord;
}

#endif

#ifdef FRAG

#ifdef WEBGL
  #extension GL_EXT_shader_texture_lod : require
#else
  #extension GL_ARB_shader_texture_lod : require
#endif

varying vec3      ecNormal;
varying vec3      ecLightPos;
varying vec3      ecPosition;
varying vec3      wcNormal;
varying vec3      wcCoords;
uniform bool      correctGamma;
/*
uniform bool      showNormals;
*/
uniform bool      skyBox;
uniform vec4      baseColor;
uniform sampler2D baseColorMap;
uniform bool      baseColorMapEnabled;
uniform vec4      specularColor;
uniform sampler2D specularMap;
uniform bool      specularMapEnabled;
uniform sampler2D glossMap;
/*
uniform sampler2D aoMap;



uniform float     specular;  //reflectivity: dimm <--> mirror
uniform float     metallic;
*/
uniform sampler2D normalMap;
uniform float     roughness; //smooth/shiny <--> rough/matte
uniform mat4      invViewMatrix;
uniform samplerCube reflectionMap;
uniform samplerCube diffuseMap;
uniform sampler2D ssaoMap;

const float PI = 3.14159265358979323846;

/*
mBrdfDiffuseLambert;
mBrdfDiffuseBurley;
mBrdfDiffuseOrenNayar;
mBrdfMicrofacetBlinn;
mBrdfMicrofacetBeckmann;
mBrdfMicrofacetGGX;
mBrdfGeomNeumann;
mBrdfGeomKelemen;
mBrdfGeomSchlick;
mBrdfGeomSmith;
*/
/*
//-----------------------------------------------------------------------------

float brdfDiffuseLambert(vec3 L, vec3 V, vec3 N) {
  return max(0.0, dot(N, L));
}

//-----------------------------------------------------------------------------

float microfacetBlinnPhong(vec3 L, vec3 V, vec3 N, float roughness) {
  vec3 halfVec = normalize(L + V);
  float s = max(0.0, dot(halfVec, N));

  //http://simonstechblog.blogspot.kr/2011/12/microfacet-brdf.html
  //roughness = sqrt(2/(shininess+2))
  //           2
  //r = sqrt(------)
  //         sh + 2
  //r*r (sh + 2) = 2
  //sh + 2 = 2 / (r * r)
  //sg = 2 / (r + r) - 2
  float shininess = 2.0 / (roughness*roughness) - 2.0;

  s = pow(s, shininess);
  //if (normalized)
  //D *= (2+n) / (2*PI);
  s *= (2.0 + shininess) / (2.0 * PI);
  return s;
}

//-----------------------------------------------------------------------------

float GGX(float alpha, float cosThetaM) {
  float CosSquared = cosThetaM*cosThetaM;
  float TanSquared = (1.0-CosSquared)/CosSquared;
  float g = (alpha/(CosSquared * (alpha*alpha + TanSquared)));
  return (1.0/PI) * g * g;
}

float microfacetGGX(vec3 L, vec3 V, vec3 N, float roughness) {
  vec3 H = normalize(L + V);
  return GGX(roughness, dot(N,H));
}

//-----------------------------------------------------------------------------

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
  //return vis;
  return specular;
}
*/

//-----------------------------------------------------------------------------

float material_cubemapSize = 128.0;

vec3 fixSeams(vec3 vec, float mipmapIndex) {
    float scale = 1.0 - exp2(mipmapIndex) / material_cubemapSize;
    float M = max(max(abs(vec.x), abs(vec.y)), abs(vec.z));
    if (abs(vec.x) != M) vec.x *= scale;
    if (abs(vec.y) != M) vec.y *= scale;
    if (abs(vec.z) != M) vec.z *= scale;
    return vec;
}

vec3 fixSeams(vec3 vec) {
    float scale = 1.0 - 1.0 / material_cubemapSize;
    float M = max(max(abs(vec.x), abs(vec.y)), abs(vec.z));
    if (abs(vec.x) != M) vec.x *= scale;
    if (abs(vec.y) != M) vec.y *= scale;
    if (abs(vec.z) != M) vec.z *= scale;
    return vec;
}

//-----------------------------------------------------------------------------

vec4 sampleEnvMap(samplerCube envMap, vec3 ecN, vec3 ecPos, float mipmapIndex) {
  vec3 eyeDir = normalize(-ecPos); //Direction to eye = camPos (0,0,0) - ecPos
  vec3 ecReflected = reflect(-eyeDir, ecN); //eye coordinates reflection vector

  float mipmap = mipmapIndex;

  if (skyBox) {
    ecReflected = normalize(ecPos);
    mipmap = 5.0;
  }

  vec3 wcReflected = vec3(invViewMatrix * vec4(ecReflected, 0.0)); //world coordinates reflection vector

  //return textureCubeLod(envMap, fixSeams(wcReflected, mipmap), mipmap);
  float lod = mipmap;
  float upLod = floor(lod);
  float downLod = ceil(lod);
  vec4 a = textureCubeLod(envMap, fixSeams(wcReflected, upLod), upLod);
  vec4 b = textureCubeLod(envMap, fixSeams(wcReflected, downLod), downLod);
  return mix(a, b, lod - upLod);
}
/*
//-----------------------------------------------------------------------------

vec2 rand(vec2 coord) {
  float noiseX = (fract(sin(dot(coord, vec2(12.9898,78.233))) * 43758.5453));
  float noiseY = (fract(sin(dot(coord, vec2(12.9898,78.233) * 2.0)) * 43758.5453));
  return vec2(noiseX,noiseY) * 0.004;
}

//-----------------------------------------------------------------------------
*/
//Convert color to linear space
//http://filmicgames.com/archives/299
//http://www.cambridgeincolour.com/tutorials/gamma-correction.htm
vec4 gammaToLinear(vec4 color) {
  if (correctGamma) {
    return vec4(pow(color.rgb, vec3(2.2)), color.a);
  }
  else {
    return color;
  }
}

vec4 linearToGamma(vec4 color) {
  if (correctGamma) {
    return vec4(pow(color.rgb, vec3(1.0 / 2.2)), color.a);
  }
  else {
    return color;
  }
}

/*
//-----------------------------------------------------------------------------

vec4 extractRGBE(vec4 color) {
  return vec4((color.rgb * pow(2.0, color.a * 255.0 - 128.0)), 1.0);
}

//-----------------------------------------------------------------------------
*/
float triPlanarScale = 1.5;

vec4 sampleTriPlanar(sampler2D tex, float scale) {
  vec3 blending = abs( normalize(wcNormal) );
  blending = normalize(max(blending, 0.00001)); // Force weights to sum to 1.0
  float b = (blending.x + blending.y + blending.z);
  blending /= vec3(b, b, b);

  vec4 xaxis = texture2D( tex, mod(wcCoords.zy * triPlanarScale, vec2(1.0, 1.0)));
  vec4 yaxis = texture2D( tex, mod(wcCoords.xz * triPlanarScale, vec2(1.0, 1.0)));
  vec4 zaxis = texture2D( tex, mod(wcCoords.xy * triPlanarScale, vec2(1.0, 1.0)));
  // blend the results of the 3 planar projections.
  vec4 color = xaxis * blending.x + yaxis * blending.y + zaxis * blending.z;

  return color;
}

vec4 sampleTriPlanar(sampler2D tex) {
  return sampleTriPlanar(tex, triPlanarScale);
}


//-----------------------------------------------------------------------------

vec3 triPlanarTangent() {
  vec3 blending = abs( normalize(wcNormal) );
  blending = normalize(max(blending, 0.00001)); // Force weights to sum to 1.0
  float b = (blending.x + blending.y + blending.z);
  blending /= vec3(b, b, b);

  vec3 tanX = vec3(-wcNormal.x, -wcNormal.z, wcNormal.y);
  vec3 tanY = vec3( wcNormal.z, wcNormal.y, wcNormal.x);
  vec3 tanZ = vec3(-wcNormal.y, -wcNormal.x, wcNormal.z);

  return tanX * blending.x + tanY * blending.y + tanZ * blending.z;
}

//-----------------------------------------------------------------------------

/*
mat3 cotangent_frame(vec3 N, vec3 p, vec2 uv) {
    // get edge vectors of the pixel triangle
    vec3 dp1 = dFdx( p );
    vec3 dp2 = dFdy( p );
    vec2 duv1 = dFdx( uv );
    vec2 duv2 = dFdy( uv );

    // solve the linear system
    vec3 dp2perp = cross( dp2, N );
    vec3 dp1perp = cross( N, dp1 );
    vec3 T = dp2perp * duv1.x + dp1perp * duv2.x;
    vec3 B = dp2perp * duv1.y + dp1perp * duv2.y;

    // construct a scale-invariant frame
    float invmax = inversesqrt( max( dot(T,T), dot(B,B) ) );
    return mat3( T * invmax, B * invmax, N );
}

vec3 perturb_normal( vec3 wcNormal, vec3 sampledNormal, vec3 V, vec2 texcoord ) {
  mat3 TBN = cotangent_frame(wcNormal, -V, texcoord);
  return normalize(TBN * sampledNormal);
}

*/
//-----------------------------------------------------------------------------

void main() {
  float globalRougness = roughness;
  vec4 albedo;
  vec2 vTexCoord;
  vec4 lightColor = vec4(0.4, 0.4, 0.4, 1.0);

  if (baseColorMapEnabled) {
    albedo = gammaToLinear(sampleTriPlanar(baseColorMap));
  }
  else {
    albedo = gammaToLinear(baseColor);
  }

  //float ambientOcclusion = sampleTriPlanar(aoMap, vTexCoord).r;
  vec3 specular = gammaToLinear(sampleTriPlanar(specularMap)).rgb;
  
  float glossines = (sampleTriPlanar(glossMap)).r;


  glossines = 1.0 - globalRougness;

  vec3 normal = sampleTriPlanar(normalMap).rgb * 2.0 - 1.0;
  vec3 eyePos = vec3(0.0, 0.0, -1.0);
  vec3 N = normalize(ecNormal);
  vec3 L = normalize(ecLightPos - ecPosition);
  vec3 V = normalize(eyePos - ecPosition);
  vec3 H = normalize(L + V);

  //vec3 TN = perturb_normal(wcNormal, normal, V, triPlanarTexCoord());
  //vec3 TN = perturb_normal(wcNormal, normal, V, vTexCoord);
  vec3 T = normalize(triPlanarTangent());
  vec3 B = normalize(cross(wcNormal, T));
  float invmax = inversesqrt( max( dot(T,T), dot(B,B) ) );
  mat3 TBN = mat3( T * invmax, B * invmax, N );
  N = normalize(TBN * normal);

  //N = TN;
  
  float dotNL = clamp(dot(N,L), 0.0, 1.0); //0l
  float dotNV = clamp(dot(N,V), 0.0, 1.0); //0d
  float dotNH = clamp(dot(N,H), 0.0, 1.0); //0h
  float dotLH = clamp(dot(L,H), 0.0, 1.0); //0d
  float dotVH = clamp(dot(V,H), 0.0, 1.0); //== 0d?


  float roughness = 1.0 - glossines;
  float smoothness = glossines;
  
  //The Schlick Approximation to Fresnel
  float dotLH5 = pow(1.0 - dotLH, 5.0);
  vec3 F0 = specular; //incidence fresnel reflectance
  vec3 Fschlick = F0 + (1.0 - F0) * dotLH5;

  vec3 F = Fschlick;

  //Microfacet Normal Distribution
  float D = 1.0;

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
  float Ddenom = dotNH * dotNH * (aSqr - 1.0) + 1.0;
  float Dh = aSqr / ( PI * Ddenom * Ddenom);

  //Diffuse Fresnel (Disney) aka glossy Fresnel
  //Should be 2D lookup texture for IBL as in UnreadEngine4
  float FL = pow((1.0 - dotNL), 5.0);
  float FV = pow((1.0 - dotNV), 5.0);
  float Fd90 = 0.5 + 2.0 * roughness * dotLH*dotLH; //0d
  vec3 Fd = (specularColor).rgb / PI * (1.0 + (Fd90 - 1.0) * FL) * (1.0 + (Fd90 - 1.0) * FV); //0l 0f

  //Fresnel Term: Fresnel Schlick
  //F(v,h) = F0 + (1 - F0)*(1 - (v.h))^5
  //Linear interpolation between specular color F0 and white
  vec3 Fvh = F0 + (1.0 - F0) * pow((1.0 - dotVH), 5.0);

  //Indirect specular
  //vec3 LIndirectSpecular = Fvh * dotNL; //TODO: Fresnel * IBLspec(roughness)

  //Visibility Term: Schlick-Smith
  //                                          n.v               (0.8 + 0.5*a)^2
  //G(l,v,h) = G1(l)* G1(v)    G1(v) = -----------------    k = ---------------
  //                                   (n.v) * (1-k) + k               2
  float k = pow(0.8 + 0.5 * a, 2.0) / 2.0;
  float G1l = dotNL / (dotNL * (1.0 - k) + k);
  float G1v = dotNV / (dotNV * (1.0 - k) + k);
  float Glvn = G1l * G1v;

  //Complete Cook-Torrance
  vec3 flv = Dh * Fvh * Glvn / (4.0 * dotNL * dotNV);

  ////////

  
  float roughness2 = roughness;//1.0 - (1.0 - roughness) * (1.0 - roughness);
  smoothness = 1.0 - roughness;
  float maxMipMapLevel = 8.0;
  
  vec4 ambientDiffuse = gammaToLinear(sampleEnvMap(diffuseMap, N, ecPosition, 8.0));
  vec4 ambientReflection = gammaToLinear(sampleEnvMap(reflectionMap, N, ecPosition, roughness2 * maxMipMapLevel));
  //vec4 ambientReflection = textureCube(reflectionMap, N);
  //ambientDiffuse = pow(ambientDiffuse, vec4(3.0)); //fake hdr from our overexposed cubemap
  //ambientReflection = pow(ambientReflection, vec4(3.0)); //fake hdr from our overexposed cubemap

  ////////

  albedo *= baseColor;

  vec4 color;
  vec4 ao = texture2D(ssaoMap, gl_FragCoord.xy/vec2(1280.0, 720.0));;
  ao = ao * ao;
  //color += ambientDiffuse * albedo * ambientOcclusion / PI;
  color += ao * ambientDiffuse * albedo / PI;
  //color = albedo;
  color += albedo * dotNL * lightColor / PI;
  //color += vec4(flv * dotNL, 1.0) * lightColor;
  //color += ambientReflection * vec4(specular, 1.0);
  //gl_FragColor += ambientReflection * vec4(specular, 1.0);

  vec3 Fs = specular + (max(vec3(smoothness), specular) - specular) * pow(1.0 - max(dot(V, N), 0.0), 5.0);
  color += ao * ambientReflection * vec4(Fs, 1.0);

  //color = vec4(Fs, 1.0);
  //gl_FragColor = linearToGamma(ambientReflection);
  gl_FragColor = linearToGamma(color);

  //gl_FragColor = vec4(Fvh * dotNL, 1.0);

  //gl_FragColor += ambientReflection * vec4(Fvh * dotNL, 1.0);

  //gl_FragColor = vec4(N + 0.5, 1.0);

  ////


  //gl_FragColor = vec4(roughness2);
  //gl_FragColor = vec4(flv, 1.0);
  //gl_FragColor = vec4(dot(L, N));
  //gl_FragColor = vec4(vTexCoord, 0.0, 1.0);

  //gl_FragColor.rgb = (TN + 0.5)/2.0;
  
  //vec4 ambientReflection = gammaToLinear(sampleEnvMap(reflectionMap, N, ecPosition, roughness2 * maxMipMapLevel));
  //
  //gl_FragColor += vec4(normal, 1.0);

  //gl_FragColor = vec4(roughness2);

  if (skyBox) {
    vec4 ambientReflection = gammaToLinear(sampleEnvMap(reflectionMap, normalize(ecNormal), ecPosition, 1.0));
    //gl_FragColor = (ambientReflection);
    gl_FragColor = linearToGamma(ambientReflection);
  }
}

//-----------------------------------------------------------------------------

/*
void mainOld() {
  vec4 albedo;
  vec2 vTexCoord;

  if (baseColorMapEnabled) {
    albedo = gammaToLinear(texture2D(baseColorMap, vTexCoord));
  }
  else {
    albedo = gammaToLinear(baseColor);
  }


  vec3 eyePos = vec3(0.0, 0.0, -1.0);
  vec3 N = normalize(ecNormal);
  vec3 L = normalize(ecLightPos - ecPosition);
  vec3 V = normalize(eyePos - ecPosition);
  vec3 H = normalize(L + V);

  float dotNL = clamp(dot(N,L), 0.0, 1.0); //0l
  float dotNV = clamp(dot(N,V), 0.0, 1.0); //0d
  float dotNH = clamp(dot(N,H), 0.0, 1.0); //0h
  float dotLH = clamp(dot(L,H), 0.0, 1.0); //0d
  float dotVH = clamp(dot(V,H), 0.0, 1.0); //== 0d?

  //The Schlick Approximation to Fresnel
  float dotLH5 = pow(1.0 - dotLH, 5.0);
  vec3 F0 = gammaToLinear(specularColor).rgb; //incidence fresnel reflectance
  vec3 Fschlick = F0 + (1.0 - F0) * dotLH5;

  vec3 F = Fschlick;

  //Microfacet Normal Distribution
  float D = 1.0;


  //// D
  //float alpha = roughness*roughness;
  //float alphaSqr = alpha*alpha;
  //float pi = 3.14159;
  //float denom = dotNH * dotNH *(alphaSqr-1.0) + 1.0;
  //D = alphaSqr/(pi * denom * denom);
  //
  //// F
  //float dotLH5 = pow(1.0-dotLH, 5.0);
  //F = F0 + (1.0-F0)*(dotLH5);
  //
  //// V
  //float k = alpha/2.0;
  //vis = G1V(dotNL,k)*G1V(dotNV,k);

  //Geometry Factor
  float Gimplicit = dotNL * dotNV; //Viz -> 1
  float GcookTorrance = min(1.0, min(2 * dotNH * dotNV / dotVH, 2 * dotNH * dotNL / dotVH));

  float G = GcookTorrance;

  //Visibility term
  float Vis = 1.0;
  if (dotNL * dotNV > 0.0) {
    Vis = G / (dotNL * dotNV);
  }

  vec4 color = vec4(1.0);
  //color.rgb = F * Vis * D;

  //-------------

  float smoothness = 1.0 - roughness;

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
  float Ddenom = dotNH * dotNH * (aSqr - 1.0) + 1;
  float Dh = aSqr / ( PI * Ddenom * Ddenom);

  //Diffuse Fresnel (Disney) aka glossy Fresnel
  //Should be 2D lookup texture for IBL as in UnreadEngine4
  float FL = pow((1 - dotNL), 5.0);
  float FV = pow((1 - dotNV), 5.0);
  float Fd90 = 0.5 + 2.0 * roughness * dotLH*dotLH; //0d
  vec3 Fd = gammaToLinear(specularColor).rgb / PI * (1.0 + (Fd90 - 1.0) * FL) * (1.0 + (Fd90 - 1.0) * FV); //0l 0f

  //Fresnel Term: Fresnel Schlick
  //F(v,h) = F0 + (1 - F0)*(1 - (v.h))^5
  //Linear interpolation between specular color F0 and white
  vec3 Fvh = F0 + (1.0 - F0) * pow((1.0 - dotVH), 5.0);

  //Indirect specular
  //vec3 LIndirectSpecular = Fvh * dotNL; //TODO: Fresnel * IBLspec(roughness)

  //Visibility Term: Schlick-Smith
  //                                          n.v               (0.8 + 0.5*a)^2
  //G(l,v,h) = G1(l)* G1(v)    G1(v) = -----------------    k = ---------------
  //                                   (n.v) * (1-k) + k               2
  float k = pow(0.8 + 0.5 * a, 2.0) / 2.0;
  float G1l = dotNL / (dotNL * (1.0 - k) + k);
  float G1v = dotNV / (dotNV * (1.0 - k) + k);
  float Glvn = G1l * G1v;

  //Complete Cook-Torrance
  vec3 flv = Dh * Fvh * Glvn / (4 * dotNL * dotNV);

  color.rgb = flv * dotNL * mix(vec3(1.0), gammaToLinear(specularColor).rgb, metallic);

  float roughness2 = 1.0 - (1.0 - roughness) * (1.0 - roughness);
  float maxMipMapLevel = 8.0;

  //vec4 ambientDiffuse = gammaToLinear(sampleEnvMap(diffuseMap, N, ecPosition, 0.0));
  //vec4 ambientReflection = gammaToLinear(sampleEnvMap(reflectionMap, N, ecPosition, roughness2 * maxMipMapLevel));
  //ambientDiffuse = pow(ambientDiffuse, vec4(3.0)); //fake hdr from our overexposed cubemap
  //ambientReflection = pow(ambientReflection, vec4(3.0)); //fake hdr from our overexposed cubemap

  //color += albedo * ambientDiffuse * (1.0 - metallic);

  //color += ambientReflection * specular * mix(vec4(1.0), gammaToLinear(specularColor), metallic);

  //TODO + direct diffuse

  //color.rgb = vec3(Fd);

  if (skyBox) {
    color = vec4(0.0);
  }

  gl_FragColor = linearToGamma(color);
}
*/
#endif
