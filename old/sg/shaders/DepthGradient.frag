varying vec3 wcPosition;

void main_depthGradient(inout vec4 color) {
  float modZ = fract(wcPosition.z/16.0);
  if (modZ > 0.5) modZ = 1.0 - modZ;
  modZ += 0.25;
  modZ *= 1.5;

  float modY = fract(wcPosition.y/4.0);
  if (modY > 0.5) modY = 1.0 - modY;

  float c = modZ - 0.2 * modY;
  color = vec4(vec3(c, c, c), 1.0);
}