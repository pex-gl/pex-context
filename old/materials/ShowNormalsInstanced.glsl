#ifdef VERT

uniform mat4 projectionMatrix;
uniform mat4 modelViewMatrix;
uniform mat4 normalMatrix;
uniform float pointSize;
attribute vec3 position;
attribute vec3 normal;
attribute vec3 offset;
attribute vec4 rotation; //quat

mat4 rotationMatrix(vec3 axis, float angle) {
    axis = normalize(axis);
    float s = sin(angle);
    float c = cos(angle);
    float oc = 1.0 - c;

    return mat4(oc * axis.x * axis.x + c,           oc * axis.x * axis.y - axis.z * s,  oc * axis.z * axis.x + axis.y * s,  0.0,
                oc * axis.x * axis.y + axis.z * s,  oc * axis.y * axis.y + c,           oc * axis.y * axis.z - axis.x * s,  0.0,
                oc * axis.z * axis.x - axis.y * s,  oc * axis.y * axis.z + axis.x * s,  oc * axis.z * axis.z + c,           0.0,
                0.0,                                0.0,                                0.0,                                1.0);
}

mat4 quatToMat4(vec4 q) {
  float xs = q.x + q.x;
  float ys = q.y + q.y;
  float zs = q.z + q.z;
  float wx = q.w * xs;
  float wy = q.w * ys;
  float wz = q.w * zs;
  float xx = q.x * xs;
  float xy = q.x * ys;
  float xz = q.x * zs;
  float yy = q.y * ys;
  float yz = q.y * zs;
  float zz = q.z * zs;
  return transpose(mat4(1 - (yy + zz), xy - wz, xz + wy, 0, xy + wz, 1 - (xx + zz), yz - wx, 0, xz - wy, yz + wx, 1 - (xx + yy), 0, 0, 0, 0, 1));
}

varying vec4 vColor;
void main() {
  mat4 rot = quatToMat4(rotation);
  vec4 pos = rot * vec4(position, 1.0);
  gl_Position = projectionMatrix * modelViewMatrix * vec4(pos.xyz + offset, 1.0);
  gl_PointSize = pointSize;
  vec3 N = normalize((normalMatrix * vec4(normal, 1.0)).xyz);
  vColor = vec4(N * 0.5 + 0.5, 1.0);

  //vColor.rgb += offset;
}

#endif

#ifdef FRAG

varying vec4 vColor;

void main() {
  gl_FragColor = vColor;
}

#endif
