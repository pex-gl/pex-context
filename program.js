import { NAMESPACE } from "./utils.js";

const builtInAttributes = [
  "gl_VertexID",
  "gl_InstanceID",
  "gl_DrawID",
  "gl_BaseVertex",
  "gl_BaseInstance",
];

function createProgram(ctx, opts) {
  const gl = ctx.gl;

  const program = {
    class: "program",
    handle: gl.createProgram(),
    attributes: [],
    attributesPerLocation: {},
    uniforms: {},
    refCount: 0,
    _update: updateProgram,
    _dispose() {
      gl.deleteProgram(this.handle);
      this.handle = null;
      this.attributes = null;
      this.attributesPerLocation = null;
      this.uniforms = null;
    },
    setUniform(name, value) {
      const uniform = this.uniforms[name];
      if (uniform === undefined) {
        throw new Error(`Uniform ${name} is not defined`);
      }

      const gl = ctx.gl;
      const type = uniform.type;
      const location = uniform.location;

      const uniformMethod = ctx.UniformMethod[uniform.type];

      if (!uniformMethod) {
        throw new Error(
          `Invalid uniform type ${type} : ${ctx.getGLString(type)}`,
        );
      } else if (uniformMethod.includes("Matrix")) {
        gl[uniformMethod](location, false, value);
      } else {
        gl[uniformMethod](location, value);
      }
    },
  };

  updateProgram(ctx, program, opts);

  return program;
}

function updateProgram(ctx, program, { vert, frag, vertexLayout }) {
  console.assert(
    typeof vert === "string",
    "Vertex shader source must be a string",
  );
  console.assert(
    typeof frag === "string",
    "Fragment shader source must be a string",
  );

  const gl = ctx.gl;
  const vertShader = compileSource(ctx, gl.VERTEX_SHADER, vert);
  const fragShader = compileSource(ctx, gl.FRAGMENT_SHADER, frag);

  // TODO: implement custom vertex layouts
  // gl.bindAttribLocation(program, location, attributeName)

  if (vertexLayout) {
    for (let [name, attribute] of Object.entries(vertexLayout)) {
      gl.bindAttribLocation(program.handle, attribute.location, name);
    }
  }

  gl.attachShader(program.handle, vertShader);
  gl.attachShader(program.handle, fragShader);
  gl.linkProgram(program.handle);

  if (!gl.getProgramParameter(program.handle, gl.LINK_STATUS)) {
    throw new Error(`Program: ${gl.getProgramInfoLog(program.handle)}`);
  }

  gl.deleteShader(vertShader);
  gl.deleteShader(fragShader);

  updateUniforms(ctx, program);
  updateAttributes(ctx, program);
}

function compileSource(ctx, type, src) {
  const gl = ctx.gl;
  const shader = gl.createShader(type);

  gl.shaderSource(shader, `${src}\n`);
  gl.compileShader(shader);
  if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
    const shaderType = type === gl.VERTEX_SHADER ? "Vertex" : "Fragment";
    if (ctx.debugMode) {
      console.debug(NAMESPACE, `${shaderType} shader compilation failed`, src);
    }
    throw new Error(
      `${shaderType} shader error: ${gl.getShaderInfoLog(shader)}`,
    );
  }
  return shader;
}

function updateUniforms(ctx, program) {
  const gl = ctx.gl;

  program.uniforms = {};

  const numUniforms = gl.getProgramParameter(
    program.handle,
    gl.ACTIVE_UNIFORMS,
  );
  for (let i = 0; i < numUniforms; ++i) {
    const info = gl.getActiveUniform(program.handle, i);
    const name = info.name;

    const size = ctx.UniformSize[info.type];

    if (size === undefined) {
      throw new Error(
        `Unknwon uniform type ${info.type} : ${ctx.getGLString(info.type)}`,
      );
    }

    program.uniforms[name] = {
      name,
      type: info.type,
      size,
      location: gl.getUniformLocation(program.handle, name),
    };
    if (info.size > 1) {
      for (let j = 1; j < info.size; j++) {
        const indexedName = `${
          info.name.substr(0, info.name.indexOf("[") + 1) + j
        }]`;
        program.uniforms[indexedName] = {
          type: info.type,
          location: gl.getUniformLocation(program.handle, indexedName),
        };
      }
    }
  }
}

function updateAttributes(ctx, program) {
  const gl = ctx.gl;

  program.attributes = {};
  program.attributesPerLocation = {};

  const numAttributes = gl.getProgramParameter(
    program.handle,
    gl.ACTIVE_ATTRIBUTES,
  );
  for (let i = 0; i < numAttributes; ++i) {
    const info = gl.getActiveAttrib(program.handle, i);
    const name = info.name;
    const size = ctx.AttributeSize[info.type];

    if (builtInAttributes.includes(name)) {
      continue;
    }

    if (size === undefined) {
      throw new Error(
        `Unknwon uniform type ${info.type} : ${ctx.getGLString(info.type)}`,
      );
    }
    const attrib = {
      name,
      type: info.type,
      size,
      location: gl.getAttribLocation(program.handle, name),
    };
    program.attributes[name] = attrib;
    program.attributesPerLocation[attrib.location] = attrib;
  }
}

export default createProgram;
