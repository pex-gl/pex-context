//Based on: https://stackoverflow.com/questions/47934444/webgl-framebuffer-multisampling
import createContext from "../index.js";

import { perspective as createCamera, orbiter as createOrbiter } from "pex-cam";

import { cube } from "primitive-geometry";
import { loadImage } from "pex-io";

import screenImageVert from "./shaders/screen-image.vert.js";
import screenImageFrag from "./shaders/screen-image.frag.js";
import basicTexturedVert from "./shaders/textured.vert.js";

const ctx = createContext({
  debug: true,
  pixelRatio: devicePixelRatio,
  antialias: false,
});
const gl = ctx.gl;

const geom = cube();
const camera = createCamera({
  position: [1, 0.6, 1],
  fov: Math.PI / 3,
});
createOrbiter({ camera });

const clearCmd = {
  pass: ctx.pass({
    clearColor: [0.2, 0.2, 0.2, 1],
    clearDepth: 1,
  }),
};

let firstFrame = true;
let depthMap;
let colorMap;
let capturePassCmd;
let blitPassCmd;
let multisampledFbo;

function initTextures() {
  const w = ctx.gl.canvas.width;
  const h = ctx.gl.canvas.height;
  depthMap = ctx.texture2D({
    width: w,
    height: h,
    pixelFormat: ctx.PixelFormat.DEPTH_COMPONENT24,
    encoding: ctx.Encoding.Linear,
  });
  colorMap = ctx.texture2D({
    width: w,
    height: h,
    pixelFormat: ctx.PixelFormat.RGBA8,
    encoding: ctx.Encoding.SRGB,
  });

  capturePassCmd = {
    name: "drawPass",
    pass: ctx.pass({
      color: [colorMap],
      depth: depthMap,
      clearColor: [0, 0, 0, 1],
      clearDepth: 1,
    }),
  };

  blitPassCmd = {
    name: "blitPass",
    pass: ctx.pass({
      color: [colorMap],
      clearColor: [0, 0, 0, 1],
      clearDepth: 1,
    }),
  };

  const fb = gl.createFramebuffer();
  const colorRenderbuffer = gl.createRenderbuffer();

  gl.bindRenderbuffer(gl.RENDERBUFFER, colorRenderbuffer);
  gl.renderbufferStorageMultisample(
    gl.RENDERBUFFER,
    gl.getParameter(gl.MAX_SAMPLES),
    gl.RGBA8,
    w,
    h
  );
  console.log("MAX_SAMPLES", gl.getParameter(gl.MAX_SAMPLES));
  const depthRenderbuffer = gl.createRenderbuffer();
  gl.bindRenderbuffer(gl.RENDERBUFFER, depthRenderbuffer);
  gl.renderbufferStorageMultisample(
    gl.RENDERBUFFER,
    gl.getParameter(gl.MAX_SAMPLES),
    gl.DEPTH_COMPONENT24,
    w,
    h
  );
  gl.bindFramebuffer(gl.FRAMEBUFFER, fb);
  gl.framebufferRenderbuffer(
    gl.FRAMEBUFFER,
    gl.COLOR_ATTACHMENT0,
    gl.RENDERBUFFER,
    colorRenderbuffer
  );
  gl.framebufferRenderbuffer(
    gl.FRAMEBUFFER,
    gl.DEPTH_ATTACHMENT,
    gl.RENDERBUFFER,
    depthRenderbuffer
  );
  // using texture is not working
  // gl.framebufferTexture2D(
  //   gl.FRAMEBUFFER,
  //   gl.DEPTH_ATTACHMENT,
  //   depthMap.target,
  //   depthMap.handle,
  //   0
  // );
  multisampledFbo = fb;
}
const frag = /* glsl */ `
precision highp float;

varying vec2 vTexCoord;
uniform sampler2D uTexture;
void main () {
  gl_FragColor = texture2D(uTexture, vTexCoord);
}
`;
const img = await loadImage(new URL("./assets/checker.jpg", import.meta.url));

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

const drawCmd = {
  pipeline: ctx.pipeline({
    depthTest: true,
    vert: basicTexturedVert,
    frag,
  }),
  attributes: {
    aPosition: ctx.vertexBuffer(geom.positions),
    aTexCoord: ctx.vertexBuffer(geom.uvs),
  },
  indices: ctx.indexBuffer(geom.cells),
  uniforms: {
    uProjectionMatrix: camera.projectionMatrix,
    uViewMatrix: camera.viewMatrix,
    uTexture: ctx.texture2D({
      data: img.data || img,
      width: img.width,
      height: img.height,
      flipY: true,
      pixelFormat: ctx.PixelFormat.RGBA8,
      encoding: ctx.Encoding.Linear,
    }),
  },
};

const onResize = () => {
  const W = window.innerWidth;
  const H = window.innerHeight;
  ctx.set({ width: W, height: H });
  camera.set({ aspect: W / H });
};
window.addEventListener("resize", onResize);
onResize();

ctx.frame(() => {
  if (firstFrame) {
    firstFrame = false;
    initTextures();
  }

  //capture
  gl.bindFramebuffer(gl.FRAMEBUFFER, multisampledFbo);
  ctx.submit(clearCmd);

  ctx.submit(drawCmd, {
    uniforms: {
      uProjectionMatrix: camera.projectionMatrix,
      uViewMatrix: camera.viewMatrix,
    },
  });

  ctx.submit(blitPassCmd, () => {
    gl.bindFramebuffer(gl.READ_FRAMEBUFFER, multisampledFbo);
    gl.clearBufferfv(gl.COLOR, 0, [1.0, 1.0, 1.0, 1.0]);
    gl.blitFramebuffer(
      0,
      0,
      colorMap.width,
      colorMap.height,
      0,
      0,
      colorMap.width,
      colorMap.height,
      gl.COLOR_BUFFER_BIT,
      gl.LINEAR
    );
  });

  ctx.submit(drawTextureCmd, {
    uniforms: {
      uTexture: colorMap,
    },
    viewport: [0, 0, ctx.gl.canvas.width, ctx.gl.canvas.height],
  });

  ctx.debug(false);

  window.dispatchEvent(new CustomEvent("screenshot"));
});
