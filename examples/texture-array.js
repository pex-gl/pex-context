import createContext from "../index.js";

import { loadImage } from "pex-io";

const W = 640;
const H = 480;
const ctx = createContext({ width: W, height: H, debug: true });

const aspect = W / H;

const data = [
  // { data: new Uint8Array([255, 0, 0, 255]), width: 1, height: 1 },
  // { data: new Uint8Array([0, 255, 0, 255]) },
  // { data: new Uint8Array([0, 0, 255, 255]) },
  // { data: new Uint8Array([255, 0, 0, 255]) },
  // { data: new Uint8Array([0, 255, 0, 255]) },
  // { data: new Uint8Array([0, 0, 255, 255]) },

  await loadImage(new URL("./assets/images/test/test_nx.png", import.meta.url)),
  await loadImage(new URL("./assets/images/test/test_ny.png", import.meta.url)),
  await loadImage(new URL("./assets/images/test/test_nz.png", import.meta.url)),
  await loadImage(new URL("./assets/images/test/test_px.png", import.meta.url)),
  await loadImage(new URL("./assets/images/test/test_py.png", import.meta.url)),
  await loadImage(new URL("./assets/images/test/test_pz.png", import.meta.url)),
];

const textureArray = ctx.texture2DArray(data);

const clearCmd = {
  pass: ctx.pass({
    clearColor: [0.2, 0.2, 0.2, 1],
    clearDepth: 1,
  }),
};

const drawTextureCmd = {
  name: "drawTexture",
  pipeline: ctx.pipeline({
    vert: /* glsl */ `#version 300 es
in vec2 aPosition;
in vec2 aTexCoord;

out vec2 vTexCoord;

void main() {
  vTexCoord = aTexCoord;

  gl_Position = vec4(aPosition, 0.0, 1.0);
}`,
    frag: /* glsl */ `#version 300 es
precision highp float;
precision highp sampler2DArray;

in vec2 vTexCoord;

uniform sampler2DArray uTextureArray;

out vec4 outColor;

void main() {
  vec2 uv = vTexCoord;
  float textureCount = float(textureSize(uTextureArray, 0).z);
  float level = floor(uv.x * textureCount);

  uv.x *= textureCount;
  uv.x -= level;
  uv.y /= ${aspect} / textureCount;

  if (uv.y <= 1.0) {
    outColor = texture(uTextureArray, vec3(uv, level));
  }
}`,
  }),
  attributes: {
    aPosition: ctx.vertexBuffer([
      [-1, -1],
      [1, -1],
      [1, 1],
      [-1, 1],
    ]),
    aTexCoord: ctx.vertexBuffer([
      [0, 0],
      [1, 0],
      [1, 1],
      [0, 1],
    ]),
  },
  indices: ctx.indexBuffer([
    [0, 1, 2],
    [0, 2, 3],
  ]),
  uniforms: {
    uTexture: null,
  },
};

ctx.frame(() => {
  ctx.submit(clearCmd);

  ctx.submit(drawTextureCmd, {
    uniforms: {
      uTextureArray: textureArray,
    },
  });

  ctx.debug(false);

  window.dispatchEvent(new CustomEvent("screenshot"));
});
