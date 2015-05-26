  gl_Position = data.positionProj;
  vPosition = position;
  vPositionView = data.positionView;
  vPositionWorld = data.positionWorld;
  vNormal = normal;
  vNormalView = data.normalView;
  vNormalWorld = data.normalWorld;
  vTexCoord = data.texCoord;

  vLightPosView = vec3(viewMatrix * vec4(lightPos, 1.0));
}