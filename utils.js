import debug from "debug";

const NAMESPACE = "pex-context";

const checkProps = (allowedProps, obj) =>
  Object.keys(obj).forEach((prop) => {
    if (!allowedProps.includes(prop)) throw new Error(`Unknown prop "${prop}"`);
  });

const isWebGL2 = (gl) =>
  typeof WebGL2RenderingContext !== "undefined" &&
  gl instanceof WebGL2RenderingContext;

const log = (...args) => console.debug(`${NAMESPACE}`, ...args);
log.extend = () => log;
// const log = debug(NAMESPACE);
// log.color = "#f00";

const enableNamespace = (namespace) =>
  debug.enable([...debug.disable().split(","), namespace].join(","));

const disableNamespace = (namespace) =>
  debug.enable(
    debug
      .disable()
      .split(",")
      .filter((n) => n !== namespace)
      .join(",")
  );

disableNamespace(NAMESPACE);

function compareFBOAttachments(framebuffer, passOpts) {
  const fboDepthAttachment = framebuffer.depth?.texture;
  const passDepthAttachment = passOpts.depth?.texture || passOpts.depth;
  if (fboDepthAttachment != passDepthAttachment) return false;
  if (framebuffer.color.length != passOpts.color.length) return false;

  for (let i = 0; i < framebuffer.color.length; i++) {
    const fboColorAttachment = framebuffer.color[i]?.texture;
    const passColorAttachment = passOpts.color[i]?.texture || passOpts.color[i];
    if (fboColorAttachment != passColorAttachment) return false;
  }

  return true;
}

export {
  NAMESPACE,
  isWebGL2,
  checkProps,
  log,
  enableNamespace,
  disableNamespace,
  compareFBOAttachments,
};
