mat4 transposeMat2(mat4 m) {
  return mat4(
    m[0][0], m[1][0], m[2][0], m[3][0],
    m[0][1], m[1][1], m[2][1], m[3][1],
    m[0][2], m[1][2], m[2][2], m[3][2],
    m[0][3], m[1][3], m[2][3], m[3][3]
  );
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
    return transposeMat2(
        mat4(
            1.0 - (yy + zz), xy - wz, xz + wy, 0.0,
            xy + wz, 1.0 - (xx + zz), yz - wx, 0.0,
            xz - wy, yz + wx, 1.0 - (xx + yy), 0.0,
            0.0, 0.0, 0.0, 1.0
        )
    );
}

#pragma glslify: export(quatToMat4)
