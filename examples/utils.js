export const es300Vertex = (shader) => /* glsl */ `#version 300 es
#define attribute in
#define varying out
${shader}`;

export const es300Fragment = (shader, size = 1) => /* glsl */ `#version 300 es
precision highp float;
#define varying in
#define texture2D texture
#define textureCube texture
#define gl_FragData FragData
#define gl_FragColor gl_FragData[0]
out vec4 FragData[${size}];
${shader}`;

export const viewportToCanvasPosition = (viewport, H, pixelRatio) => [
  viewport[0] / pixelRatio,
  (H * (1 - viewport[1] / H - viewport[3] / H)) / pixelRatio,
];
