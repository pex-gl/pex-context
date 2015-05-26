void transform(inout VertData data) {
  data.positionWorld = vec3(modelWorldMatrix * vec4(data.positionVertex, 1.0));
  data.positionView = vec3(modelViewMatrix * vec4(data.positionVertex, 1.0));
  data.positionProj = projectionMatrix * modelViewMatrix * vec4(data.positionVertex, 1.0);
  data.normalView = vec3(normalMatrix * vec4(data.normalVertex, 1.0));
  data.normalWorld = vec3(invViewMatrix * vec4(data.normalView, 0.0));
}
