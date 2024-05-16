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

const query1 = ctx.query();
const query2 = ctx.query();
const query3 = ctx.query();

let frameNumber = 0;

ctx.frame(() => {
  updateTime();
  updateBunny(ctx);

  ctx.debug(++frameNumber === 1);

  ctx.submit(depthPassCmd, () => {
    ctx.submit(drawFloorDepthCmd);
    ctx.submit(drawBunnyDepthCmd);
  });
  ctx.submit(clearCmd, () => {
    ctx.beginQuery(query1);
    ctx.submit(drawFloorCmd);
    ctx.endQuery(query1);

    ctx.beginQuery(query2);
    ctx.submit(drawBunnyCmd);
    ctx.endQuery(query2);

    ctx.beginQuery(query3);
    ctx.submit(drawFullscreenQuadCmd);
    ctx.endQuery(query3);
  });

  ctx.debug(false);

  gui.draw();

  window.dispatchEvent(new CustomEvent("pex-screenshot"));
});
