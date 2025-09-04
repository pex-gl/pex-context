import createContext from "../index.js";

import { loadImage } from "pex-io";
import { perspective as createCamera, orbiter as createOrbiter } from "pex-cam";

import { cube } from "primitive-geometry";

import basicTexturedVert from "./shaders/textured.vert.js";

const ctx = createContext({ debug: true });

const camera = createCamera({
  fov: Math.PI / 4,
  aspect: ctx.gl.canvas.width / ctx.gl.canvas.height,
  position: [3, 3, 3],
});

createOrbiter({ camera, element: ctx.gl.canvas });

const geom = cube();

const img = await loadImage(
  new URL("./assets/images/pex.png", import.meta.url)
);

const drawCmd = {
  pass: ctx.pass({
    clearColor: [0.2, 0.2, 0.2, 1],
    clearDepth: 1,
  }),
  pipeline: ctx.pipeline({
    vert: basicTexturedVert,
    frag: /* glsl */ `
      precision highp float;

      varying vec2 vTexCoord;
      uniform sampler2D uTexture;
      void main () {
        gl_FragColor = texture2D(uTexture, vTexCoord) * 0.7 + 0.3 * vec4(vTexCoord, 0.0, 1.0);
      }
    `,
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
    }),
  },
};

ctx.frame(() => {
  ctx.submit(drawCmd);

  ctx.debug(false);

  window.dispatchEvent(new CustomEvent("screenshot"));
});
