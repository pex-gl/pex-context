import createContext from "../index.js";

import { mat4, vec3 } from "pex-math";
import { perspective as createCamera, orbiter as createOrbiter } from "pex-cam";
import createGUI from "pex-gui";
import { load } from "pex-io";

import { cube, sphere } from "primitive-geometry";

import skyboxVert from "./shaders/skybox.vert.js";
import skyboxFrag from "./shaders/skybox.frag.js";
import positionNormalMVPVert from "./shaders/position-normal-mvp.vert.js";
import diffuseFrag from "./shaders/diffuse.frag.js";
import reflectionFrag from "./shaders/reflection.frag.js";

const ctx = createContext({ debug: true });
const gui = createGUI(ctx);
gui.addFPSMeeter();
gui.addStats();

const state = {
  spherePosition: [0, 0, 0],
  reflections: true,
};

const camera = createCamera({
  fov: Math.PI / 4,
  aspect: window.innerWidth / window.innerHeight,
  position: [5, 5, 5],
});

createOrbiter({ camera, element: ctx.gl.canvas });

const depthMapSize = 512;
const depthMap = ctx.texture2D({
  width: depthMapSize,
  height: depthMapSize,
  pixelFormat: ctx.PixelFormat.DEPTH_COMPONENT16,
  encoding: ctx.Encoding.Linear,
});

const cubeInstances = [
  { position: [3, 0, 0], color: [1.0, 0.0, 0.0, 1.0] },
  { position: [-3, 0, 0], color: [1.0, 0.5, 0.0, 1.0] },
  { position: [0, 3, 0], color: [0.0, 0.8, 0.0, 1.0] },
  { position: [0, -3, 0], color: [0.0, 0.8, 0.8, 1.0] },
  { position: [0, 0, 3], color: [0.0, 0.0, 1.0, 1.0] },
  { position: [0, 0, -3], color: [0.5, 0.0, 1.0, 1.0] },
];

const clearScreenCmd = {
  name: "clearScreen",
  pass: ctx.pass({
    clearColor: [0.2, 0.2, 0.2, 1],
  }),
};

const box = cube();

const drawBoxCmd = {
  name: "drawBox",
  pipeline: ctx.pipeline({
    vert: positionNormalMVPVert,
    frag: diffuseFrag,
    depthTest: true,
  }),
  uniforms: {
    uProjectionMatrix: camera.projectionMatrix,
    uViewMatrix: camera.viewMatrix,
    uModelMatrix: mat4.create(),
  },
  attributes: {
    aPosition: ctx.vertexBuffer(box.positions),
    aNormal: ctx.vertexBuffer(box.normals),
  },
  indices: ctx.indexBuffer(box.cells),
};

const geom = sphere({ radius: 1 });

const drawSphereCmd = {
  name: "drawSphere",
  pipeline: ctx.pipeline({
    vert: positionNormalMVPVert,
    frag: reflectionFrag,
    depthTest: true,
  }),
  uniforms: {
    uProjectionMatrix: camera.projectionMatrix,
    uViewMatrix: camera.viewMatrix,
    uModelMatrix: mat4.create(),
  },
  attributes: {
    aPosition: ctx.vertexBuffer(geom.positions),
    aNormal: ctx.vertexBuffer(geom.normals),
  },
  indices: {
    buffer: ctx.indexBuffer(geom.cells),
  },
};

const CUBEMAP_SIZE = 512;
const reflectionMap = ctx.textureCube({
  width: CUBEMAP_SIZE,
  height: CUBEMAP_SIZE,
  pixelFormat: ctx.PixelFormat.RGBA8,
  encoding: ctx.Encoding.SRGB,
});

gui.addTextureCube("Reflection Cubemap RT", reflectionMap, { flipEnvMap: -1 });
gui.addParam("Sphere pos", state, "spherePosition", { min: -3, max: 3 });
gui.addParam("Reflections", state, "reflections");

const sides = [
  { eye: [0, 0, 0], target: [1, 0, 0], up: [0, -1, 0] },
  { eye: [0, 0, 0], target: [-1, 0, 0], up: [0, -1, 0] },
  { eye: [0, 0, 0], target: [0, 1, 0], up: [0, 0, 1] },
  { eye: [0, 0, 0], target: [0, -1, 0], up: [0, 0, -1] },
  { eye: [0, 0, 0], target: [0, 0, 1], up: [0, -1, 0] },
  { eye: [0, 0, 0], target: [0, 0, -1], up: [0, -1, 0] },
].map((side, i) => {
  side.projectionMatrix = mat4.perspective(
    mat4.create(),
    Math.PI / 2,
    1,
    0.1,
    100
  );
  side.viewMatrix = mat4.lookAt(mat4.create(), side.eye, side.target, side.up);
  side.drawPassCmd = {
    name: "ReflectionProbe.sidePass",
    pass: ctx.pass({
      name: "ReflectionProbe.sidePass",
      color: [
        {
          texture: reflectionMap,
          target: ctx.gl.TEXTURE_CUBE_MAP_POSITIVE_X + i,
        },
      ],
      depth: depthMap,
      clearColor: [0, 0, 0, 1],
      clearDepth: 1,
    }),
  };
  return side;
});

function drawBoxes(camera) {
  cubeInstances.forEach(({ position, color }) => {
    if (camera) {
      ctx.submit(drawBoxCmd, {
        uniforms: {
          uDiffuseColor: color,
          uProjectionMatrix: camera.projectionMatrix,
          uViewMatrix: camera.viewMatrix,
          uModelMatrix: mat4.translate(mat4.create(), position),
        },
      });
    } else {
      ctx.submit(drawBoxCmd, {
        uniforms: {
          uModelMatrix: mat4.translate(mat4.create(), position),
          uDiffuseColor: color,
        },
      });
    }
  });
}

const resources = {
  equirect: { image: new URL("./assets/images/pisa_env.jpg", import.meta.url) },
  negx: {
    image: new URL("./assets/images/pisa/pisa_negx.jpg", import.meta.url),
  },
  negy: {
    image: new URL("./assets/images/pisa/pisa_negy.jpg", import.meta.url),
  },
  negz: {
    image: new URL("./assets/images/pisa/pisa_negz.jpg", import.meta.url),
  },
  posx: {
    image: new URL("./assets/images/pisa/pisa_posx.jpg", import.meta.url),
  },
  posy: {
    image: new URL("./assets/images/pisa/pisa_posy.jpg", import.meta.url),
  },
  posz: {
    image: new URL("./assets/images/pisa/pisa_posz.jpg", import.meta.url),
  },
  testEquirect: {
    image: new URL("./assets/images/test_env.png", import.meta.url),
  },
  testnegx: {
    image: new URL("./assets/images/test/test_nx.png", import.meta.url),
  },
  testnegy: {
    image: new URL("./assets/images/test/test_ny.png", import.meta.url),
  },
  testnegz: {
    image: new URL("./assets/images/test/test_nz.png", import.meta.url),
  },
  testposx: {
    image: new URL("./assets/images/test/test_px.png", import.meta.url),
  },
  testposy: {
    image: new URL("./assets/images/test/test_py.png", import.meta.url),
  },
  testposz: {
    image: new URL("./assets/images/test/test_pz.png", import.meta.url),
  },
};

let envMap = null;

const res = await load(resources);

const equirect = ctx.texture2D({
  data: res.equirect,
  encoding: ctx.Encoding.SRGB,
});
gui.addTexture2D("Equirect", equirect);

envMap = ctx.textureCube({
  data: [res.posx, res.negx, res.posy, res.negy, res.posz, res.negz],
  width: res.negx.width,
  height: res.negy.height,
  encoding: ctx.Encoding.SRGB,
});
gui.addTextureCube("EnvMap Cubemap File", envMap, { flipEnvMap: -1 });

const testEquirect = ctx.texture2D({
  data: res.testEquirect,
  encoding: ctx.Encoding.SRGB,
});
gui.addTexture2D("Test Equirect File", testEquirect);

const testEnvMap = ctx.textureCube({
  data: [
    res.testposx,
    res.testnegx,
    res.testposy,
    res.testnegy,
    res.testposz,
    res.testnegz,
  ],
  width: res.testnegx.width,
  height: res.testnegy.height,
  encoding: ctx.Encoding.SRGB,
});
gui.addTextureCube("Test EnvMap Cubemap File", testEnvMap, {
  flipEnvMap: -1,
});

const drawSkyboxCmd = {
  pipeline: ctx.pipeline({
    vert: skyboxVert,
    frag: skyboxFrag,
    depthTest: true,
    depthWrite: false,
    depthFunc: ctx.DepthFunc.Less,
  }),
  uniforms: {
    uProjectionMatrix: camera.projectionMatrix,
    uViewMatrix: camera.viewMatrix,
    uModelMatrix: mat4.create(),
    uEnvMap: null,
  },
  attributes: {
    aPosition: ctx.vertexBuffer([
      [-1, -1],
      [1, -1],
      [1, 1],
      [-1, 1],
    ]),
  },
  indices: ctx.indexBuffer([
    [0, 1, 2],
    [0, 2, 3],
  ]),
};

function drawSkybox(camera) {
  if (envMap) {
    if (camera) {
      ctx.submit(drawSkyboxCmd, {
        uniforms: {
          uEnvMap: envMap,
          uProjectionMatrix: camera.projectionMatrix,
          uViewMatrix: camera.viewMatrix,
        },
      });
    } else {
      ctx.submit(drawSkyboxCmd, {
        uniforms: {
          uEnvMap: envMap,
        },
      });
    }
  }
}

ctx.frame(() => {
  ctx.submit(clearScreenCmd);

  sides.forEach((side) => {
    const target = [0, 0, 0];
    ctx.submit(side.drawPassCmd, () => {
      const position = state.spherePosition;
      vec3.set(target, position);
      vec3.add(target, side.target);
      mat4.lookAt(side.viewMatrix, position, target, side.up);
      drawBoxes(side);
      drawSkybox(side);
    });
  });

  drawBoxes();
  drawSkybox();

  ctx.submit(drawSphereCmd, {
    uniforms: {
      uEnvMap: state.reflections ? reflectionMap : envMap,
      uModelMatrix: mat4.translate(mat4.create(), state.spherePosition),
      uInvViewMatrix: mat4.invert(mat4.copy(camera.viewMatrix)),
      uCameraPosition: camera.position,
    },
  });

  ctx.debug(false);

  gui.draw();

  window.dispatchEvent(new CustomEvent("pex-screenshot"));
});
