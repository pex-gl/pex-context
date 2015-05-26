#ifdef VERT

attribute vec2 position;
attribute vec2 texCoord;
varying vec2 vTexCoord;

uniform mat4 viewMatrix;

uniform vec3 lightPos;
varying vec3 ecLighPos;

void main() {
  gl_Position = vec4(position, 0.0, 1.0);
  vTexCoord = texCoord;
  ecLighPos = (viewMatrix * vec4(lightPos, 1.0)).xyz;
}

#endif

#ifdef FRAG

#extension GL_ARB_shader_texture_lod : require

uniform mat4 invViewMatrix;
uniform mat4 invProjectionMatrix;

varying vec3 ecLighPos;
varying vec2 vTexCoord;
uniform sampler2D albedoMap;
uniform sampler2D normalMap;
uniform sampler2D depthMap;
uniform sampler2D occlusionMap;
uniform samplerCube reflectionMap;
uniform sampler2D specularMap;
uniform float ambient;

uniform float fov;
uniform float near;
uniform float far;
uniform float aspectRatio;
uniform vec4 fogColor;
uniform float fogDensity;
uniform float fogStart;
uniform float fogOffset;
uniform float fogForegroundDensity;
uniform float lightBrightness;
uniform float indirectDiffuseEnabled;
uniform float indirectSpecularEnabled;
uniform float directDiffuseEnabled;
uniform float directSpecularEnabled;
uniform float ssaoEnabled;
uniform float fogEnabled;

const float PI = 3.14159265358979323846;

vec3 environmentMap(samplerCube envMap, in vec3 normalIn, in vec3 positionIn, float mipmapIndex) {
  vec3 E = normalize(positionIn); //eye dir
  vec3 R = reflect(E, normalIn); //reflecte vector
  R = vec3(invViewMatrix * vec4(R, 0.0));
  vec3 color = textureCubeLod(envMap, R, mipmapIndex).rgb;
  return color;
}

//From Disney princlpled BRDF
float SchlickFresnel(float u) {
  float m = clamp(1-u, 0, 1);
  float m2 = m*m;
  return m2*m2*m; // pow(m,5)
}

vec3 Fresnel(vec3 specAlbedo, vec3 H, vec3 L) {
  float LdotH = clamp(dot(L, H), 0.0, 1.0);
  return specAlbedo + (1.0f - specAlbedo) * pow((1.0f - LdotH), 5.0f);
}

vec3 getViewRay(vec2 tc) {
  float hfar = 2.0 * tan(fov/2/180.0 * PI) * far;
  float wfar = hfar * aspectRatio;
  vec3 ray = (vec3(wfar * (tc.x - 0.5), hfar * (tc.y - 0.5), -far));
  return ray;
}

//http://mynameismjp.wordpress.com/2010/09/05/position-from-depth-3/
//assumes z = len(ecPos.xyz)
vec3 reconstructPositionFromDepth(vec2 texCoord, float z) {
  vec3 ray = getViewRay(texCoord);
  return normalize(ray) * z;
}

//Problems more sharp metal doesn't get darker

void main() {
  vec3 normal = texture2D(normalMap, vTexCoord).rgb; //assumes rgb = ecNormal.xyz + 0.5
  vec4 albedoValue = texture2D(albedoMap, vTexCoord);
  vec3 albedoColor = pow(albedoValue.rgb, vec3(2.2));
  vec3 specularColor = albedoColor; //for now
  float depth = texture2D(depthMap, vTexCoord).a; //assumes a = len(ecPos.xyz)
  float occlusion = texture2D(occlusionMap, vTexCoord).r;
  vec4 params = texture2D(specularMap, vTexCoord);
  float metallic = params.r;
  float roughness = max(0.02, params.g); //0 - reflective, 1 - matte
  float smoothness = 1.0 - roughness;    //0 - matte, 1 - reflective
  float specular = params.b; //specular reflectance

  vec3 position = reconstructPositionFromDepth(vTexCoord, texture2D(depthMap, vTexCoord).a);

  vec3 N = normalize(normal - 0.5);
  vec3 L = normalize(ecLighPos - position.xyz);
  vec3 V = normalize(-position.xyz);
  vec3 H = normalize(L + V);

  float NdotL = clamp(dot(N, L), 0.0, 1.0);
  float NdotV = clamp(dot(N, V), 0.0, 1.0);
  float LdotH = clamp(dot(L, H), 0.0, 1.0);
  float NdotH = clamp(dot(N, H), 0.0, 1.0);
  float VdotH = clamp(dot(V, H), 0.0, 1.0);

  //albedoColor = vec3(0.2, 0.2, 0.2); //TEMP
  //albedo = vec3(0.0); //TEMP
  vec3 lightColor = vec3(1.0); //TEMP
  float lightDistance = length(ecLighPos - position.xyz);
  float lightRadius = 5.0; //TEMP
  float maxMipMapLevel = 6.0; //most blurry
  vec3 F0 = specularColor;


  //indirect diffuse from IBL
  vec3 envAmbient = environmentMap(reflectionMap, N, position, maxMipMapLevel);
  envAmbient = pow(envAmbient, vec3(4.2)); //correct gamma TEMP: overexposed texture corrected

  //indirect specular from IBL
  vec3 envSpecular = environmentMap(reflectionMap, N, position, (1.0 - (1.0 - roughness) * (1.0 - roughness)) * maxMipMapLevel);
  envSpecular = pow(envSpecular, vec3(4.2)); //correct gamma TEMP: overexposed texture corrected

  //Based on "Real Shading in Unreal Engine 4"
  float lightFalloff = pow(clamp(1.0 - pow(lightDistance/lightRadius, 4.0), 0.0, 1.0), 2.0) / (pow(lightDistance, 2.0) + 1);

  //Indirect diffuse
  vec3 LIndirectDiffuse = mix(albedoColor, envSpecular, metallic) * envAmbient * (1.0 - metallic); //TODO: what's metal color?

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
  float Ddenom = NdotH * NdotH * (aSqr - 1.0) + 1;
  float Dh = aSqr / ( PI * Ddenom * Ddenom);

  //Fresnel Term: Fresnel schlick
  //F(v,h) = F0 + (1 - F0)*(1 - (v.h))^5
  //Linear interpolation between specular color F0 and white
  vec3 Fvh = F0 + (1 - F0) * pow((1 - VdotH), 5.0);

  //Indirect specular
  vec3 LIndirectSpecular = Fvh * specular * envSpecular * NdotL; //TODO: Fresnel * IBLspec(roughness)

  //Visibility Term: Schlick-Smith
  //                                          n.v               (0.8 + 0.5*a)^2
  //G(l,v,h) = G1(l)* G1(v)    G1(v) = -----------------    k = ---------------
  //                                   (n.v) * (1-k) + k               2
  float k = pow(0.8 + 0.5 * a, 2.0) / 2.0;
  float G1l = NdotL / (NdotL * (1.0 - k) + k);
  float G1v = NdotV / (NdotV * (1.0 - k) + k);
  float Glvn = G1l * G1v;

  //Complete Cook-Torrance
  vec3 flv = Dh * Fvh * Glvn / (4 * NdotL * NdotV);

  vec3 LDirectDiffuse = 1.0 / PI * albedoColor * (1.0 - metallic) * lightBrightness * lightColor * lightFalloff * clamp(NdotL, 0.0, 1.0);
  vec3 LDirectSpecualar = vec3(flv) * lightBrightness * lightColor * lightFalloff * clamp(NdotL, 0.0, 1.0);

  vec3 FinalColor = vec3(0.0);
  FinalColor += LIndirectDiffuse * indirectDiffuseEnabled;
  FinalColor += LIndirectSpecular * indirectSpecularEnabled;
  FinalColor += LDirectDiffuse * directDiffuseEnabled;
  FinalColor += LDirectSpecualar * directSpecularEnabled;
  FinalColor = mix(FinalColor, FinalColor * vec3(occlusion), ssaoEnabled); //SSAO

  if (fogEnabled > 0.0) {
    //Fog
    float LOG2 = 1.442695;
    float fogFragCoord = 0;
    float fogFactor;
    if (-position.z < 5.0) {
      fogFragCoord = max(0, length(position) - fogStart + fogOffset);
      fogFactor = exp2(-fogForegroundDensity * fogForegroundDensity * fogFragCoord * fogFragCoord * LOG2);
      fogFactor = clamp(fogFactor, 0.0, 1.0);
      FinalColor = mix(fogColor.rgb, FinalColor, fogFactor);
      //FinalColor = mix(vec3(0.0), FinalColor, fogFactor);
    }
    else {
      fogFragCoord = max(0, length(position) - fogStart);
      fogFactor = exp2(-fogDensity * fogDensity * fogFragCoord * fogFragCoord * LOG2);
      fogFactor = clamp(fogFactor, 0.0, 1.0);
      FinalColor = mix(fogColor.rgb, FinalColor, fogFactor);
    }
  }


  

  //FinalColor += vec3(fogFactor);

  //FinalColor = vec3(metallic);

  

  //FinalColor = vec3(position.z/100.0);
  //else FinalColor = vec3(occlusion);
  //FinalColor *= fogFactor;

  gl_FragColor.rgb = FinalColor;
}

#endif