import { checkProps } from "./utils.js";

/**
 * @typedef {import("./types.js").PexResource} PipelineOptions
 * @property {string} [vert=null] Vertex shader code
 * @property {string} [frag=null] Fragment shader code
 * @property {boolean} [depthWrite=true] Depth write mask
 * @property {boolean} [depthTest=false] Depth test on/off
 * @property {ctx.DepthFunc} [depthFunc=ctx.DepthFunc.LessEqual] Depth test function
 * @property {boolean} [blend=false] Blending on/off
 * @property {ctx.BlendFactor} [blendSrcRGBFactor=ctx.BlendFactor.One] Blending source color factor
 * @property {ctx.BlendFactor} [blendSrcAlphaFactor=ctx.BlendFactor.One] Blending source alpha factor
 * @property {ctx.BlendFactor} [blendDstRGBFactor=ctx.BlendFactor.One] Blending destination color factor
 * @property {ctx.BlendFactor} [blendDstAlphaFactor=ctx.BlendFactor.One] Blending destination alpha factor
 * @property {boolean} [cullFace=false] Face culling on/off
 * @property {ctx.Face} [cullFaceMode=ctx.Face.Back] Face culling mode
 * @property {boolean[]} [colorMask=[true, true, true, true]] Color write mask for [r, g, b, a]
 * @property {ctx.Primitive} [primitive=ctx.Primitive.Triangles] Geometry primitive
 */

const allowedProps = [
  "vert",
  "frag",
  "program",
  "depthWrite",
  "depthTest",
  "depthFunc",
  "blend",
  "blendSrcRGBFactor",
  "blendSrcAlphaFactor",
  "blendDstRGBFactor",
  "blendDstAlphaFactor",
  "cullFace",
  "cullFaceMode",
  "colorMask",
  "primitive",
  "vertexLayout",
];

function createPipeline(ctx, opts) {
  checkProps(allowedProps, opts);

  const pipeline = Object.assign(
    {
      class: "pipeline",
      vert: null,
      frag: null,
      program: null,
      depthWrite: true,
      depthTest: false,
      depthFunc: ctx.DepthFunc.LessEqual,
      blend: false,
      blendSrcRGBFactor: ctx.BlendFactor.One,
      blendSrcAlphaFactor: ctx.BlendFactor.One,
      blendDstRGBFactor: ctx.BlendFactor.One,
      blendDstAlphaFactor: ctx.BlendFactor.One,
      cullFace: false,
      cullFaceMode: ctx.Face.Back,
      colorMask: [true, true, true, true],
      primitive: ctx.Primitive.Triangles,
      _dispose() {
        this.vert = null;
        this.frag = null;
        if (
          this.program &&
          --this.program.refCount === 0 &&
          this.program.handle
        ) {
          ctx.dispose(this.program);
        }
        this.program = null;
      },
    },
    opts
  );

  if (opts.vert && opts.frag) {
    pipeline.program = ctx.program({
      vert: opts.vert,
      frag: opts.frag,
      vertexLayout: opts.vertexLayout,
    });
  }

  if (pipeline.program && !pipeline.vertexLayout) {
    pipeline.program.refCount++;
    const attributesPerLocation = pipeline.program.attributesPerLocation;
    pipeline.vertexLayout = Object.keys(attributesPerLocation).map(
      (location) => {
        const attribute = attributesPerLocation[location];
        return [attribute.name, parseInt(location, 10), attribute.size];
      }
    );
  }

  return pipeline;
}

export default createPipeline;
