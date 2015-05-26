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
uniform vec4 baseColor;

uniform float fov;
uniform float near;
uniform float far;
uniform float aspectRatio;

const float PI = 3.14159265358979323846;

void environmentMap(samplerCube envMap, in vec3 normalIn, in vec3 positionIn, out vec4 colorOut, float mipmapIndex) {
  vec3 V = normalize(positionIn); //eye dir
  vec3 R = reflect(V, normalIn); //reflecte vector
  R = vec3 (invViewMatrix * vec4(R, 0.0));
  colorOut = textureCubeLod(envMap, R, mipmapIndex);
  //colorOut = textureCube(envMap, R);
  colorOut = pow(colorOut, vec4(2.2));
}

float SchlickFresnel(float u) {
  float m = clamp(1-u, 0, 1);
  float m2 = m*m;
  return m2*m2*m; // pow(m,5)
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

//hoffman'10
void main() {
  vec3 normal = texture2D(normalMap, vTexCoord).rgb; //assumes rgb = ecNormal.xyz + 0.5
  vec4 albedoValue = texture2D(albedoMap, vTexCoord);
  vec3 albedo = pow(albedoValue.rgb, vec3(2.2));
  albedo = pow(baseColor.rgb, vec3(2.2));
  float depth = texture2D(depthMap, vTexCoord).a; //assumes a = len(ecPos.xyz)
  float occlusion = texture2D(occlusionMap, vTexCoord).r;
  vec4 params = texture2D(specularMap, vTexCoord);
  float metallic = params.r;
  float roughness = max(0.05, params.g);
  if (params.a > 0) {
    //texture
    roughness = max(0.05, 1.0 - params.g);
  }

  vec3 position = reconstructPositionFromDepth(vTexCoord, texture2D(depthMap, vTexCoord).a);

  vec3 N = normalize(normal - 0.5);
  vec3 L = normalize(ecLighPos - position.xyz);
  vec3 V = normalize(-position.xyz);
  vec3 H = normalize(L + V);
  if (params.b < 0) {
    //N = normalize(position);
    vec3 R = reflect(-V, N);
    R = (invViewMatrix * vec4(R, 1.0)).xyz;
    R = normalize(R);
    R = normalize(position);
    R = (invViewMatrix * vec4(R, 0.0)).xyz;
    R = normalize(R);
    gl_FragColor = pow(textureCubeLod(reflectionMap, R, 4.0), vec4(4.2));
    return;
  }

  float NdotL = clamp(dot(N, L), 0.0, 1.0);
  float NdotV = clamp(dot(N, V), 0.0, 1.0);
  float NdotH = clamp(dot(N, H), 0.0, 1.0);
  float HdotL = clamp(dot(H, L), 0.0, 1.0);

  vec3 color = vec3(0.0, 0.0, 0.0);

  //ambient diffuse IBL
  vec4 ambientColor;
  environmentMap(reflectionMap, N, position.xyz, ambientColor, 6.0);
  ambientColor = pow(ambientColor, vec4(2.2));

  //specular IBL
  vec4 reflectionColor;
  environmentMap(reflectionMap, N, position.xyz, reflectionColor, 8.0 * roughness);
  reflectionColor = pow(reflectionColor, vec4(2.2));

  //albedo = mix(albedo.rgb, albedo + reflectionColor.rgb, metallic);
  albedo = mix(albedo.rgb, albedo + reflectionColor.rgb, metallic);

  color += ambientColor.rgb * albedo;

  //https://github.com/larsbertram69/Lux/blob/master/Lux%20Shader/LuxCore/LuxLightingAmbient.cginc
  //http://seblagarde.wordpress.com/2011/08/17/hello-world/
  vec3 specularIBL = reflectionColor.rgb;
  //vec3 specularColor = vec3(0.1, 0.1, 0.1);

  vec3 specularColor = mix(0.5 * vec3(1.0), albedo, metallic);

  float OneOnLN2_x6 = 8.656170;
  //vec3 fresnelSchlickWithRoughness = specularColor + ( max(vec3(specular), specularColor ) - specularColor) * exp2(-OneOnLN2_x6 * NdotV);
  //read more about it here and do it properly http://renderwonk.com/publications/s2010-shading-course/hoffman/s2010_physically_based_shading_hoffman_b_notes.pdf
  vec3 fresnelSchlickWithRoughness = vec3(SchlickFresnel(NdotV));
  specularIBL *= fresnelSchlickWithRoughness * (1.0 - metallic);

  //add diffuse and specular while pereserving energy
  color = (1.0 - specularIBL) * color + specularIBL;


  //fog exp2
  float camDist = length(position.xyz);
  float fogDensity = 0.0; //0.2; //disable fog for now
  float f = camDist * fogDensity;
  float fogFactor = clamp(1 / pow(2.71828,  f * f), 0.0, 1.0);
  vec3 fogColor = vec3(0.2);
  color = mix(fogColor, color, fogFactor);

  vec3 lightColor = vec3(1.0);
  float atten = 0.5;

  //https://github.com/larsbertram69/Lux/blob/master/Lux%20Shader/LuxCore/LuxLightingDirect.cginc
  //blinn phong
  /*
  float specPower = reflectivity;
  //float spec = ((specPower + 2.0) * 0.125 ) * pow(NdotH, specPower) * NdotL;
  float spec = specPower * 0.125 * pow(NdotH, specPower);

  //Visibility: Schlick-Smith
  float alpha = 2.0 / sqrt( PI * (specPower + 2) );
  float visibility = 1.0 / ( (NdotL * (1 - alpha) + alpha) * ( NdotV * (1 - alpha) + alpha));
  spec *= visibility;
  */

  //Cook Torrrence like
  //from The Order 1886 // http://blog.selfshadow.com/publications/s2013-shading-course/rad/s2013_pbs_rad_notes.pdf
  float alpha = roughness; // alpha is roughness
  alpha *= alpha;
  float alpha2 = alpha * alpha;

  //Specular Normal Distribution Function: GGX Trowbridge Reitz
  float denominator = (NdotH * NdotH) * (alpha2 - 1) + 1;
  denominator = PI * denominator * denominator;
  float spec = alpha2 / denominator;

  //Geometric Shadowing: Smith
  float V_ONE = NdotL + sqrt(alpha2 + (1 - alpha2) * NdotL * NdotL );
  float V_TWO = NdotV + sqrt(alpha2 + (1 - alpha2) * NdotV * NdotV );
  spec /= V_ONE * V_TWO;

  //Fresnel: Schlick
  // fast fresnel approximation:
  vec3 fresnel = specularColor + ( 1.0 - specularColor) * exp2(-OneOnLN2_x6 * HdotL);
  // from here on we use fresnel instead of spec as it is fixed3 = color
  fresnel *= spec;

  // Final Composition
  // we only use fresnel here / and apply late dotNL

  color += (albedo + fresnel) * (1-metallic) * lightColor * NdotL * (atten * 2);

  //ambient occlusion
  color *= vec3(occlusion);

  //output final
  gl_FragColor.rgb = color;
  gl_FragColor.a = 1.0;
  if (depth < near) {
    gl_FragColor *= 0.0;
  }
}

#endif