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
https://github.com/AnalyticalGraphicsInc/cesium/wiki/Data-Driven-Renderer-Details  
http://cesiumjs.org/2015/05/15/Graphics-Tech-in-Cesium-Architecture/  
http://cesiumjs.org/2015/05/26/Graphics-Tech-in-Cesium-Stack/  
http://cesiumjs.org/2015/05/14/Graphics-Tech-in-Cesium/  

Context http://www.personal.psu.edu/kyn5050/Documentation/Context.html#createRenderState  
RenderState https://github.com/AnalyticalGraphicsInc/cesium/blob/b26/Source/Renderer/RenderState.js  
VertexArray http://www.personal.psu.edu/kyn5050/Documentation/VertexArray.html  
Framebuffer http://www.personal.psu.edu/kyn5050/Documentation/Framebuffer.html  
Example draw command https://github.com/AnalyticalGraphicsInc/cesium/blob/5d86b185d92ff8bbece8e7389b0bb171f9fa38e8/Source/Scene/Sun.js#L75  

**BGFX**  
Renderer API https://github.com/bkaradzic/bgfx/blob/master/src/bgfx_p.h#L1847  
RenderDraw aka Draw Command https://github.com/bkaradzic/bgfx/blob/master/src/bgfx_p.h#L1058  
Renderer submit command https://github.com/bkaradzic/bgfx/blob/master/src/renderer_gl.cpp#L4788  
Sort key https://github.com/bkaradzic/bgfx/blob/master/src/bgfx_p.h#L662  
Example of kind of 'immediate api' https://github.com/bkaradzic/bgfx/blob/master/examples/01-cubes/cubes.cpp#L180  

Other links  
http://c0de517e.blogspot.co.uk/2014/04/how-to-make-rendering-engine.html  
Designing a Data-Driven Renderer in GPU Pro 3  


**Metal**
```ObjectiveC

	self.skyboxPipeline = [self
	   pipelineForVertexFunctionNamed:@"vertex_skybox"
	   fragmentFunctionNamed:@"fragment_cube_lookup"
	];

    id<MTLRenderCommandEncoder> commandEncoder = [commandBuffer renderCommandEncoderWithDescriptor:renderPass];
        [commandEncoder setFrontFacingWinding:MTLWindingCounterClockwise];
        [commandEncoder setCullMode:MTLCullModeBack];
        
        [self drawSkyboxWithCommandEncoder:commandEncoder];

    (void)drawSkyboxWithCommandEncoder:(id<MTLRenderCommandEncoder>)commandEncoder {
    
    MTLDepthStencilDescriptor *depthDescriptor = [MTLDepthStencilDescriptor new];
    depthDescriptor.depthCompareFunction = MTLCompareFunctionLess;
    depthDescriptor.depthWriteEnabled = NO;
    id <MTLDepthStencilState> depthState = [self.device newDepthStencilStateWithDescriptor:depthDescriptor];

    [commandEncoder setRenderPipelineState:self.skyboxPipeline];
    [commandEncoder setDepthStencilState:depthState];
    [commandEncoder setVertexBuffer:self.skybox.vertexBuffer offset:0 atIndex:0];
    [commandEncoder setVertexBuffer:self.uniformBuffer offset:0 atIndex:1];
    [commandEncoder setFragmentBuffer:self.uniformBuffer offset:0 atIndex:0];
    [commandEncoder setFragmentTexture:self.cubeTexture atIndex:0];
    [commandEncoder setFragmentSamplerState:self.samplerState atIndex:0];

    [commandEncoder drawIndexedPrimitives:MTLPrimitiveTypeTriangle
                               indexCount:[self.skybox.indexBuffer length] / sizeof(UInt16)
                                indexType:MTLIndexTypeUInt16
                              indexBuffer:self.skybox.indexBuffer
                        indexBufferOffset:0];

```

## Issues / Questions

- Where to put texture sampler state?
- How to do FBO PingPong -  draw commands that are identical but with FBO changing multiple times during the frame


