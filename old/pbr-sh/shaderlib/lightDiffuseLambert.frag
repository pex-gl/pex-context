float getLightDiffuse(inout FragData data) {
  return lambert(data.normalView, data.lightDirView);
}
