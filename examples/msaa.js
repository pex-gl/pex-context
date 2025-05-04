//Based on: https://stackoverflow.com/questions/47934444/webgl-framebuffer-multisampling
import createContext from "../index.js";

import { perspective as createCamera, orbiter as createOrbiter } from "pex-cam";

import { cube } from "primitive-geometry";
import { loadImage } from "pex-io";

import screenImageVert from "./shaders/screen-image.vert.js";
import screenImageFrag from "./shaders/screen-image.frag.js";

const ctx = createContext({
  debug: true,
  pixelRatio: window.devicePixelRatio,
  antialias: false,
});
const gl = ctx.gl;

const geom = cube({ sx: 0.5 });

const lineGeom = {
  positions: [],
};
let prevPos = null;
for (let i = 0; i < 128; i++) {
  const a = (i / 128) * Math.PI * 2;
  const pos = [1 * Math.sin(a), 1 * Math.cos(a), 0];
  lineGeom.positions.push([0, 0, 0]);
  lineGeom.positions.push(pos);
}

const camera = createCamera({
  position: [1, 0.6, 1],
  fov: Math.PI / 3,
  near: 1,
  far: 10
});
createOrbiter({ camera });


let firstFrame = true;
let depthMap;
let colorMap;
let normalMap;
let uvMap;
let capturePassCmd;
let captureAndResolvePassCmd;


function initTextures() {
  const w = ctx.gl.canvas.width;
  const h = ctx.gl.canvas.height;
  depthMap = ctx.texture2D({
    width: w,
    height: h,
    pixelFormat: ctx.PixelFormat.DEPTH_COMPONENT24,
    encoding: ctx.Encoding.Linear,
  });
  colorMap = ctx.texture2D({
    width: w,
    height: h,
    pixelFormat: ctx.PixelFormat.RGBA8,
    encoding: ctx.Encoding.SRGB,
    mipmap: true,
    min: ctx.Filter.LinearMipmapLinear,
    mag: ctx.Filter.Linear
  });
  normalMap = ctx.texture2D({
    width: w,
    height: h,
    pixelFormat: ctx.PixelFormat.RGBA8,
    encoding: ctx.Encoding.SRGB,
    mipmap: true,
    min: ctx.Filter.LinearMipmapLinear,
    mag: ctx.Filter.Linear
  });
  uvMap = ctx.texture2D({
    width: w,
    height: h,
    pixelFormat: ctx.PixelFormat.RGBA8,
    encoding: ctx.Encoding.SRGB,
    mipmap: true,
    min: ctx.Filter.LinearMipmapLinear,
    mag: ctx.Filter.Linear
  });

  const colorRenderbuffer = ctx.renderbuffer({
    width: w,
    height: h,
    pixelFormat: ctx.PixelFormat.RGBA8,
    sampleCount: gl.getParameter(gl.MAX_SAMPLES),
  });
  const normalRenderbuffer = ctx.renderbuffer({
    width: w,
    height: h,
    pixelFormat: ctx.PixelFormat.RGBA8,
    sampleCount: gl.getParameter(gl.MAX_SAMPLES),
  });
  const uvRenderbuffer = ctx.renderbuffer({
    width: w,
    height: h,
    pixelFormat: ctx.PixelFormat.RGBA8,
    sampleCount: gl.getParameter(gl.MAX_SAMPLES),
  });
  const depthRenderbuffer = ctx.renderbuffer({
    width: w,
    height: h,
    pixelFormat: ctx.PixelFormat.DEPTH_COMPONENT24,
    sampleCount: gl.getParameter(gl.MAX_SAMPLES),
  });
  capturePassCmd = {
    pass: ctx.pass({
      name: 'capturePassCmd',
      color: [
        { texture: colorRenderbuffer },
        { texture: normalRenderbuffer },
        { texture: uvRenderbuffer }
      ],
      clearColor: [
        [0, 0, 0, 1],
        [0.5, 0.5, 0.5, 1],
        [0, 0, 1, 1]
      ],
      depth: depthRenderbuffer,
      clearDepth: 1,
    }),
  };
  captureAndResolvePassCmd = {
    pass: ctx.pass({
      name: 'captureAndResolvePassCmd',
      color: [{
        texture: colorRenderbuffer,
        resolveTarget: colorMap
      },{
        texture: normalRenderbuffer,
        resolveTarget: normalMap
      },
      {
        texture: uvRenderbuffer,
        resolveTarget: uvMap
      }],
      depth: {
        texture: depthRenderbuffer,
        resolveTarget: depthMap
      },
    }),
  };

  window.ctx = ctx
}

const vert = /*glsl*/`#version 300 es
in vec3 aPosition;
in vec3 aNormal;
in vec2 aTexCoord;

uniform mat4 uProjectionMatrix;
uniform mat4 uViewMatrix;

out vec3 vNormal;
out vec2 vTexCoord;

void main () {
  vNormal = aNormal;
  vTexCoord = aTexCoord;

  gl_Position = uProjectionMatrix * uViewMatrix * vec4(aPosition, 1.0);
}
`

const frag = /*glsl*/`#version 300 es
  precision highp float;

  in vec3 vNormal;
  in vec2 vTexCoord;
  uniform sampler2D uTexture;
  layout (location = 0) out vec4 outColor;
  layout (location = 1) out vec4 outNormal;
  layout (location = 2) out vec4 outUv;
  void main () {
    outColor = texture(uTexture, vTexCoord);
    outNormal = vec4(vNormal * 0.5 + 0.5, 1.0);
    outUv = vec4(vTexCoord, 0.0, 1.0);
  }
`;
const img = await loadImage(new URL("./assets/checker.jpg", import.meta.url));

const drawTextureCmd = {
  name: "drawTexture",
  pipeline: ctx.pipeline({
    vert: screenImageVert,
    frag: screenImageFrag,
  }),
  attributes: {
    aPosition: ctx.vertexBuffer([
      [-1, -1],
      [1, -1],
      [1, 1],
      [-1, 1],
    ]),
    aTexCoord: ctx.vertexBuffer([
      [0, 0],
      [1, 0],
      [1, 1],
      [0, 1],
    ]),
  },
  indices: ctx.indexBuffer([
    [0, 1, 2],
    [0, 2, 3],
  ]),
  uniforms: {
    uTexture: null,
  },
};

const drawCmd = {
  pipeline: ctx.pipeline({
    depthTest: true,
    vert,
    frag,
  }),
  attributes: {
    aPosition: ctx.vertexBuffer(geom.positions),
    aNormal: ctx.vertexBuffer(geom.normals),
    aTexCoord: ctx.vertexBuffer(geom.uvs),
  },
  indices: ctx.indexBuffer(geom.cells),
  uniforms: {
    uProjectionMatrix: camera.projectionMatrix,
    uViewMatrix: camera.viewMatrix,
    uTexture: ctx.texture2D({
      data: img.data || img,
      width: img.width,
      height: img.height,
      flipY: true,
      pixelFormat: ctx.PixelFormat.RGBA8,
      encoding: ctx.Encoding.Linear,
      min: ctx.Filter.LinearMipmapLinear,
      mag: ctx.Filter.Linear,
      aniso: 16,
      mipmap: true,
    }),
  },
};

const drawLinesCmd = {
  name: "DrawLinesCmd",
  pipeline: ctx.pipeline({
    vert: /*glsl*/ `#version 300 es
      in vec3 aPosition;
      uniform mat4 uProjectionMatrix;
      uniform mat4 uViewMatrix;

      void main () {
        gl_Position = uProjectionMatrix * uViewMatrix * vec4(aPosition, 1.0);
      }
    `,
    frag: /*glsl*/ `#version 300 es
      precision highp float;
      layout (location = 0) out vec4 outColor;
      layout (location = 1) out vec4 outNormal;
      layout (location = 2) out vec4 outUv;
      void main() {
        outColor = vec4(1.0);
        outNormal = vec4(0.0, 0.0, 1.0, 1.0);
        outUv = vec4(0.0, 1.0, 0.0, 1.0);
      }
   `,
    depthTest: true,
    primitive: ctx.Primitive.Lines,
  }),
  attributes: {
    aPosition: ctx.vertexBuffer(lineGeom.positions.flat()),
  },
  count: lineGeom.positions.length,
  uniforms: {
    uProjectionMatrix: camera.projectionMatrix,
    uViewMatrix: camera.viewMatrix,
  },
};

const onResize = () => {
  const W = window.innerWidth;
  const H = window.innerHeight;
  ctx.set({ width: W, height: H });
  camera.set({ aspect: W / H });
};
window.addEventListener("resize", onResize);
onResize();

console.log('WTF')

ctx.frame(() => {
  if (firstFrame) {
    firstFrame = false;
    initTextures();
  }

  //capture

  ctx.submit(capturePassCmd, () => {
    ctx.submit(drawCmd, {
      uniforms: {
        uProjectionMatrix: camera.projectionMatrix,
        uViewMatrix: camera.viewMatrix,
      },
    });
  })

  ctx.submit(captureAndResolvePassCmd, () => {
    ctx.submit(drawLinesCmd, {
      uniforms: {
        uProjectionMatrix: camera.projectionMatrix,
        uViewMatrix: camera.viewMatrix,
      },
    });
  });

  ctx.submit(drawTextureCmd, {
    uniforms: {
      uTexture: colorMap,
    },
    viewport: [0, 0, ctx.gl.canvas.width, ctx.gl.canvas.height],
  });

  const w = ctx.gl.canvas.width / 4
  const h = ctx.gl.canvas.height / 4
  ctx.submit(drawTextureCmd, {
    uniforms: {
      uTexture: colorMap,
    },
    viewport: [0, 0, w, h],
  });

  ctx.submit(drawTextureCmd, {
    uniforms: {
      uTexture: normalMap,
    },
    viewport: [w, 0, w, h],
  });

  ctx.submit(drawTextureCmd, {
    uniforms: {
      uTexture: uvMap,
    },
    viewport: [w*2, 0, w, h],
  });

  ctx.submit(drawTextureCmd, {
    uniforms: {
      uTexture: depthMap,
    },
    viewport: [w*3, 0, w, h],
  });

  ctx.debug(false);


  window.dispatchEvent(new CustomEvent("screenshot"));

  return false
});
