import createContext from "../index.js";

import { perspective as createCamera } from "pex-cam";
import createGUI from "pex-gui";
import { loadImage } from "pex-io";

import { cube } from "primitive-geometry";

import basicVert from "./shaders/basic.vert.js";
import basicFrag from "./shaders/basic.frag.js";

const resolutions = [
  {
    name: "800x600 (low-res)",
    value: "800x600-lowres",
    width: 800,
    height: 600,
    pixelRatio: 0.5,
  },
  { name: "800x600", value: "800x600", width: 800, height: 600, pixelRatio: 1 },
  {
    name: "800x600 (hi-res)",
    value: "800x600-hi-res",
    width: 800,
    height: 600,
    pixelRatio: 2,
  },
  {
    name: "Full window (low res)",
    value: "full-window-lowres",
    width: 0,
    height: 0,
    pixelRatio: 0.5,
  },
  {
    name: "Full window",
    value: "full-window",
    width: 0,
    height: 0,
    pixelRatio: 1,
  },
  {
    name: "Full window (hi-res)",
    value: "full-window-hi-res",
    width: 0,
    height: 0,
    pixelRatio: 2,
  },
];

const config = {
  pixelRatio: 1,
  antialias: false,
  debug: true,
};

const settings = {
  resolution: "full-window",
  fov: Math.PI / 3,
  fullscreen: false,
};

const ctx = createContext(config);

const geom = cube();
const camera = createCamera({
  position: [2, 2, 2],
  fov: Math.PI / 3,
  aspect: ctx.gl.canvas.width / ctx.gl.canvas.height,
});

const clearCmd = {
  pass: ctx.pass({
    clearColor: [0.2, 0.2, 0.2, 1],
    clearDepth: 1,
  }),
};

const tex = ctx.texture2D({ width: 1, height: 1 });
const img = await loadImage(
  new URL("./assets/images/pex.png", import.meta.url)
);
ctx.update(tex, { data: img, width: img.width, height: img.height });

const gui = createGUI(ctx);

const params = new URLSearchParams(document.location.search);
const paramValue = params.get("value");
const res = resolutions.find(({ value }) => value === paramValue);

if (res) {
  config.width = res.width;
  config.height = res.height;
  config.pixelRatio = res.pixelRatio;
  gui.pixelRatio = res.pixelRatio;
  settings.resolution = paramValue;
}

const update = () => {
  const res = resolutions.find(({ value }) => value === settings.resolution);
  const w = res.width || window.innerWidth;
  const h = res.height || window.innerHeight;

  const params = new URLSearchParams(document.location.search);
  params.set("value", res.value);
  window.history.replaceState({}, "", `?${params}`);

  ctx.set({
    width: w,
    height: h,
    pixelRatio: res.pixelRatio,
  });
  camera.set({ aspect: w / h });

  gui.pixelRatio = res.pixelRatio;
};

gui.addHeader("Settings");
gui.addParam(
  "FOV",
  settings,
  "fov",
  {
    min: Math.PI / 4,
    max: Math.PI / 2,
  },
  () => camera.set({ fov: settings.fov })
);
gui.addHeader("Resolution");
gui.addRadioList("Resolution", settings, "resolution", resolutions, update);
gui.addTexture2D("PEX", tex);
gui.addHeader("Fullscreen");
const fullscreenParam = gui.addParam(
  "Fullscreen",
  settings,
  "fullscreen",
  {},
  () => {
    settings.fullscreen
      ? ctx.gl.canvas.requestFullscreen()
      : document.exitFullscreen();
  }
);

const drawCmd = {
  pipeline: ctx.pipeline({
    depthTest: true,
    vert: basicVert,
    frag: basicFrag,
  }),
  attributes: {
    aPosition: ctx.vertexBuffer(geom.positions),
    aNormal: ctx.vertexBuffer(geom.normals),
  },
  indices: ctx.indexBuffer(geom.cells),
  uniforms: {
    uProjectionMatrix: camera.projectionMatrix,
    uViewMatrix: camera.viewMatrix,
  },
};

window.addEventListener("resize", () => {
  if (settings.resolution.includes("full-window")) {
    const W = window.innerWidth;
    const H = window.innerHeight;
    ctx.set({ width: W, height: H });
    camera.set({ aspect: W / H });
  }
});
window.addEventListener("fullscreenchange", () => {
  settings.fullscreen = !!document.fullscreenElement;
  fullscreenParam.dirty = true;
});

ctx.frame(() => {
  ctx.submit(clearCmd);
  ctx.submit(drawCmd, {
    uniforms: {
      uProjectionMatrix: camera.projectionMatrix,
      uViewMatrix: camera.viewMatrix,
    },
  });

  ctx.debug(false);

  gui.draw();

  window.dispatchEvent(new CustomEvent("pex-screenshot"));
});

update();
