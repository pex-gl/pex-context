import createContext from "../index.js";

import baboon from "baboon-image-uri";
import { loadImage } from "pex-io";

import screenImageVert from "./shaders/screen-image.vert.js";
import screenImageFrag from "./shaders/screen-image.frag.js";

const ctx = createContext({ debug: true });

const baboonTex = ctx.texture2D({
  data: await loadImage(baboon),
  flipY: true,
});

const redPipeline = ctx.pipeline({
  vert: screenImageVert,
  frag: screenImageFrag,
  colorMask: [true, false, false, true],
});

const greenPipeline = ctx.pipeline({
  vert: screenImageVert,
  frag: screenImageFrag,
  colorMask: [false, true, false, true],
});

const bluePipeline = ctx.pipeline({
  vert: screenImageVert,
  frag: screenImageFrag,
  colorMask: [false, false, true, true],
});

const drawTextureCmd = {
  name: "drawTexture",
  pipeline: ctx.pipeline({
    vert: screenImageVert,
    frag: screenImageFrag,
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

const clearScreenCmd = {
  name: "clearScreen",
  pass: ctx.pass({
    clearColor: [0.2, 0.2, 0.2, 1],
  }),
};

const onResize = () => {
  ctx.set({ width: window.innerWidth, height: window.innerHeight });
};
window.addEventListener("resize", onResize);
onResize();

ctx.frame(() => {
  const w = ctx.width;
  const h = ctx.height;
  const size = Math.floor(w / 4);

  ctx.submit(clearScreenCmd);

  ctx.submit(drawTextureCmd, {
    viewport: [0, h * 0.5 - size * 0.5, size, size],
    pipeline: redPipeline,
    uniforms: {
      uTexture: baboonTex,
    },
  });
  ctx.submit(drawTextureCmd, {
    viewport: [size, h * 0.5 - size * 0.5, size, size],
    pipeline: greenPipeline,
    uniforms: {
      uTexture: baboonTex,
    },
  });
  ctx.submit(drawTextureCmd, {
    viewport: [size * 2, h * 0.5 - size * 0.5, size, size],
    pipeline: bluePipeline,
    uniforms: {
      uTexture: baboonTex,
    },
  });
  ctx.submit(drawTextureCmd, {
    viewport: [size * 3, h * 0.5 - size * 0.5, size, size],
    uniforms: {
      uTexture: baboonTex,
    },
  });

  ctx.debug(false);

  window.dispatchEvent(new CustomEvent("pex-screenshot"));
});
