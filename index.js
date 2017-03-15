const Context = require('./Context')
// TODO: get rid of Ramda
const R = require('ramda')
const log = require('debug')('context')
// const viz = require('viz.js')
const isBrowser = require('is-browser')

// command documentation
// vert: String
// frag: String
// program: Program
// clearColor: [r:Float, g:Float, b:Float, a:Float]
// clearDepth: Float
// depthEnable: Boolean
// vertexLayout: [
//    [ name:String, location:Int, size:Int],
//    ...
// ],
// attributes: [
//   ?
// ]

let ID = 0

function createContext (gl) {
  const PixelFormat = {
    RGBA8: 'rgba8', // gl.RGBA + gl.UNSIGNED_BYTE
    RGBA32F: 'rgba32f', // gl.RGBA + gl.FLOAT
    Depth: 'depth' // gl.DEPTH_COMPONENT
  }

  const BlendFactor = {
    One: gl.ONE,
    Zero: gl.ZERO,
    SrcAlpha: gl.SRC_ALPHA,
    OneMinusSrcAlpha: gl.ONE_MINUS_SRC_ALPHA
  }

  const Face = {
    Front: gl.FRONT,
    Back: gl.BACK,
    FrontAndBack: gl.FRONT_AND_BACK
  }

  const ctx = new Context(gl)

  const defaultState = {
    clearColor: [0, 0, 0, 1],
    clearDepth: 1,
    program: undefined,
    framebuffer: undefined,
    attribures: undefined,
    vertexLayout: undefined,
    viewport: [0, 0, gl.drawingBufferWidth, gl.drawingBufferHeight],
    depthEnable: false,
    blendEnabled: false,
    cullFaceEnabled: false,
    cullFace: Face.Back,
    activeTextures: []
  }

  return {
    gl: gl,
    ctx: ctx,
    PixelFormat: PixelFormat,
    BlendFactor: BlendFactor,
    Face: Face,
    debugMode: false,
    debugGraph: '',
    debugCommands: [],
    resources: [],
    stack: [ defaultState ],
    state: Object.assign({}, defaultState),
    getGLString: function (glEnum) {
      let str = 'UNDEFINED'
      Object.keys(gl).forEach((key) => {
        if (gl[key] === glEnum) str = key
      })
      return str
    },
    debug: function (enabled) {
      this.debugMode = enabled
      if (enabled) {
        this.debuggraph = ''
        this.debugCommands = []
        if (isBrowser) {
          window.R = R
          window.commands = this.debugCommands
        }
        this.debugGraph = ''
        this.debugGraph += 'digraph frame {\n'
        this.debugGraph += 'size="6,12";\n'
        this.debugGraph += 'rankdir="LR"\n'
        this.debugGraph += 'node [shape=record];\n'
        if (this.debugMode) {
          const res = this.resources.map((res) => {
            return { id: res.id, type: res.id.split('_')[0] }
          })
          const groups = R.groupBy(R.prop('type'), res)
          Object.keys(groups).forEach((g) => {
            this.debugGraph += `subgraph cluster_${g} { \n`
            this.debugGraph += `label = "${g}s" \n`
            groups[g].forEach((res) => {
              this.debugGraph += `${res.id} [style=filled fillcolor = "#DDDDFF"] \n`
            })
            this.debugGraph += `} \n`
          })
        }
      } else {
        if (this.debugGraph) {
          this.debugGraph += 'edge  [style=bold, fontname="Arial", weight=100]\n'
          this.debugCommands.forEach((cmd, i, commands) => {
            if (i > 0) {
              const prevCmd = commands[i - 1]
              this.debugGraph += `${prevCmd.name || prevCmd.id} -> ${cmd.name || cmd.id}\n`
            }
          })
          this.debugGraph += '}'
          // log(this.debugGraph)
          // const div = document.createElement('div')
          // div.innerHTML = viz(this.debugGraph)
          // div.style.position = 'absolute'
          // div.style.top = '0'
          // div.style.left = '0'
          // div.style.transformOrigin = '0 0'
          // div.style.transform = 'scale(0.75, 0.75)'
          // document.body.appendChild(div)
        }
      }
    },
    // texture2D({ data: TypedArray, width: Int, height: Int, format: PixelFormat })
    texture2D: function (opts) {
      log('texture2D', opts)
      if (opts.src) {
        const res = this.ctx.createTexture2D(opts, opts.width, opts.height, opts)
        res.id = 'texture2D_' + ID++
        this.resources.push(res)
        return res
      } else if (typeof opts === 'object' && (!opts.data || opts.data instanceof Uint8Array || opts.data instanceof Float32Array) && opts.width && opts.height) {
        if (opts.format) {
          if (opts.format === PixelFormat.Depth) {
            opts.format = ctx.DEPTH_COMPONENT
            opts.type = ctx.UNSIGNED_SHORT
          } else if (opts.format === PixelFormat.RGBA32F) {
            opts.format = ctx.RGBA
            opts.type = ctx.FLOAT
          } else {
            throw new Error(`Unknown texture pixel format "${opts.format}"`)
          }
        } else if (opts.type) {
          throw new Error(`Texture2D type not supported. Use format:PixelFormat instead`)
        }
        const res = this.ctx.createTexture2D(opts.data, opts.width, opts.height, opts)
        res.id = 'texture2D_' + ID++
        this.resources.push(res)
        return res
      } else {
        throw new Error('Invalid parameters. Object { data: Uint8Array/Float32Array, width: Int, height: Int} required.')
      }
    },
    // textureCube({ width: Int, height: Int, format: PixelFormat })
    textureCube: function (opts) {
      log('textureCube', opts)
      const res = this.ctx.createTextureCube(opts.data, opts.width, opts.height, opts)
      res.id = 'textureCube_' + ID++
      this.resources.push(res)
      return res
    },
    // framebuffer({ color: [ Texture2D, .. ], depth: Texture2D }
    // framebuffer({ color: [ { texture: Texture2D, target: Enum, level: int }, .. ], depth: { texture: Texture2D }})
    framebuffer: function (opts) {
      if (opts.depth && !opts.depth.texture) {
        opts.depth = { texture: opts.depth }
      }
      opts.color = opts.color.map((attachment) => {
        return attachment.texture ? attachment : { texture: attachment }
      })
      const res = this.ctx.createFramebuffer(opts.color, opts.depth)
      res.id = 'fbo_' + ID++
      this.resources.push(res)
      return res
    },
    // TODO: Should we have named versions or generic 'ctx.buffer' command?
    // In regl buffer() is ARRAY_BUFFER (aka VertexBuffer) and elements() is ELEMENTS_ARRAY_BUFFER
    // Now in WebGL2 we get more types Uniform, TransformFeedback, Copy
    // Possible options: {
    //    data: Array or ArrayBuffer
    //    type: 'float', 'uint16' etc
    // }
    vertexBuffer: function (data) {
      // FIXME: don't flatten if unnecesary
      log('vertexBuffer', data, Array.isArray(data))
      if (Array.isArray(data)) {
        data = R.flatten(data)
      }
      data = new Float32Array(data)
      const res = this.ctx.createBuffer(gl.ARRAY_BUFFER, data, gl.STATIC_DRAW, true)
      res.id = 'vertexBuffer_' + ID++
      this.resources.push(res)
      return res
    },
    elementsBuffer: function (data) {
      if (Array.isArray(data)) {
        data = R.flatten(data)
      }
      data = new Uint16Array(data)
      // FIXME: don't flatten if unnecesary
      const res = this.ctx.createBuffer(gl.ELEMENT_ARRAY_BUFFER, data, gl.STATIC_DRAW, true)
      res.id = 'elementsBuffer_' + ID++
      this.resources.push(res)
      return res
    },
    program: function (vert, frag, vertexLayout) {
      const res = this.ctx.createProgram(vert, frag, vertexLayout)
      res.id = 'program_' + ID++
      this.resources.push(res)
      return res
    },
    readPixels: function (opts) {
      const x = opts.x || 0
      const y = opts.y || 0
      const width = opts.width
      const height = opts.height
      // TODO: add support for data out
      const format = gl.RGBA
      const type = gl.UNSIGNED_BYTE
      // const type = this.state.framebuffer ? gl.FLOAT : gl.UNSIGNED_BYTE
      // if (!opts.format) {
        // throw new Error('ctx.readPixels required valid pixel format')
      // }

      let pixels = null
      // if (type === gl.FLOAT) {
        // pixels = new Float32Array(width * height * 4)
      // } else {
      pixels = new Uint8Array(width * height * 4)
      // }
      gl.readPixels(x, y, width, height, format, type, pixels)
      return pixels
    },
    command: function (spec) {
      const cmd = Object.assign({}, spec)

      const allowedProps = [
        'name',
        'framebuffer', 'clearColor', 'clearDepth', 'viewport',
        'vert', 'frag', 'uniforms',
        'vertexLayout', 'attributes', 'elements',
        'count', 'primitive', 'offset', // TODO: not yet supported but needed for GLTF
        'depthEnable',
        'blendEnabled', 'blendSrcRGBFactor', 'blendSrcAlphaFactor', 'blendDstRGBFactor', 'blendDstAlphaFactor',
        'cullFaceEnabled', 'cullFace'
      ]

      Object.keys(cmd).forEach((prop) => {
        if (allowedProps.indexOf(prop) === -1) {
          throw new Error(`pex.context.command Unknown prop "${prop}"`)
        }
      })

      if (spec.vert && spec.frag) {
        if (!spec.vertexLayout) {
          if (!spec.attributes) {
            log('Invalid command spec', spec)
            throw new Error('Invalid command. Vert and Frag exists but VertexLayout is missing. Provide vertexLayout or attributes.')
          } else {
            // TODO: derive vertex layout from attributes. Should we default to shader locations instead? In WebGL2 shader can bind locations itself..
          }
        }
        if (!spec.vertexLayout) {
          log('Invalid command spec', spec)
          throw new Error('Invalid command. Missing vertexLayout')
        }
        cmd.program = this.program(spec.vert, spec.frag, R.pluck(0, spec.vertexLayout))
        // log('uniforms', cmd.program._uniforms)
      }
      cmd.id = 'command_' + ID++
      return cmd
    },
    // TODO: should data be Array and buffer be TypedArray
    // update(texture, { data: TypeArray, [width: Int, height: Int] })
    // update(texture, { data: TypedArray })
    update: function (resource, opts) {
      if (this.debugMode) log('update', { resource: resource, opts: opts })
      if (typeof opts === 'object') {
        if (opts.data instanceof Uint8Array
         || opts.data instanceof Float32Array
         || opts.data instanceof Uint16Array
          // TODO
         // || opts.data instanceof window.HTMLImageElement
         // || opts.data instanceof window.HTMLCanvasElement
         // || opts.data instanceof window.HTMLVideoElement
        ) {
          if (opts.data.length && isNaN(opts.data[0])) {
            throw new Error('Trying to update resource with NaN data')
          }
          resource.update(opts)
        } else if (opts.buffer instanceof Uint8Array || opts.buffer instanceof Float32Array || opts.buffer instanceof Uint16Array) {
          if (opts.buffer.byteLength && isNaN(opts.buffer[0])) {
            throw new Error('Trying to update resource with NaN data')
          }
          resource.update(opts)
        } else {
          throw new Error('Only typed arrays or html elements are supported for updating GPU resources')
        }
      } else {
        throw new Error('Invalid parameters')
      }
    },
    // TODO: i don't like this inherit flag
    mergeCommands: function (parent, cmd, inherit) {
      // copy old state so we don't modify it's internals
      const newCmd = Object.assign({}, parent)

      if (!inherit) {
        // clear values are not merged as they are applied only in the parent command
        newCmd.clearColor = undefined
        newCmd.clearDepth = undefined
      }

      // overwrite properties from new command
      Object.assign(newCmd, cmd)

      // merge uniforms
      newCmd.uniforms = Object.assign({}, parent.uniforms, cmd.uniforms)
      return newCmd
    },
    // TODO: switching to lightweight resources would allow to just clone state
    // and use commands as state modifiers?
    applyCommand: function (cmd) {
      const gl = this.gl
      const state = this.state
      const ctx = this.ctx

      if (this.debugMode) log('apply', cmd.name || cmd.id, { cmd: cmd, state: state })

      let clearBits = 0
      if (cmd.framebuffer !== state.framebuffer) {
        state.framebuffer = cmd.framebuffer
        ctx.bindFramebuffer(state.framebuffer)
        if (this.debugMode) log('\\ bindFramebuffer new', state.framebuffer)
      }

      if (cmd.viewport !== state.viewport) {
        state.viewport = cmd.viewport
        this.ctx.setViewport(state.viewport[0], state.viewport[1], state.viewport[2], state.viewport[3])
      }

      // log('submit', cmd)

      if (cmd.clearColor !== undefined) {
        if (this.debugMode) log('clearing color', cmd.clearColor)
        clearBits |= gl.COLOR_BUFFER_BIT
        // TODO this might be unnecesary but we don't know because we don't store the clearColor in state
        gl.clearColor(cmd.clearColor[0], cmd.clearColor[1], cmd.clearColor[2], cmd.clearColor[3])
      }

      if (cmd.clearDepth !== undefined) {
        clearBits |= gl.DEPTH_BUFFER_BIT
        // TODO this might be unnecesary but we don't know because we don't store the clearDepth in state
        gl.clearDepth(cmd.clearDepth)
      }

      if (clearBits) {
        gl.clear(clearBits)
      }

      if (cmd.depthEnable !== state.depthEnable) {
        state.depthEnable = cmd.depthEnable
        state.depthEnable ? gl.enable(gl.DEPTH_TEST) : gl.disable(gl.DEPTH_TEST)
      }

      if (cmd.blendEnabled !== state.blendEnabled) {
        state.blendEnabled = cmd.blendEnabled
        state.blendSrcRGBFactor = cmd.blendSrcRGBFactor
        state.blendSrcAlphaFactor = cmd.blendSrcAlphaFactor
        state.blendDstRGBFactor = cmd.blendDstRGBFactor
        state.blendDstAlphaFactor = cmd.blendDstAlphaFactor
        state.blendEnabled ? gl.enable(gl.BLEND) : gl.disable(gl.BLEND)
        if (state.blendEnabled) {
          gl.blendFuncSeparate(
            state.blendSrcRGBFactor,
            state.blendDstRGBFactor,
            state.blendSrcAlphaFactor,
            state.blendDstAlphaFactor
          )
        }
      }

      if (cmd.cullFaceEnabled !== state.cullFaceEnabled) {
        state.cullFaceEnabled = cmd.cullFaceEnabled
        state.cullFaceEnabled ? gl.enable(gl.CULL_FACE) : gl.disable(gl.CULL_FACE)
        if (state.cullFaceEnabled) {
          gl.cullFace(state.cullFace)
        }
      }

      // TODO: depthMask: false, depthWrite?

      if (cmd.program !== state.program) {
        state.program = cmd.program
        if (state.program) {
          gl.useProgram(state.program._handle)
        }
      }

      function drawVertexData (vertexLayout, vertexData) {
        if (!state.program) {
          throw new Error('Trying to draw without an active program')
        }
        let numTextures = 0
        const requiredUniforms = Object.keys(state.program._uniforms)
        Object.keys(cmd.uniforms).forEach((name) => {
          let value = cmd.uniforms[name]
          if (typeof value === 'function') {
            throw new Error('Function uniforms are deprecated')
          }
          // TODO: find a better way to not trying to set unused uniforms that might have been inherited
          if (!state.program._uniforms[name] && !state.program._uniforms[name + '[0]']) {
            return
          }
          if (value === null || value === undefined) {
            log('invalid command', cmd)
            throw new Error(`Can set uniform "${name}" with a null value`)
          }
          // FIXME: uniform array hack
          if (Array.isArray(value) && !state.program._uniforms[name]) {
            if (this.debugMode) log('unknown uniform', name, Object.keys(state.program._uniforms))
            value.forEach((val, i) => {
              var nameIndex = `${name}[${i}]`
              state.program.setUniform(nameIndex, val)
              requiredUniforms.splice(requiredUniforms.indexOf(nameIndex), 1)
            })
          } else if (value.getTarget) {
            // FIXME: texture binding hack
            const slot = numTextures++
            gl.activeTexture(gl.TEXTURE0 + slot)
            if (state.activeTextures[slot] !== value.id) {
              gl.bindTexture(value._target, value._handle)
              state.activeTextures[slot] = value.id
            }
            state.program.setUniform(name, slot)
            requiredUniforms.splice(requiredUniforms.indexOf(name), 1)
          } else if (!Array.isArray(value) && typeof value === 'object') {
            log('invalid command', cmd)
            throw new Error(`Can set uniform "${name}" with an Object value`)
          } else {
            state.program.setUniform(name, value)
            requiredUniforms.splice(requiredUniforms.indexOf(name), 1)
          }
        })
        if (requiredUniforms.length > 0) {
          log('invalid command', cmd)
          throw new Error(`Trying to draw with missing uniforms: ${requiredUniforms.join(', ')}`)
        }

        if (vertexLayout.length !== Object.keys(state.program._attributes).length) {
          log('Invalid vertex layout not matching the shader', vertexLayout, state.program._attributes, cmd)
          throw new Error('Invalid vertex layout not matching the shader')
        }

        let instanced = false
        // TODO: disable unused vertex array slots
        // TODO: disable divisor if attribute not instanced?
        // for (var i = 0; i < 16; i++) {
          // gl.disableVertexAttribArray(i)
        // }

        // TODO: the same as i support [tex] and { texture: tex } i should support buffers in attributes?
        vertexLayout.forEach((layout, i) => {
          const name = layout[0]
          const location = layout[1]
          const size = layout[2]
          const attrib = vertexData.attributes[i] || vertexData.attributes[name]

          if (!attrib || !attrib.buffer) {
            log('Invalid command', cmd, 'doesn\'t satisfy vertex layout', vertexLayout)
            throw new Error(`Command is missing attribute "${name}" at location ${location} with ${attrib}`)
          }

          if (attrib.buffer._length === 0) {
            log('Invalid command', cmd)
            throw new Error(`Trying to draw arrays with no data for attribute : ${name}`)
          }

          if (!attrib.buffer || !attrib.buffer._target) {
            log('Invalid command', cmd)
            throw new Error(`Trying to draw arrays with invalid buffer for attribute : ${name}`)
          }
          gl.bindBuffer(attrib.buffer._target, attrib.buffer._handle)
          gl.enableVertexAttribArray(location)
          // logSometimes('drawVertexData', name, location, attrib.buffer._length)
          gl.vertexAttribPointer(
            location,
            size,
            attrib.buffer._type || gl.FLOAT,
            attrib.normalized || false,
            attrib.stride || 0,
            attrib.offset || 0
          )
          if (attrib.divisor) {
            gl.vertexAttribDivisor(location, attrib.divisor)
            instanced = true
          }
          // TODO: how to match index with vertexLayout location?
        })

        var primitive = gl.TRIANGLES
        if (cmd.primitive === 'lines') primitive = gl.LINES
        if (vertexData.elements) {
          if (!vertexData.elements.buffer || !vertexData.elements.buffer._target) {
            log('Invalid command', cmd)
            throw new Error(`Trying to draw arrays with invalid buffer for elements`)
          }
          gl.bindBuffer(vertexData.elements.buffer._target, vertexData.elements.buffer._handle)
          var count = vertexData.elements.buffer._length
          // TODO: support for unint32 type
          // TODO: support for offset
          if (instanced) {
            // TODO: check if instancing available
            gl.drawElementsInstanced(primitive, count, gl.UNSIGNED_SHORT, 0, cmd.instances)
          } else {
            gl.drawElements(primitive, count, gl.UNSIGNED_SHORT, 0)
          }
        } else if (cmd.count) {
          if (instanced) {
            // TODO: check if instancing available
            gl.drawElementsInstanced(primitive, 0, cmd.count, cmd.instances)
          } else {
            gl.drawArrays(primitive, 0, cmd.count)
          }
        } else {
          throw new Error('Vertex arrays requres elements or count to draw')
        }
        // if (self.debugMode) {
          // var error = gl.getError()
          // cmd.error = { code: error, msg: self.getGLString(error) }
          // if (error) {
            // self.debugCommands.push(cmd)
            // throw new Error(`WebGL error ${error} : ${self.getGLString(error)}`)
          // }
          // log('draw elements', count, error)
        // }
      }

      if (cmd.vertexLayout) {
        state.vertexLayout = cmd.vertexLayout
      }

      if (cmd.attributes) {
        // TODO: add check if available
        drawVertexData(this.state.vertexLayout, cmd)
      }
    },
    submit: function (cmd, batches, subCommand) {
      if (this.debugMode) {
        this.debugCommands.push(cmd)
        if (batches && subCommand) log('submit', cmd.name || cmd.id, { depth: this.stack.length, cmd: cmd, batches: batches, subCommand: subCommand, state: this.state, stack: this.stack })
        else if (batches) log('submit', cmd.name || cmd.id, { depth: this.stack.length, cmd: cmd, batches: batches, state: this.state, stack: this.stack })
        else log('submit', cmd.name || cmd.id, { depth: this.stack.length, cmd: cmd, state: this.state, stack: this.stack })
      }

      if (batches) {
        if (Array.isArray(batches)) {
          // TODO: quick hack
          batches.forEach((batch) => this.submit(this.mergeCommands(cmd, batch, true), subCommand))
          return
        } else if (typeof batches === 'object') {
          this.submit(this.mergeCommands(cmd, batches, true), subCommand)
          return
        } else {
          subCommand = batches // shift argument
        }
      }

      // this.pushState()
      const parentState = this.stack[this.stack.length - 1]
      const cmdState = this.mergeCommands(parentState, cmd, false)
      this.applyCommand(cmdState)
      if (subCommand) {
        if (this.debugMode) {
          this.debugGraph += `subgraph cluster_${cmd.name || cmd.id} {\n`
          this.debugGraph += `label = "${cmd.name}"\n`
          if (cmd.program) {
            this.debugGraph += `${cmd.program.id} -> cluster_${cmd.name || cmd.id}\n`
          }
          if (cmd.framebuffer) {
            this.debugGraph += `${cmd.framebuffer.id} -> cluster_${cmd.name || cmd.id}\n`
            cmd.framebuffer._colorAttachments.forEach((attachment) => {
              this.debugGraph += `${attachment.texture.id} -> ${cmd.framebuffer.id}\n`
            })
            if (cmd.framebuffer._depthAttachment) {
              this.debugGraph += `${cmd.framebuffer._depthAttachment.texture.id} -> ${cmd.framebuffer.id}\n`
            }
          }
        }
        this.stack.push(cmdState)
        subCommand()
        this.stack.pop()
        if (this.debugMode) {
          this.debugGraph += '}\n'
        }
      } else {
        if (this.debugMode) {
          let s = `${cmd.name || cmd.id} [style=filled fillcolor = "#DDFFDD" label="`
          let cells = [cmd.name || cmd.id]
          // this.debugGraph += `cluster_${cmd.name || cmd.id} [style=filled fillcolor = "#DDFFDD"] {\n`
          if (cmd.attributes) {
            cells.push(' ')
            cells.push('vertex arrays')
            Object.keys(cmd.attributes).forEach((attribName, index) => {
              const attrib = cmd.attributes[attribName]
              cells.push(`<a${index}>${attribName}`)
              this.debugGraph += `${attrib.buffer.id} -> ${cmd.name || cmd.id}:a${index}\n`
            })
          }
          if (cmd.elements) {
            cells.push(' ')
            cells.push(`<e>elements`)
            this.debugGraph += `${cmd.elements.buffer.id} -> ${cmd.name || cmd.id}:e\n`
          }
          // if (cmd.program) {
            // this.debugGraph += `${cmd.program.id} -> ${cmd.name || cmd.id}\n`
          // }
          // if (cmd.framebuffer) {
            // this.debugGraph += `${cmd.framebuffer.id} -> ${cmd.name || cmd.id}\n`
            // cmd.framebuffer.color.forEach((tex) => {
              // console.log('tex', tex)
            // })
          // }
          if (cmd.uniforms) {
            cells.push(' ')
            cells.push('uniforms')
            Object.keys(cmd.uniforms).forEach((uniformName, index) => {
              cells.push(`<u${index}>${uniformName}`)
              const value = cmd.uniforms[uniformName]
              if (value === null || value === undefined) {
                log('Invalid command', cmd)
                throw new Error(`Trying to draw with uniform "${uniformName}" = null`)
              }
              if (value.id) {
                this.debugGraph += `${value.id} -> ${cmd.name || cmd.id}:u${index}\n`
              }
            })
          }
          s += cells.join('|')
          s += '"]'
          this.debugGraph += `${s}\n`
        }
      }
      // this.popState()
    }
  }
}

module.exports = createContext
