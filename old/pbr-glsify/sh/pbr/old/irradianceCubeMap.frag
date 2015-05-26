uniform samplerCube irradianceMap;

#define LOD_ENABLED

#ifdef LOD_ENABLED
#ifdef WEBGL
  #extension GL_EXT_shader_texture_lod : require
#else
  #extension GL_ARB_shader_texture_lod : require
#endif
#endif

void getIrradiance(inout FragData data) {
  data.irradianceColor = textureCubeLod(irradianceMap, fixSeams(data.normalWorld, 0.0), 0.0).rgb;
}
