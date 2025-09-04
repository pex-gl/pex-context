import createContext from "../index.js";

import { mat4 } from "pex-math";
import { perspective as createCamera, orbiter as createOrbiter } from "pex-cam";

import { cube, torus } from "primitive-geometry";

import basicVert from "./shaders/basic.vert.js";
import basicTexturedVert from "./shaders/textured.vert.js";
import diffuseFrag from "./shaders/diffuse.frag.js";
import screenImageVert from "./shaders/screen-image.vert.js";
import screenImageFrag from "./shaders/screen-image.frag.js";

const ctx = createContext({ debug: true });

const camera = createCamera({
  fov: Math.PI / 4,
  aspect: 1,
  position: [2, 2, 2],
  near: 0.1,
  far: 50,
});

const halfSquareCamera = createCamera({
  fov: Math.PI / 4,
  aspect: 1 / 2,
  position: [3, 3, 3],
  near: 0.1,
  far: 50,
});

const fullSquareCamera = createCamera({
  fov: Math.PI / 4,
  aspect: 1,
  position: [0, 0, 5],
  near: 0.1,
  far: 50,
});

createOrbiter({ camera, element: ctx.gl.canvas });
createOrbiter({ camera: halfSquareCamera, element: ctx.gl.canvas });

const renderTargetSize = 1024;
const depthMap = ctx.texture2D({
  width: renderTargetSize,
  height: renderTargetSize,
  pixelFormat: ctx.PixelFormat.DEPTH_COMPONENT16,
});

const colorMap = ctx.texture2D({
  width: renderTargetSize,
  height: renderTargetSize,
  pixelFormat: ctx.PixelFormat.RGBA8,
});

const drawToTexture1Cmd = {
  name: "drawPass",
  pass: ctx.pass({
    color: [colorMap],
    depth: depthMap,
    clearColor: [1, 0.5, 0.5, 1],
    clearDepth: 1,
  }),
};

const geom = cube();
const cubeMesh = {
  attributes: {
    aPosition: ctx.vertexBuffer(geom.positions),
    aTexCoord: ctx.vertexBuffer(geom.uvs),
    aNormal: ctx.vertexBuffer(geom.normals),
  },
  indices: ctx.indexBuffer(geom.cells),
};

const drawCube = {
  name: "drawCube",
  pipeline: ctx.pipeline({
    vert: basicVert,
    frag: diffuseFrag,
    depthTest: true,
  }),
  uniforms: {
    uProjectionMatrix: halfSquareCamera.projectionMatrix,
    uViewMatrix: halfSquareCamera.viewMatrix,
    uModelMatrix: mat4.create(),
    uDiffuseColor: [1, 0, 0, 1],
  },
  ...cubeMesh,
};

const torusGeometry = torus({ radius: 1 });
const torusMesh = {
  attributes: {
    aPosition: ctx.vertexBuffer(torusGeometry.positions),
    aTexCoord: ctx.vertexBuffer(torusGeometry.uvs),
    aNormal: ctx.vertexBuffer(torusGeometry.normals),
  },
  indices: ctx.indexBuffer(torusGeometry.cells),
};

const drawTorus = {
  name: "drawTorus",
  pipeline: ctx.pipeline({
    vert: basicVert,
    frag: diffuseFrag,
    depthTest: true,
  }),
  uniforms: {
    uProjectionMatrix: fullSquareCamera.projectionMatrix,
    uViewMatrix: fullSquareCamera.viewMatrix,
    uModelMatrix: mat4.create(),
    uDiffuseColor: [1, 0, 0, 1],
  },
  ...torusMesh,
};

const drawTexturedCubeCmd = {
  pass: ctx.pass({
    clearColor: [0.2, 0.2, 0.2, 1],
  }),
  name: "drawTexturedCube",
  pipeline: ctx.pipeline({
    vert: basicTexturedVert,
    frag: screenImageFrag,
    depthTest: true,
  }),
  uniforms: {
    uProjectionMatrix: camera.projectionMatrix,
    uViewMatrix: camera.viewMatrix,
    uModelMatrix: mat4.create(),
  },
  ...cubeMesh,
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

const clearBlueBgPass = ctx.pass({
  clearColor: [0, 0.3, 1, 1],
});

const clearYellowBgPass = ctx.pass({
  clearColor: [1, 1, 0.2, 1],
});

const clearDepthPass = ctx.pass({
  clearDepth: 1,
});

const onResize = () => {
  const W = window.innerWidth;
  const H = window.innerHeight;
  ctx.set({ width: W, height: H });
  camera.set({ aspect: W / H });
};
window.addEventListener("resize", onResize);
onResize();

ctx.frame(() => {
  const s = renderTargetSize;

  const leftHalfView = {
    pass: clearBlueBgPass,
    viewport: [0, 0, s / 2, s],
    scissor: [0, 0, s / 2, s],
  };

  const rightHalfView = {
    pass: clearYellowBgPass,
    viewport: [s / 2, 0, s / 2, s],
    scissor: [s / 2, 0, s / 2, s],
  };

  const fullView = {
    pass: clearDepthPass,
    viewport: [0, 0, s, s],
    scissor: [0, 0, s, s],
  };

  ctx.submit(drawToTexture1Cmd, () => {
    ctx.submit(leftHalfView, () => {
      ctx.submit(drawCube);
    });
    ctx.submit(rightHalfView, () => {
      ctx.submit(drawCube, {
        uniforms: {
          uDiffuseColor: [0, 1, 0, 1],
        },
      });
    });
    ctx.submit(fullView, () => {
      ctx.submit(drawTorus, {
        uniforms: {
          uDiffuseColor: [1, 0, 1, 1],
        },
      });
    });
  });

  ctx.submit(drawTexturedCubeCmd, {
    uniforms: {
      uTexture: colorMap,
      uProjectionMatrix: camera.projectionMatrix,
    },
  });
  ctx.submit(drawTextureCmd, {
    uniforms: {
      uTexture: colorMap,
    },
    viewport: [0, 0, 256, 256],
  });
  ctx.submit(drawTextureCmd, {
    uniforms: {
      uTexture: depthMap,
    },
    viewport: [256, 0, 256, 256],
  });

  ctx.debug(false);

  window.dispatchEvent(new CustomEvent("screenshot"));
});
