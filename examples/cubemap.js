import createContext from "../index.js";

import { load } from "pex-io";
import { perspective as createCamera, orbiter as createOrbiter } from "pex-cam";
import { mat4 } from "pex-math";
import createGUI from "pex-gui";

import { sphere } from "primitive-geometry";

import skyboxVert from "./shaders/skybox.vert.js";
import skyboxFrag from "./shaders/skybox.frag.js";
import positionNormalMVPVert from "./shaders/position-normal-mvp.vert.js";
import reflectionFrag from "./shaders/reflection.frag.js";

const ctx = createContext({ debug: true });
const gui = createGUI(ctx);
gui.addFPSMeeter();
gui.addStats();

const camera = createCamera({
  fov: Math.PI / 4,
  aspect: ctx.gl.canvas.width / ctx.gl.canvas.height,
  position: [5, 5, 5],
});

createOrbiter({ camera, element: ctx.gl.canvas });

const clearCmd = {
  pass: ctx.pass({
    clearColor: [0.2, 0.2, 0.2, 1],
    clearDepth: 1,
  }),
};

const geom = sphere({ radius: 1 });

const drawCmd = {
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
  indices: ctx.indexBuffer(geom.cells),
};

const drawSkybox = {
  pipeline: ctx.pipeline({
    vert: skyboxVert,
    frag: skyboxFrag,
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

const resources = {
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
};

const res = await load(resources);

const envMapCube = ctx.textureCube({
  data: [res.posx, res.negx, res.posy, res.negy, res.posz, res.negz],
  width: res.negx.width,
  height: res.negy.height,
});

gui.addTextureCube("Cubemap", envMapCube, { flipEnvMap: -1 });

drawSkybox.uniforms.uEnvMap = envMapCube;
drawCmd.uniforms.uEnvMap = envMapCube;
drawCmd.uniforms.uCameraPosition = camera.position;

ctx.frame(() => {
  ctx.submit(clearCmd);
  ctx.submit(drawSkybox);
  ctx.submit(drawCmd);

  ctx.debug(false);

  gui.draw();

  window.dispatchEvent(new CustomEvent("screenshot"));
});
