#ifdef VERT

attribute vec3 position;
attribute vec2 texCoord;

varying vec2 vTexCoord;

void main() {
  gl_Position = vec4(position, 1.0);
  vTexCoord = gl_Position.xy/gl_Position.w * 0.5 + 0.5;
}

#endif

#ifdef FRAG

uniform mat4 invViewMatrix;
uniform sampler2D albedoMap;
uniform sampler2D normalMap;
uniform sampler2D depthMap;
uniform sampler2D reflectionMap;
uniform sampler2D diffuseMap;
//
//uniform float lightBrightness;
//uniform float lightRadius;
//uniform vec4 lightColor;
//
uniform float intensity;
//
uniform float fov;
uniform float near;
uniform float far;
uniform float aspectRatio;

varying vec2 vTexCoord;

const float PI = 3.14159265358979323846;

vec4 environmentMap(sampler2D envMap, in vec3 normalIn, in vec3 positionIn, in float mipmapIndex) {
  vec3 eyeDir = normalize(-positionIn); //Direction to eye = camPos (0,0,0) - ecPos
  vec3 ecN = normalize(normalIn);
  vec3 ecReflected = reflect(-eyeDir, ecN); //eye coordinates reflection vector
  vec3 wcReflected = vec3(invViewMatrix * vec4(ecReflected, 0.0)); //world coordinates reflection vector

  vec2 texCoord = vec2((1.0 + atan(-wcReflected.z, wcReflected.x)/3.14159265359)/2.0, acos(-wcReflected.y)/3.14159265359);
  return texture2D(envMap, texCoord, mipmapIndex);
}

/*

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

*/

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
  vec3 albedoColor = albedoValue.rgb;

  float roughness = albedoValue.a;

  float depth = readDepth(depthMap, vTexCoord);
  vec3 position = reconstructPositionFromDepth(vTexCoord, depth);

  vec3 ecN = normalize(normal - 0.5);


  //indirect diffuse from IBL
  vec3 envAmbient = environmentMap(diffuseMap, ecN, position, 0.0).rgb;
  envAmbient = pow(envAmbient, vec3(1.0/2.2)); //correct gamma TEMP: overexposed texture corrected
  vec3 envSpecular = environmentMap(reflectionMap, ecN, position, 0.0).rgb;
  envSpecular = pow(envSpecular, vec3(1.0/2.2)); //correct gamma TEMP: overexposed texture corrected


  gl_FragColor.rgb = intensity * albedoColor * mix(envSpecular, envAmbient, roughness);

  /*
  vec3 specularColor = albedoColor; //for now
  //float occlusion = texture2D(occlusionMap, vTexCoord).r;
  float occlusion = 1.0;

  

  
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
  float lightDistance = length(ecLighPos - position.xyz);
  float maxMipMapLevel = 6.0; //most blurry
  vec3 F0 = specularColor;
  float metallic = 0.0;
  //float roughness = 0.9; //0 - reflective, 1 - matte
  float smoothness = 1.0 - roughness;    //0 - matte, 1 - reflective
  float specular = 1.0;

  //indirect diffuse from IBL
  vec3 envAmbient = environmentMap(diffuseMap, N, position, 0.0).rgb;
  //envAmbient = pow(envAmbient, vec3(4.2)); //correct gamma TEMP: overexposed texture corrected
  vec3 envSpecular = environmentMap(reflectionMap, N, position, 0.0).rgb;
  //envSpecular = pow(envSpecular, vec3(4.2)); //correct gamma TEMP: overexposed texture corrected

  //vec3 LIndirectDiffuse = intensity * albedoColor;
  //Indirect diffuse
  //vec3 LIndirectDiffuse = mix(albedoColor, envSpecular, metallic) * envAmbient * (1.0 - metallic); //TODO: what's metal color?
  //vec3 LIndirectDiffuse = mix(albedoColor, envSpecular, metallic) * envAmbient + envAmbient * (1.0 - metallic); //TODO: what's metal color?
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
  float Ddenom = NdotH * NdotH * (aSqr - 1.0) + 1.0;
  float Dh = aSqr / ( PI * Ddenom * Ddenom);

  //Fresnel Term: Fresnel schlick
  //F(v,h) = F0 + (1 - F0)*(1 - (v.h))^5
  //Linear interpolation between specular color F0 and white
  vec3 Fvh = F0 + (1.0 - F0) * pow((1.0 - VdotH), 5.0);

  //Indirect specular
  //vec3 LIndirectSpecular = Fvh * specular * envSpecular * NdotL; //TODO: Fresnel * IBLspec(roughness)
  vec3 LIndirectSpecular = albedoColor * envSpecular * pow((1.0 - roughness), 2.0) * 2.0;

  //LIndirectDiffuse = albedoColor * envSpecular;
  //LIndirectDiffuse = albedoColor * envAmbient;

  //LIndirectDiffuse = vec3(mix(envSpecular, envAmbient, roughness));

  //LIndirectDiffuse = (albedoColor + mix(envSpecular, envAmbient, 1.0 - pow(1.0 - roughness, 2.0))) * intensity;
  //LIndirectDiffuse = albedoColor * mix(envSpecular, envAmbient, 1.0 - pow(1.0 - roughness, 2.0)) * intensity;

  vec3 FinalColor = (LIndirectDiffuse + LIndirectSpecular ) * intensity * occlusion * lightColor.rgb;

  //vec3 wcPos = vec3(invViewMatrix * vec4(position, 1.0));
  //if (length(wcPos) > 200.0) {
  //  vec3 wcN = normalize(wcPos);
  //  vec2 texCoord = vec2((1.0 + atan(-wcN.z, wcN.x)/3.14159265359)/2.0, acos(-wcN.y)/3.14159265359);
  //  FinalColor = texture2D(reflectionMap, texCoord).xyz * intensity;
  //  //FinalColor = normal;
  //}

  //FinalColor *= vec3(0.34509803921568627, 0.11764705882352941, 0.615686274509804);
  //FinalColor = envSpecular;
  //FinalColor = envAmbient;
  //FinalColor = albedoColor;

  //gl_FragColor = vec4(occlusion);

  gl_FragColor.rgb = FinalColor;
  */
}

#endif