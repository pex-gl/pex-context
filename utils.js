import debug from "debug";

const NAMESPACE = "pex-context";

const checkProps = (allowedProps, obj) =>
  Object.keys(obj).forEach((prop) => {
    if (!allowedProps.includes(prop)) throw new Error(`Unknown prop "${prop}"`);
  });

const isWebGL2 = (gl) =>
  typeof WebGL2RenderingContext !== "undefined" &&
  gl instanceof WebGL2RenderingContext;

// const log = (...args) => console.debug(`${NAMESPACE}`, ...args);
// log.extend = () => log;
const log = debug(NAMESPACE);
log.color = "#f00";

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

export {
  NAMESPACE,
  isWebGL2,
  checkProps,
  log,
  enableNamespace,
  disableNamespace,
};
