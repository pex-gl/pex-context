import createContext from "../index.js";

import { mat4 } from "pex-math";
import { perspective as createCamera, orbiter as createOrbiter } from "pex-cam";

import { cube } from "primitive-geometry";

import basicVert from "./shaders/basic.vert.js";
import showNormalsMRTFrag from "./shaders/show-normals-mrt.frag.js";
import screenImageVert from "./shaders/screen-image.vert.js";
import screenImageFrag from "./shaders/screen-image.frag.js";
import { es300Fragment, es300Vertex } from "./utils.js";

const ctx = createContext({ debug: true });

const camera = createCamera({
  fov: Math.PI / 4,
  aspect: 1,
  position: [3, 3, 3],
  near: 0.1,
  far: 50,
});

createOrbiter({ camera, element: ctx.gl.canvas });

const depthMapSize = 1024;
const depthMap = ctx.texture2D({
  width: depthMapSize,
  height: depthMapSize,
  pixelFormat: ctx.PixelFormat.DEPTH_COMPONENT16,
  encoding: ctx.Encoding.Linear,
});
const colorMap = ctx.texture2D({
  width: depthMapSize,
  height: depthMapSize,
  pixelFormat: ctx.PixelFormat.RGBA8,
  encoding: ctx.Encoding.SRGB,
});
const normalMap = ctx.texture2D({
  width: depthMapSize,
  height: depthMapSize,
  pixelFormat: ctx.PixelFormat.RGBA8,
  encoding: ctx.Encoding.Linear,
});
const colorMap2 = ctx.texture2D({
  width: depthMapSize / 2,
  height: depthMapSize / 2,
  pixelFormat: ctx.PixelFormat.RGBA8,
  encoding: ctx.Encoding.SRGB,
});

const clearScreenCmd = {
  name: "clearScreen",
  pass: ctx.pass({
    clearColor: [0.2, 0.2, 0.2, 1],
  }),
};
const drawPassCmd = {
  name: "drawPass",
  pass: ctx.pass({
    color: [colorMap, normalMap],
    depth: depthMap,
    clearColor: [1, 0, 0, 1],
    clearDepth: 1,
  }),
};
const drawPass2Cmd = {
  name: "drawPass2",
  pass: ctx.pass({
    color: [colorMap2],
    clearColor: [0, 0, 1, 1],
    clearDepth: 1,
  }),
};

const floor = cube({ sx: 2, sy: 0.1, sz: 2 });

const drawFloorCmd = {
  name: "drawFloor",
  pipeline: ctx.pipeline({
    vert: ctx.capabilities.isWebGL2 ? es300Vertex(basicVert) : basicVert,
    frag: ctx.capabilities.isWebGL2
      ? es300Fragment(showNormalsMRTFrag, 2)
      : /* glsl */ `
#ifdef GL_EXT_draw_buffers
  #extension GL_EXT_draw_buffers : require
#endif
${showNormalsMRTFrag}
`,
    depthTest: true,
  }),
  uniforms: {
    uProjectionMatrix: camera.projectionMatrix,
    uViewMatrix: camera.viewMatrix,
    uModelMatrix: mat4.create(),
  },
  attributes: {
    aPosition: ctx.vertexBuffer(floor.positions),
    aNormal: ctx.vertexBuffer(floor.normals),
  },
  indices: ctx.indexBuffer(floor.cells),
};

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

const onResize = () => {
  const W = window.innerWidth;
  const H = window.innerHeight;
  ctx.set({ width: W, height: H });
};
window.addEventListener("resize", onResize);
onResize();

ctx.frame(() => {
  const size = window.innerWidth / 4;
  ctx.submit(clearScreenCmd);
  ctx.submit(drawPassCmd, () => {
    ctx.submit(drawFloorCmd);
  });

  ctx.submit(drawPass2Cmd, () => {
    ctx.submit(drawFloorCmd);
  });

  ctx.submit(drawTextureCmd, {
    uniforms: {
      uTexture: colorMap,
    },
    viewport: [0, 0, size, size],
  });
  ctx.submit(drawTextureCmd, {
    uniforms: {
      uTexture: normalMap,
    },
    viewport: [size, 0, size, size],
  });
  ctx.submit(drawTextureCmd, {
    uniforms: {
      uTexture: colorMap2,
    },
    viewport: [size * 2, 0, size, size],
  });
  ctx.submit(drawTextureCmd, {
    uniforms: {
      uTexture: depthMap,
    },
    viewport: [size * 3, 0, size, size],
  });

  ctx.debug(false);

  window.dispatchEvent(new CustomEvent("pex-screenshot"));
});
