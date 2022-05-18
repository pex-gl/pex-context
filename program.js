import assert from "assert";

import { log as debug } from "./utils.js";

const log = debug.extend("program");
log.enabled = true;

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

      switch (uniform.type) {
        case gl.INT:
          gl.uniform1i(location, value);
          break;
        case gl.BOOL:
          gl.uniform1i(location, value);
          break;
        case gl.FLOAT:
          gl.uniform1f(location, value);
          break;
        case gl.FLOAT_VEC2:
          gl.uniform2fv(location, value);
          break;
        case gl.FLOAT_VEC3:
          gl.uniform3fv(location, value);
          break;
        case gl.FLOAT_VEC4:
          gl.uniform4fv(location, value);
          break;
        case gl.FLOAT_MAT2:
          gl.uniformMatrix2fv(location, false, value);
          break;
        case gl.FLOAT_MAT3:
          gl.uniformMatrix3fv(location, false, value);
          break;
        case gl.FLOAT_MAT4:
          gl.uniformMatrix4fv(location, false, value);
          break;
        case gl.SAMPLER_2D:
          gl.uniform1i(location, value);
          break;
        case gl.SAMPLER_CUBE:
          gl.uniform1i(location, value);
          break;
        default:
          throw new Error(
            `Invalid uniform type ${type} : ${ctx.getGLString(type)}`
          );
      }
    },
  };

  updateProgram(ctx, program, opts);

  return program;
}

function updateProgram(ctx, program, { vert, frag, vertexLayout }) {
  assert(typeof vert === "string", "Vertex shader source must be a string");
  assert(typeof frag === "string", "Fragment shader source must be a string");

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
      log(`${shaderType} shader compilation failed`);
      log(src);
    }
    throw new Error(
      `${shaderType} shader error: ${gl.getShaderInfoLog(shader)}`
    );
  }
  return shader;
}

function updateUniforms(ctx, program) {
  const gl = ctx.gl;

  program.uniforms = {};

  const numUniforms = gl.getProgramParameter(
    program.handle,
    gl.ACTIVE_UNIFORMS
  );
  for (let i = 0; i < numUniforms; ++i) {
    const info = gl.getActiveUniform(program.handle, i);
    const name = info.name;
    let size = 0;
    switch (info.type) {
      case gl.INT:
        size = 1;
        break;
      case gl.BOOL:
        size = 1;
        break;
      case gl.FLOAT:
        size = 1;
        break;
      case gl.FLOAT_VEC2:
        size = 2;
        break;
      case gl.FLOAT_VEC3:
        size = 3;
        break;
      case gl.FLOAT_VEC4:
        size = 4;
        break;
      case gl.FLOAT_MAT2:
        size = 4;
        break;
      case gl.FLOAT_MAT3:
        size = 9;
        break;
      case gl.FLOAT_MAT4:
        size = 16;
        break;
      case gl.SAMPLER_2D:
        size = 0;
        break;
      case gl.SAMPLER_CUBE:
        size = 0;
        break;
      default:
        throw new Error(
          `Unknwon attribute type ${info.type} : ${ctx.getGLString(info.type)}`
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
    gl.ACTIVE_ATTRIBUTES
  );
  for (let i = 0; i < numAttributes; ++i) {
    const info = gl.getActiveAttrib(program.handle, i);
    const name = info.name;
    let size = 0;
    switch (info.type) {
      case gl.FLOAT:
        size = 1;
        break;
      case gl.FLOAT_VEC2:
        size = 2;
        break;
      case gl.FLOAT_VEC3:
        size = 3;
        break;
      case gl.FLOAT_VEC4:
        size = 4;
        break;
      case gl.FLOAT_MAT2:
        size = 8;
        break;
      case gl.FLOAT_MAT3:
        size = 12;
        break;
      case gl.FLOAT_MAT4:
        size = 16;
        break;
      default:
        throw new Error(
          `Unknwon attribute type ${info.type} : ${ctx.getGLString(info.type)}`
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
