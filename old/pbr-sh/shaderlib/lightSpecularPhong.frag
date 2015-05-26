float getLightSpecular(inout FragData data) {
  float glossiness = 1.0 - data.roughness;
  float specPower = pow(2.0, glossiness * 11.0);

  return pow(max(0.0, phong(data.lightDirView, data.eyeDirView, data.normalView)), specPower);
}
