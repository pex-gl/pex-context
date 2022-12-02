import createContext from "../index.js";

import createGUI from "pex-gui";

const ctx = createContext({ width: 640, height: 480, pixelRatio: 2 });
const ctxWebGL1 = createContext({ type: "webgl" });

const gui = createGUI(ctx, { theme: { columnWidth: 320 } });
gui.addColumn("WebGL1");
gui.addStats({}).stats = ctxWebGL1.capabilities;
gui.addColumn("WebGL2");
gui.addStats({}).stats = ctx.capabilities;

ctx.frame(() => {
  gui.draw();

  window.dispatchEvent(new CustomEvent("pex-screenshot"));
});
