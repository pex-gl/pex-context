# Rationale

2016-06-16

Currently pex-context is doing what mikolalysenko is called [Conservative Wrapping](https://github.com/mikolalysenko/regl/blob/gh-pages/RATIONALE.md<Paste>) - packaging WebGL state machine into set of utility functions smiliar to [stack.gl](http://stack.gl). `pex-context` additionaly hides `gl` context completely to provide seamless support for extensions and WebGL2 in the future. All function call like `setClearColor`, `bindFramebuffer` work in immediate mode i.e. their effects (and side effects) are effective immediately. That causes a number of problems with state leaking and hard to find bugs. Additionally `pex-context` keeps track of a matrix stack (3 actually) which while convinient seems to be outside of the scope for a rendering core and should be moved to a library like `pex-renderer` or `pex-draw`.

This document is an attempt to design pex-renderer@3 inspired by a draw command queue found in modern engines and 3d apis like Metal or Vulkan.

Goals and benefits we are aiming for:
- explicit state -> no leaking and less bugs due to overrides (e.g. wrong sampling mode)
- step by step debugging
- optimization by command batching, reordering
- optimization by uniform batching and avoiding setting the duplicates

## Previous attempts

While developing [pex-next](https://github.com/pex-gl/pex-next/blob/master/01-draw-command/fx.js) (experiments before pex@1.0) I tried command pattern as below:

```javascript
this.downsampleFBO = new Framebuffer(gl, this.width/4, this.height/4);
    this.downsampleCmd = new DrawCommand({
      vertexArray: this.quad,
      program: this.downsampleProgram,
      renderState: {
        depthTest: {
          enabled: false
        }
      },
      uniforms: {
        //FIXME: This is automagic asssining texture to a next available texture unit.
        //FIXME: How to implement texture sampler objects?
        texture: this.linearFBO.getColorAttachment(0),
        textureSize: [ this.linearFBO.getColorAttachment(0).width, this.colorFBO.getColorAttachment(0).height ]
      },
      viewport: [0, 0, this.width/4, this.height/4],
      framebuffer: this.downsampleFBO
    });
```

Problems:
- very werbose
  - `renderState` sub object might be unnecesary
  - i have ot enable `depthTest` for every mesh
  - i have to define `uProjectionMatrix` for every program and mesh


## Problematic cases

#### Drawing scene to a texture

```javascript
//before
bindFramebuffer(fbo)
drawScene()
unbindFramebuffer()
```

```javascript
//now with commands?
drawScene(fboToInjectInEveryDrawCall)
```

## Ideas from [regel](http://github.com/mikolalysenko/regl)

#### Exectution time command overrides:

```
var cmd = ctx.createCommand({
  mesh: mesh,
  depthTest: true,
  program: pbrProgram,
  uniforms: {
    uProjectionMatrix: projectionMatrix,
    uColor: [1, 1, 1, 1]
  }
})

ctx.submit(cmd, {
  uniforms: {
    uColor: [1, 0, 0, 1]
  }
})
```

#### Sub command scope inheritance

```javascript
//pseudocode
var renderToTexture = regl({ framebbufer: fbo })
var drawScene = regl({ })

renderToTexture(function(context) {
  //no need to inject fbo! we will 'inherit it'
  drawScene()
})
```
