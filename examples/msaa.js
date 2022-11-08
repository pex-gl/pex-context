import createContext from "../index.js";

import { loadImage } from "pex-io";
import { cube } from "primitive-geometry";
import { perspective as createCamera, orbiter as createOrbiter } from "pex-cam";

import basicTexturedVert from "./shaders/textured.vert.js";
import screenImageVert from "./shaders/screen-image.vert.js";
import screenImageFrag from "./shaders/screen-image.frag.js";

const devicePixelRatio = 1; //temp

const ctx = createContext({
  pixelRatio: devicePixelRatio,
  debug: true,
  antialias: false,
});

const camera = createCamera({
  fov: Math.PI / 4,
  aspect: ctx.gl.canvas.width / ctx.gl.canvas.height,
  position: [2, 1.2, 2],
});
createOrbiter({ camera, element: ctx.gl.canvas });

ctx.gl.getExtension("EXT_color_buffer_float");

const gl = ctx.gl;

let width = window.innerWidth;
let height = window.innerHeight;

let tex = ctx.texture2D({
  width,
  height,
  pixelFormat: ctx.PixelFormat.RGBA8,
  encoding: ctx.Encoding.SRGB,
  // storage: 1,
  min: ctx.Filter.Linear,
  mag: ctx.Filter.Linear,
});

// Color render buffer
const msRB = ctx.renderbuffer({
  width: width * devicePixelRatio,
  height: height * devicePixelRatio,
  pixelFormat: ctx.PixelFormat.RGBA8,
  msaa: 4,
});

const msDB = ctx.renderbuffer({
  width: width * devicePixelRatio,
  height: height * devicePixelRatio,
  pixelFormat: ctx.PixelFormat.DEPTH_COMPONENT24,
  msaa: 4,
});

// Use a render buffer as pass color attachment
// Pass
const msaaPass = ctx.pass({
  color: [msRB],
  depth: msDB,
  clearColor: [0.2, 0.2, 0.2, 1],
  clearDepth: 1,
});

const captureMsaaCmd = {
  pass: msaaPass,
};

// Resolve frame buffer
const texFB = ctx.framebuffer({
  color: [tex],
});

const resolvePass = ctx.pass({
  // framebuffer: texFB,
  // blit: msaaPass.framebuffer,
  color: [tex],
  clearColor: [1, 0.2, 0.2, 1],
  clearDepth: 1,
});

const msaaAndAutoResolve = ctx.pass({
  // framebuffer: texFB,
  // blit: msaaPass.framebuffer,
  color: [tex],
  depth: depthMap,
  clearColor: [1, 0.2, 0.2, 1],
  clearDepth: 1,
  msaa: 4,
});

const resolveCmd = {
  pass: resolvePass,
};

const geom = cube();

const img = await loadImage(new URL("./assets/checker.jpg", import.meta.url));

const frag = /* glsl */ `
precision highp float;

varying vec2 vTexCoord;
uniform sampler2D uTexture;
void main () {
  gl_FragColor = texture2D(uTexture, vTexCoord);
}
`;
const drawCmd = {
  name: "DrawCmd",
  pipeline: ctx.pipeline({
    vert: basicTexturedVert,
    frag,
    depthTest: true,
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
      min: ctx.Filter.LinearMipmapLinear,
      mag: ctx.Filter.Linear,
      mipmap: true,
      aniso: 16,
    }),
  },
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

ctx.frame(() => {
  ctx.submit(captureMsaaCmd, () => {
    ctx.submit(drawCmd, {
      uniforms: {
        uProjectionMatrix: camera.projectionMatrix,
        uViewMatrix: camera.viewMatrix,
      },
    });
  });

  // ctx.update(texFB, { color: [tex] });

  ctx.submit(resolveCmd, () => {
    gl.bindFramebuffer(gl.READ_FRAMEBUFFER, msaaPass.framebuffer.handle);
    // gl.bindFramebuffer(gl.DRAW_FRAMEBUFFER, texFB.handle);
    gl.blitFramebuffer(
      0,
      0,
      width,
      height,
      0,
      0,
      width,
      height,
      gl.COLOR_BUFFER_BIT,
      gl.NEAREST
    );
  });

  ctx.submit(drawTextureCmd, {
    uniforms: {
      uTexture: tex,
    },
  });

  // TODO: Render to screen
  // gl.bindFramebuffer(gl.FRAMEBUFFER, null);

  ctx.debug(false);

  window.dispatchEvent(new CustomEvent("pex-screenshot"));
});

// const ctxAliased = createContext({
//   pixelRatio: devicePixelRatio,
//   debug: true,
//   antialias: true,
// });

// const drawAliasedCmd = {
//   pass: ctxAliased.pass({
//     clearColor: [0.2, 0.2, 0.2, 1],
//     clearDepth: 1,
//   }),
//   pipeline: ctxAliased.pipeline({
//     vert: basicTexturedVert,
//     frag,
//     depthTest: true,
//   }),
//   attributes: {
//     aPosition: ctxAliased.vertexBuffer(geom.positions),
//     aTexCoord: ctxAliased.vertexBuffer(geom.uvs),
//   },
//   indices: ctxAliased.indexBuffer(geom.cells),
//   uniforms: {
//     uProjectionMatrix: camera.projectionMatrix,
//     uViewMatrix: camera.viewMatrix,
//     uTexture: ctxAliased.texture2D({
//       data: img.data || img,
//       width: img.width,
//       height: img.height,
//       flipY: true,
//       pixelFormat: ctxAliased.PixelFormat.RGBA8,
//       encoding: ctxAliased.Encoding.Linear,
//     }),
//   },
// };

// ctxAliased.frame(() => {
//   ctxAliased.submit(drawAliasedCmd);

//   ctxAliased.debug(false);

//   window.dispatchEvent(new CustomEvent("pex-screenshot"));
// });

const onResize = () => {
  width = window.innerWidth;
  height = window.innerHeight;
  ctx.set({ width, height });
  // ctxAliased.set({ width, height });
  camera.set({ aspect: width / height });

  // No can do, storage texture is immutable
  // ctx.update(tex, { width, height });
  tex = ctx.texture2D({
    width,
    height,
    pixelFormat: ctx.PixelFormat.RGBA8,
    encoding: ctx.Encoding.SRGB,
    storage: 1,
    min: ctx.Filter.Linear,
  });
  ctx.update(texFB, { color: [tex] });
  ctx.update(msRB, {
    width: width * devicePixelRatio,
    height: height * devicePixelRatio,
  });
};
// window.addEventListener("resize", onResize);
// onResize();
