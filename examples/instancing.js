import { vec3, quat } from "pex-math";
import random from "pex-random";

import {
  ctx,
  gui,
  updateTime,
  updateBunny,
  depthPassCmd,
  drawFloorDepthCmd,
  drawBunnyDepthCmd,
  clearCmd,
  drawFloorCmd,
  drawBunnyCmd,
  drawFullscreenQuadCmd,
} from "./bunny.js";

import shadowMappedFrag from "./shaders/shadow-mapped.frag.js";
import basicFrag from "./shaders/basic.frag.js";
import showNormalsInstancedVert from "./shaders/show-normals-instanced.vert.js";
import shadowMappedInstancedVert from "./shaders/shadow-mapped-instanced.vert.js";

const NUM_BUNNIES = 1000;

const offsets = [];
const rotations = [];
const scales = [];
const colors = [];

random.seed(0);

for (let i = 0; i < NUM_BUNNIES; i++) {
  offsets.push([random.float(-3, 3), random.float(0, 3), random.float(-3, 3)]);
  rotations.push(
    quat.fromTo(quat.create(), [0, 0, 1], vec3.normalize(random.vec3()))
  );
  scales.push([0.2, 0.2, 0.2]);
  colors.push([
    random.float(0.1, 1.0),
    random.float(0.1, 1.0),
    random.float(0.1, 1.0),
    1.0,
  ]);
}

const bunnyInstancedAttributes = {
  aOffset: { buffer: ctx.vertexBuffer(offsets), divisor: 1 },
  aRotation: { buffer: ctx.vertexBuffer(rotations), divisor: 1 },
  aScale: { buffer: ctx.vertexBuffer(scales), divisor: 1 },
  aColor: { buffer: ctx.vertexBuffer(colors), divisor: 1 },
};

Object.assign(drawBunnyCmd.attributes, bunnyInstancedAttributes);
drawBunnyCmd.instances = NUM_BUNNIES;
drawBunnyCmd.pipeline = ctx.pipeline({
  vert: shadowMappedInstancedVert,
  frag: shadowMappedFrag,
  depthTest: true,
});

Object.assign(drawBunnyDepthCmd.attributes, bunnyInstancedAttributes);
drawBunnyDepthCmd.instances = NUM_BUNNIES;
drawBunnyDepthCmd.pipeline = ctx.pipeline({
  vert: showNormalsInstancedVert,
  frag: basicFrag,
  depthTest: true,
});

ctx.frame(() => {
  updateTime();
  updateBunny(ctx);

  ctx.submit(depthPassCmd, () => {
    ctx.submit(drawFloorDepthCmd);
    ctx.submit(drawBunnyDepthCmd);
  });
  ctx.submit(clearCmd, () => {
    ctx.submit(drawFloorCmd);
    ctx.submit(drawBunnyCmd);
    ctx.submit(drawFullscreenQuadCmd);
  });

  ctx.debug(false);

  gui.draw();

  window.dispatchEvent(new CustomEvent("pex-screenshot"));
});
