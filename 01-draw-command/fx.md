# FX

Postprocessing effects modelled after `pex-fx`.

Using draw commands allows you to easy chain draw calls that use each other render targets. The code is still quite verbose and using `Stack` could help.

## Example

```javascript
//BLUR H
this.blur3HProgram = new Program(gl, BLIT_VERT, BLUR_3_H_FRAG);

this.blur3HFBO = new Framebuffer(gl, this.width/4, this.height/4);
this.blur3HCmd = new DrawCommand({
  vertexArray: this.quad,
  program: this.blur3HProgram,
  renderState: {
    depthTest: {
      enabled: false
    }
  },
  uniforms: {
    texture: this.downsampleFBO.getColorAttachment(0),
    textureSize: [ this.downsampleFBO.getColorAttachment(0).width, this.downsampleFBO.getColorAttachment(0).height ]
  },
  viewport: [0, 0, this.width/4, this.height/4],
  framebuffer: this.blur3HFBO
});
```

## Issues
- [x] Gamma correct filtering
- [ ] Reconsider `framebuffer.getColorAttachment(0)` API
- [ ] Automagic for uniform texture binding. Currently handled by renderer

# Prev implementation

**pex-fx:**

```javascript
var color = fx().render({ drawFunc: this.drawScene.bind(this)});
var final = color.downsample4();
final.blit({ width: this.width, height: this.height });
```
