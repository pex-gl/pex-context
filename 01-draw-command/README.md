Draw Command based renderer / architecture

## Rationale

Instead of saying:

> set line width to 2, set color to red, draw rect (and remember what I’ve just told you)

You say:

> draw({ shape: red, width: 2, color: red})

And you can save that state objects, replay them, drop them, filter them, log them...

So more game engine like, more functional, more virtual dom like, less hidden state dragging around.


## References

**Cesium**
http://cesiumjs.org/2015/05/15/Graphics-Tech-in-Cesium-Architecture/
http://cesiumjs.org/2015/05/26/Graphics-Tech-in-Cesium-Stack/

Context http://www.personal.psu.edu/kyn5050/Documentation/Context.html#createRenderState
RenderState https://github.com/AnalyticalGraphicsInc/cesium/blob/b26/Source/Renderer/RenderState.js
VertexArray http://www.personal.psu.edu/kyn5050/Documentation/VertexArray.html
Framebuffer http://www.personal.psu.edu/kyn5050/Documentation/Framebuffer.html
Example draw command https://github.com/AnalyticalGraphicsInc/cesium/blob/5d86b185d92ff8bbece8e7389b0bb171f9fa38e8/Source/Scene/Sun.js#L75


## Issues / Questions

- Where to put texture sampler state?
- How to do FBO PingPong -  draw commands that are identical but with FBO changing multiple times during the frame


