import assert from "assert";

function createRenderbuffer(ctx, opts) {
  const gl = ctx.gl;

  const renderbuffer = {
    class: "renderbuffer",
    handle: gl.createRenderbuffer(),
    target: gl.RENDERBUFFER,
    width: 0,
    height: 0,
    _update: updateRenderbuffer,
    _dispose() {
      gl.deleteRenderbuffer(this.handle);
      this.color = null;
      this.depth = null;
    },
  };

  updateRenderbuffer(ctx, renderbuffer, opts);

  return renderbuffer;
}

// opts = { width: int, height: int, pixelFormat: PixelFormat }
function updateRenderbuffer(ctx, renderbuffer, opts) {
  Object.assign(renderbuffer, opts);

  const gl = ctx.gl;

  assert(
    renderbuffer.pixelFormat === ctx.PixelFormat.DEPTH_COMPONENT16,
    "Only PixelFormat.DEPTH_COMPONENT16 is supported for renderbuffers"
  );
  renderbuffer.format = gl[renderbuffer.pixelFormat];

  gl.bindRenderbuffer(renderbuffer.target, renderbuffer.handle);
  gl.renderbufferStorage(
    renderbuffer.target,
    renderbuffer.format,
    renderbuffer.width,
    renderbuffer.height
  );
  gl.bindRenderbuffer(renderbuffer.target, null);
}

export default createRenderbuffer;
