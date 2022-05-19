import { vec3 } from "pex-math";

export const es300Vertex = (shader) => /* glsl */ `#version 300 es
#define attribute in
#define varying out
${shader}`;

export const es300Fragment = (shader, size = 1) => /* glsl */ `#version 300 es
precision highp float;
#define varying in
#define texture2D texture
#define gl_FragData FragData
#define gl_FragColor gl_FragData[0]
out vec4 FragData[${size}];
${shader}`;

export function splitVertices(positions, cells) {
  const splitPositions = new Float32Array((positions.length / 2) * 3);

  for (let i = 0; i < cells.length; i += 3) {
    const face = [cells[i], cells[i + 1], cells[i + 2]];

    for (let j = 0; j < face.length; j++) {
      splitPositions[(i + j) * 3] = positions[face[j] * 3];
      splitPositions[(i + j) * 3 + 1] = positions[face[j] * 3 + 1];
      splitPositions[(i + j) * 3 + 2] = positions[face[j] * 3 + 2];
    }
  }

  return {
    positions: splitPositions,
    cells: new cells.constructor(cells.map((_, i) => i)),
  };
}

export function computeNormals(positions, cells) {
  const normals = [];

  const count = [];
  const ab = [0, 0, 0];
  const ac = [0, 0, 0];
  const n = [0, 0, 0];

  for (let fi = 0; fi < cells.length / 3; fi++) {
    const f = cells.slice(fi * 3, fi * 3 + 3);
    const a = positions.slice(f[0] * 3, f[0] * 3 + 3);
    const b = positions.slice(f[1] * 3, f[1] * 3 + 3);
    const c = positions.slice(f[2] * 3, f[2] * 3 + 3);

    vec3.normalize(vec3.sub(vec3.set(ab, b), a));
    vec3.normalize(vec3.sub(vec3.set(ac, c), a));
    vec3.normalize(vec3.cross(vec3.set(n, ab), ac));

    for (let i = 0; i < f.length; i++) {
      if (!normals[f[i]]) {
        normals[f[i]] = [0, 0, 0];
      }

      vec3.add(normals[f[i]], n);
      count[f[i]] = count[f[i]] ? 1 : count[f[i]] + 1;
    }
  }

  for (let i = 0; i < normals.length; i++) {
    if (normals[i]) {
      vec3.normalize(normals[i]);
    } else {
      normals[i] = [0, 1, 0];
    }
  }

  return Float32Array.from(normals.flat());
}
