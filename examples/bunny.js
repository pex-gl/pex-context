import createContext from "../index.js";

import { vec3, mat4 } from "pex-math";
import { perspective as createCamera, orbiter as createOrbiter } from "pex-cam";
import random from "pex-random";
import createGUI from "pex-gui";

import { cube } from "primitive-geometry";
import centerAndNormalize from "geom-center-and-normalize";
import { vertexNormals } from "normals";
import bunny from "bunny";

import basicMVP from "./shaders/basic-mvp.vert.js";
import basicFrag from "./shaders/basic.frag.js";
import shadowMappedVert from "./shaders/shadow-mapped.vert.js";
import shadowMappedFrag from "./shaders/shadow-mapped.frag.js";
import screenImageVert from "./shaders/screen-image.vert.js";
import screenImageFrag from "./shaders/screen-image.frag.js";

const ctx = createContext({ debug: true });
const gui = createGUI(ctx);
gui.addFPSMeeter();
gui.addStats();

let elapsedSeconds = 0;
let prevTime = Date.now();

const camera = createCamera({
  fov: Math.PI / 4,
  aspect: ctx.gl.canvas.width / ctx.gl.canvas.height,
  position: [3, 3, 3],
});

createOrbiter({ camera, element: ctx.gl.canvas });

const lightCamera = createCamera({
  fov: Math.PI / 4,
  aspect: 1,
  near: 1,
  far: 50,
  position: [7, 4, 7],
});

// Draw
const depthMapSize = 1024;
const depthMap = ctx.texture2D({
  width: depthMapSize,
  height: depthMapSize,
  pixelFormat: ctx.PixelFormat.DEPTH_COMPONENT24,
  encoding: ctx.Encoding.Linear,
});
const colorMap = ctx.texture2D({
  width: depthMapSize,
  height: depthMapSize,
  pixelFormat: ctx.PixelFormat.RGBA8,
  encoding: ctx.Encoding.SRGB,
});

const depthPassCmd = {
  name: "depthPass",
  pass: ctx.pass({
    color: [colorMap],
    depth: depthMap,
    clearColor: [0, 0, 0, 1],
    clearDepth: 1,
  }),
};

const clearCmd = {
  pass: ctx.pass({
    clearColor: [0.2, 0.2, 0.2, 1],
    clearDepth: 1,
  }),
};

// Floor
const floor = cube({ sx: 4, sy: 0.1, sz: 4 });
const floorAttributes = {
  attributes: {
    aPosition: ctx.vertexBuffer(floor.positions),
    aNormal: ctx.vertexBuffer(floor.normals),
  },
  indices: ctx.indexBuffer(floor.cells),
};

const shadowMappedPipeline = ctx.pipeline({
  vert: shadowMappedVert,
  frag: shadowMappedFrag,
  depthTest: true,
});

const drawDepthPipeline = ctx.pipeline({
  vert: basicMVP,
  frag: basicFrag,
  depthTest: true,
});
const floorMatrix = mat4.translate(mat4.create(), [0, -1, 0]);
const drawFloorCmd = {
  name: "drawFloor",
  pipeline: shadowMappedPipeline,
  uniforms: {
    uProjectionMatrix: camera.projectionMatrix,
    uViewMatrix: camera.viewMatrix,
    uModelMatrix: floorMatrix,
    uWrap: 0,
    uLightNear: lightCamera.near,
    uLightFar: lightCamera.far,
    uLightProjectionMatrix: lightCamera.projectionMatrix,
    uLightViewMatrix: lightCamera.viewMatrix,
    uLightPos: lightCamera.position,
    uDepthMap: depthMap,
    uAmbientColor: [0, 0, 0, 1],
    uDiffuseColor: [1, 1, 1, 1],
  },
  ...floorAttributes,
};

const drawFloorDepthCmd = {
  name: "drawFloorDepth",
  pipeline: drawDepthPipeline,
  uniforms: {
    uProjectionMatrix: lightCamera.projectionMatrix,
    uViewMatrix: lightCamera.viewMatrix,
    uModelMatrix: floorMatrix,
  },
  ...floorAttributes,
};

// Geometry
const bunnyGeometry = {
  positions: centerAndNormalize(structuredClone(bunny.positions), {
    normalizedSize: 2,
  }),
  normals: vertexNormals(bunny.cells, bunny.positions),
  cells: bunny.cells,
};
const bunnyNoiseVertices = structuredClone(bunnyGeometry.positions);
const bunnyPositionBuffer = ctx.vertexBuffer(bunnyGeometry.positions);
const bunnyNormalBuffer = ctx.vertexBuffer(bunnyGeometry.normals);

const bunnyAttributes = {
  attributes: {
    aPosition: {
      buffer: bunnyPositionBuffer,
    },
    aNormal: {
      buffer: bunnyNormalBuffer,
    },
  },
  indices: ctx.indexBuffer(bunny.cells),
};

const drawBunnyCmd = {
  name: "drawBunny",
  pipeline: shadowMappedPipeline,
  uniforms: {
    uProjectionMatrix: camera.projectionMatrix,
    uViewMatrix: camera.viewMatrix,
    uModelMatrix: mat4.create(),
    uWrap: 0,
    uLightNear: lightCamera.near,
    uLightFar: lightCamera.far,
    uLightProjectionMatrix: lightCamera.projectionMatrix,
    uLightViewMatrix: lightCamera.viewMatrix,
    uLightPos: lightCamera.position,
    uDepthMap: depthMap,
    uAmbientColor: [0, 0, 0, 1],
    uDiffuseColor: [1, 1, 1, 1],
  },
  ...bunnyAttributes,
};

const drawBunnyDepthCmd = {
  name: "drawBunnyDepth",
  pipeline: drawDepthPipeline,
  uniforms: {
    uProjectionMatrix: lightCamera.projectionMatrix,
    uViewMatrix: lightCamera.viewMatrix,
    uModelMatrix: mat4.create(),
  },
  ...bunnyAttributes,
};

// Update
function updateTime() {
  const now = Date.now();
  const deltaTime = (now - prevTime) / 1000;
  elapsedSeconds += deltaTime;
  prevTime = now;

  return deltaTime;
}

function updateBunny(ctx) {
  const noiseFrequency = 1;
  const noiseScale = 0.1;
  for (let i = 0; i < bunnyGeometry.positions.length; i++) {
    const v = bunnyNoiseVertices[i];
    const n = bunnyGeometry.normals[i];
    vec3.set(v, bunnyGeometry.positions[i]);
    const f = random.noise3(
      v[0] * noiseFrequency,
      v[1] * noiseFrequency,
      v[2] * noiseFrequency + elapsedSeconds,
    );
    v[0] += n[0] * noiseScale * (f + 1);
    v[1] += n[1] * noiseScale * (f + 1);
    v[2] += n[2] * noiseScale * (f + 1);
  }

  ctx.update(bunnyPositionBuffer, { data: bunnyNoiseVertices });
  ctx.update(bunnyNormalBuffer, {
    data: vertexNormals(bunny.cells, bunnyNoiseVertices),
  });
}

const drawFullscreenQuadCmd = {
  name: "drawFullscreenQuad",
  pipeline: ctx.pipeline({
    vert: screenImageVert,
    frag: screenImageFrag,
    depthTest: false,
  }),
  attributes: {
    aPosition: ctx.vertexBuffer([
      [-1, -1],
      [-2 / 4, -1],
      [-2 / 4, -1 / 3],
      [-1, -1 / 3],
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
    uTexture: depthMap,
  },
};

export {
  ctx,
  gui,
  camera,
  bunnyGeometry,
  updateTime,
  updateBunny,
  depthPassCmd,
  drawFloorDepthCmd,
  drawBunnyDepthCmd,
  clearCmd,
  drawFloorCmd,
  drawBunnyCmd,
  drawFullscreenQuadCmd,
};
