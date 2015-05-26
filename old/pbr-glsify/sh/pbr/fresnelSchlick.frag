/*
//thi-ng shadergraph
float schlick(float r0, float smooth, vec3 normal, vec3 view) {
  float d = clamp(1.0f - dot(normal, -view), 0.0f, 1.0f);
  float d2 = d * d;
  return mix(r0, 1.0, smooth * d2 * d2 * d);
}
*/

/*
//disney principled brdf
float SchlickFresnel(float u) {
  float m = clamp(1-u, 0, 1);
  float m2 = m*m;
  return m2*m2*m; // pow(m,5)
}
vec3 fresnelSchlickWithRoughness = vec3(SchlickFresnel(NdotV));
specularIBL *= fresnelSchlickWithRoughness * (1.0 - metallic);
*/

/*
//playcanvas
// Schlick's approximation
uniform float material_fresnelFactor; // unused
void getFresnel(inout psInternalData data) {
    float fresnel = 1.0 - max(dot(data.normalW, data.viewDirW), 0.0);
    float fresnel2 = fresnel * fresnel;
    fresnel *= fresnel2 * fresnel2;
    fresnel *= data.glossiness * data.glossiness;
    data.specularity = data.specularity + (1.0 - data.specularity) * fresnel;
}
*/

void getFresnel(inout FragData data) {
  float glossiness = 1.0 - data.roughness;
  float NdotV = max(0.0, dot(data.normalView, data.eyeDirView));
  float d = 1.0 - NdotV;
  float d2 = d * d;
  float fresnel = d2 * d2 * d * glossiness; //TODO: glossiness^2 like in Unreal Engine?
  data.specularity = data.specularity + (1.0 - data.specularity) * fresnel;
}

#pragma glslify: export(getFresnel)